'use client';

import { processService } from '@/services/processes';
import { Process, ProcessStatus, ProcessType } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import {
    FiAlertCircle,
    FiCheckCircle,
    FiChevronDown,
    FiChevronRight,
    FiCircle,
    FiCpu,
    FiPlus,
    FiXCircle,
} from 'react-icons/fi';

interface ProcessTreeProps {
    process: Process;
    selectedProcessId?: string;
    onSelectProcess: (process: Process) => void;
    onAddSubprocess?: (parentProcess: Process) => void;
    level: number;
    expandedProcessIds?: Set<string>;
    onToggleExpand?: (processId: string) => void;
}

const TYPE_ICONS = {
    [ProcessType.MANUAL]: FiCircle,
    [ProcessType.SYSTEMIC]: FiCpu,
};

const STATUS_COLORS = {
    [ProcessStatus.ACTIVE]: 'text-green-500',
    [ProcessStatus.IN_REVIEW]: 'text-yellow-500',
    [ProcessStatus.DEPRECATED]: 'text-red-500',
};

const STATUS_LABELS = {
    [ProcessStatus.ACTIVE]: 'Ativo',
    [ProcessStatus.IN_REVIEW]: 'Em Revisão',
    [ProcessStatus.DEPRECATED]: 'Descontinuado',
};

const TYPE_LABELS = {
    [ProcessType.MANUAL]: 'Manual',
    [ProcessType.SYSTEMIC]: 'Sistêmico',
};

export default function ProcessTree({
    process,
    selectedProcessId,
    onSelectProcess,
    onAddSubprocess,
    level,
    expandedProcessIds,
    onToggleExpand,
}: ProcessTreeProps) {
    const [internalExpanded, setInternalExpanded] = useState(false);

    const isExpanded = expandedProcessIds ? expandedProcessIds.has(process.id) : internalExpanded;

    const { data: children = [], isLoading, refetch } = useQuery<Process[]>({
        queryKey: ['process-children', process.id],
        queryFn: () => processService.getChildren(process.id),
        enabled: isExpanded,
        refetchOnMount: 'always',
    });

    useEffect(() => {
        if (isExpanded) {
            refetch();
        }
    }, [isExpanded, refetch]);

    const hasChildren =
        (process.children && process.children.length > 0) ||
        (process.childrenIds && process.childrenIds.length > 0);
    const canExpand = hasChildren || (isExpanded && children.length > 0);
    const isSelected = selectedProcessId === process.id;

    const TypeIcon = TYPE_ICONS[process.type];
    const statusColor = STATUS_COLORS[process.status];

    const handleToggleExpand = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onToggleExpand) {
            onToggleExpand(process.id);
        } else {
            setInternalExpanded(!internalExpanded);
        }
    };

    const handleSelectProcess = () => {
        if (hasChildren && !isExpanded) {
            if (onToggleExpand) {
                onToggleExpand(process.id);
            } else {
                setInternalExpanded(true);
            }
        }
        onSelectProcess(process);
    };

    const paddingLeft = level * 24;

    return (
        <div>
            <div
                className={`
          flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all group
          ${isSelected ? 'bg-gray-700 border-l-4 border-primary-500' : 'hover:bg-gray-750'}
        `}
                style={{ paddingLeft: `${paddingLeft + 12}px` }}
                onClick={handleSelectProcess}
            >
                {canExpand ? (
                    <button
                        onClick={handleToggleExpand}
                        className="flex items-center justify-center w-5 h-5 hover:bg-gray-600 rounded transition-colors"
                    >
                        {isExpanded ? (
                            <FiChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                            <FiChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                    </button>
                ) : (
                    <div className="w-5" />
                )}

                <div className={`flex items-center justify-center w-6 h-6 ${statusColor}`}>
                    <TypeIcon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                    <p
                        className={`font-medium truncate ${isSelected ? 'text-white' : 'text-gray-200 group-hover:text-white'
                            }`}
                    >
                        {process.name}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <span
                        className={`px-2 py-0.5 rounded text-xs ${process.type === ProcessType.SYSTEMIC
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-purple-500/20 text-purple-400'
                            }`}
                    >
                        {TYPE_LABELS[process.type]}
                    </span>

                    <div className={`flex items-center ${statusColor}`} title={STATUS_LABELS[process.status]}>
                        {process.status === ProcessStatus.ACTIVE && <FiCheckCircle className="w-4 h-4" />}
                        {process.status === ProcessStatus.IN_REVIEW && <FiAlertCircle className="w-4 h-4" />}
                        {process.status === ProcessStatus.DEPRECATED && <FiXCircle className="w-4 h-4" />}
                    </div>

                    {onAddSubprocess && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onAddSubprocess(process);
                            }}
                            className="flex items-center justify-center w-7 h-7 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 hover:text-blue-300 rounded-lg transition-all hover:scale-110"
                            title="Adicionar subprocesso"
                        >
                            <FiPlus className="w-5 h-5 font-bold" />
                        </button>
                    )}
                </div>
            </div>

            {isExpanded && (
                <div className="mt-1">
                    {isLoading ? (
                        <div
                            className="flex items-center gap-2 px-3 py-2 text-gray-400 text-sm"
                            style={{ paddingLeft: `${paddingLeft + 40}px` }}
                        >
                            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                            Carregando...
                        </div>
                    ) : children.length > 0 ? (
                        children.map((child) => (
                            <ProcessTree
                                key={child.id}
                                process={child}
                                selectedProcessId={selectedProcessId}
                                onSelectProcess={onSelectProcess}
                                onAddSubprocess={onAddSubprocess}
                                level={level + 1}
                                expandedProcessIds={expandedProcessIds}
                                onToggleExpand={onToggleExpand}
                            />
                        ))
                    ) : (
                        <div
                            className="px-3 py-2 text-gray-500 text-sm italic"
                            style={{ paddingLeft: `${paddingLeft + 40}px` }}
                        >
                            Nenhum subprocesso
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

