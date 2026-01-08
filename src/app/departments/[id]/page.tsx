'use client';

import ProcessDetailPanel from '@/components/processes/ProcessDetailPanel';
import ProcessModal from '@/components/processes/ProcessModal';
import ProcessTree from '@/components/processes/ProcessTree';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { departmentService } from '@/services/departments';
import { processService } from '@/services/processes';
import { Department, Process } from '@/types';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { FiChevronLeft, FiPlus } from 'react-icons/fi';

export default function DepartmentDetailPage() {
  const params = useParams();
  const departmentId = params.id as string;
  const [selectedProcess, setSelectedProcess] = useState<Process | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [parentProcessForSubprocess, setParentProcessForSubprocess] = useState<Process | null>(null);
  const [expandedProcessIds, setExpandedProcessIds] = useState<Set<string>>(new Set());

  // Fetch department details
  const { data: department, isLoading: isDepartmentLoading } = useQuery<Department>({
    queryKey: ['department', departmentId],
    queryFn: () => departmentService.getById(departmentId),
  });

  // Fetch main processes of the department (paginated)
  const { data: processesData, isLoading: isProcessesLoading } = useQuery({
    queryKey: ['processes', 'department', departmentId],
    queryFn: () => processService.getByDepartment(departmentId, { page: 1, limit: 100 }),
  });

  const processes = processesData?.data || [];

  // Filter processes by search term
  const filteredProcesses = processes.filter((process) =>
    process.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isDepartmentLoading || isProcessesLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!department) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-gray-400 mb-4">Departamento não encontrado</p>
        <Link
          href="/departments"
          className="text-primary-500 hover:text-primary-400 flex items-center"
        >
          <FiChevronLeft className="mr-2" />
          Voltar para Departamentos
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/departments"
          className="text-gray-400 hover:text-gray-200 flex items-center mb-4 transition-colors"
        >
          <FiChevronLeft className="mr-2" />
          Voltar para Departamentos
        </Link>

        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <h1 className="text-3xl font-bold text-gray-100">{department.name}</h1>
            <span className="ml-3 px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm">
              {department.code}
            </span>
          </div>
          <Button onClick={() => setIsProcessModalOpen(true)}>
            <FiPlus className="mr-2" />
            Novo Processo
          </Button>
        </div>

        {department.description && (
          <p className="text-gray-400 mt-2">{department.description}</p>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Process Tree Section */}
        <div className={`flex flex-col ${selectedProcess ? 'w-2/3' : 'w-full'} transition-all duration-300`}>
          <div className="bg-gray-800 rounded-lg border border-gray-700 flex flex-col h-full">
            {/* Search and Title */}
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-xl font-semibold text-gray-100 mb-3">
                Processos de {department.name}
              </h2>
              <input
                type="text"
                placeholder="Buscar processos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Process List */}
            <div className="flex-1 overflow-y-auto p-4">
              {filteredProcesses.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400">
                    {searchTerm
                      ? 'Nenhum processo encontrado com este termo'
                      : 'Nenhum processo cadastrado neste departamento'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredProcesses.map((process) => (
                    <ProcessTree
                      key={process.id}
                      process={process}
                      selectedProcessId={selectedProcess?.id}
                      onSelectProcess={setSelectedProcess}
                      onAddSubprocess={(parentProcess) => {
                        setParentProcessForSubprocess(parentProcess);
                        setIsProcessModalOpen(true);
                      }}
                      level={0}
                      expandedProcessIds={expandedProcessIds}
                      onToggleExpand={(processId) => {
                        setExpandedProcessIds((prev) => {
                          const newSet = new Set(prev);
                          if (newSet.has(processId)) {
                            newSet.delete(processId);
                          } else {
                            newSet.add(processId);
                          }
                          return newSet;
                        });
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Process Detail Panel */}
        {selectedProcess && (
          <ProcessDetailPanel
            key={selectedProcess.id}
            process={selectedProcess}
            onClose={() => setSelectedProcess(null)}
          />
        )}
      </div>

      {/* Process Modal */}
      <ProcessModal
        isOpen={isProcessModalOpen}
        onClose={() => {
          setIsProcessModalOpen(false);
          setParentProcessForSubprocess(null);
        }}
        departmentId={departmentId}
        parentId={parentProcessForSubprocess?.id}
        onSubprocessCreated={(parentId) => {
          // Expand the parent process to show the new subprocess
          setExpandedProcessIds((prev) => {
            const newSet = new Set(prev);
            newSet.add(parentId);
            return newSet;
          });
        }}
      />
    </div>
  );
}
