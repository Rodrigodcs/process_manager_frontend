'use client';

import DocumentModal from '@/components/documents/DocumentModal';
import PersonModal from '@/components/people/PersonModal';
import ToolModal from '@/components/tools/ToolModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { processService } from '@/services/processes';
import { Process, ProcessStatus, ProcessType } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  FiCircle,
  FiCpu,
  FiEdit2,
  FiExternalLink,
  FiFileText,
  FiMail,
  FiMoreVertical,
  FiPlus,
  FiTool,
  FiTrash2,
  FiUsers,
  FiX
} from 'react-icons/fi';
import AddResourceModal from './AddResourceModal';
import ProcessModal from './ProcessModal';

interface ProcessDetailPanelProps {
  process: Process;
  onClose: () => void;
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

const STATUS_BG_COLORS = {
  [ProcessStatus.ACTIVE]: 'bg-green-500/20',
  [ProcessStatus.IN_REVIEW]: 'bg-yellow-500/20',
  [ProcessStatus.DEPRECATED]: 'bg-red-500/20',
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

export default function ProcessDetailPanel({ process, onClose }: ProcessDetailPanelProps) {
  const [addModalState, setAddModalState] = useState<{
    isOpen: boolean;
    type: 'people' | 'tools' | 'documents' | null;
  }>({ isOpen: false, type: null });

  const [viewModalState, setViewModalState] = useState<{
    isOpen: boolean;
    type: 'person' | 'tool' | 'document' | null;
    item: any;
  }>({ isOpen: false, type: null, item: null });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data: detailedProcess, isLoading } = useQuery<Process>({
    queryKey: ['process', process.id],
    queryFn: () => processService.getById(process.id),
  });

  const TypeIcon = TYPE_ICONS[process.type];
  const statusColor = STATUS_COLORS[process.status];
  const statusBgColor = STATUS_BG_COLORS[process.status];

  const tools = detailedProcess?.tools?.map((pt: any) => pt.tool) || [];
  const people = detailedProcess?.people?.map((pp: any) => pp.person) || [];
  const documents = detailedProcess?.documents?.map((pd: any) => pd.document) || [];

  const removeToolMutation = useMutation({
    mutationFn: (toolId: string) => processService.removeTool(process.id, toolId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['process', process.id] });
      toast.success('Ferramenta desvinculada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao desvincular ferramenta');
    },
  });

  const removePersonMutation = useMutation({
    mutationFn: (personId: string) => processService.removePerson(process.id, personId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['process', process.id] });
      toast.success('Pessoa desvinculada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao desvincular pessoa');
    },
  });

  const removeDocumentMutation = useMutation({
    mutationFn: (documentId: string) => processService.removeDocument(process.id, documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['process', process.id] });
      toast.success('Documento desvinculado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao desvincular documento');
    },
  });

  const deleteProcessMutation = useMutation({
    mutationFn: () => processService.delete(process.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['processes'] });
      queryClient.invalidateQueries({ queryKey: ['department', process.departmentId] });
      if (process.parentId) {
        queryClient.invalidateQueries({ queryKey: ['process-children', process.parentId] });
      }
      queryClient.invalidateQueries({ queryKey: ['process-children'] });
      toast.success('Processo excluído com sucesso!');
      onClose();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao excluir processo');
    },
  });

  const handleOpenAddModal = (type: 'people' | 'tools' | 'documents') => {
    setAddModalState({ isOpen: true, type });
  };

  const handleCloseAddModal = () => {
    setAddModalState({ isOpen: false, type: null });
  };

  const handleViewItem = (type: 'person' | 'tool' | 'document', item: any) => {
    setViewModalState({ isOpen: true, type, item });
  };

  const handleCloseViewModal = () => {
    setViewModalState({ isOpen: false, type: null, item: null });
  };

  return (
    <div className="w-1/3 bg-gray-800 rounded-lg border border-gray-700 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-gray-700 flex items-start justify-between">
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-2 mb-2">
            <TypeIcon className={`w-5 h-5 ${statusColor}`} />
            <h2 className="text-lg font-semibold text-gray-100 truncate">{process.name}</h2>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-1 rounded text-xs ${process.type === ProcessType.SYSTEMIC
                ? 'bg-blue-500/20 text-blue-400'
                : 'bg-purple-500/20 text-purple-400'
                }`}
            >
              {TYPE_LABELS[process.type]}
            </span>
            <span className={`px-2 py-1 rounded text-xs ${statusBgColor} ${statusColor}`}>
              {STATUS_LABELS[process.status]}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="text-gray-400 hover:text-white transition-colors p-1.5 hover:bg-gray-700 rounded"
            title="Editar processo"
          >
            <FiEdit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="text-gray-400 hover:text-red-500 transition-colors p-1.5 hover:bg-gray-700 rounded"
            title="Excluir processo"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 transition-colors p-1.5 hover:bg-gray-700 rounded"
            title="Fechar"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="md" />
          </div>
        ) : (
          <>
            {detailedProcess?.description && (
              <div>
                <h3 className="text-sm font-semibold text-gray-300 mb-2">Descrição</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {detailedProcess.description}
                </p>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                  <FiTool className="w-4 h-4" />
                  Ferramentas e Sistemas
                </h3>
                <button
                  onClick={() => handleOpenAddModal('tools')}
                  className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                  title="Adicionar ferramenta"
                >
                  <FiPlus className="w-4 h-4" />
                </button>
              </div>
              {tools.length === 0 ? (
                <p className="text-gray-500 text-sm italic">Nenhuma ferramenta cadastrada</p>
              ) : (
                <div className="space-y-2">
                  {tools.map((tool: any) => (
                    <div
                      key={tool.id}
                      className="relative p-3 bg-gray-700/50 rounded-lg border border-gray-600 hover:border-gray-500 hover:bg-gray-700 transition-all cursor-pointer group"
                      onClick={() => handleViewItem('tool', tool)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0 pr-2">
                          <p className="font-medium text-gray-200 truncate">{tool.name}</p>
                          {tool.description && (
                            <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                              {tool.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {tool.url && (
                            <a
                              href={tool.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-gray-400 hover:text-primary-400 transition-colors p-1"
                            >
                              <FiExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(openMenuId === tool.id ? null : tool.id);
                              }}
                              className="text-gray-400 hover:text-gray-200 transition-colors p-1"
                            >
                              <FiMoreVertical className="w-4 h-4" />
                            </button>
                            {openMenuId === tool.id && (
                              <>
                                <div
                                  className="fixed inset-0 z-10"
                                  onClick={() => setOpenMenuId(null)}
                                />
                                <div className="absolute right-0 top-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg py-1 z-20 min-w-[120px]">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeToolMutation.mutate(tool.id);
                                      setOpenMenuId(null);
                                    }}
                                    className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-red-400 transition-colors flex items-center gap-2"
                                  >
                                    <FiTrash2 className="w-3 h-3" />
                                    Desvincular
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                  <FiUsers className="w-4 h-4" />
                  Responsáveis
                </h3>
                <button
                  onClick={() => handleOpenAddModal('people')}
                  className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                  title="Adicionar pessoa"
                >
                  <FiPlus className="w-4 h-4" />
                </button>
              </div>
              {people.length === 0 ? (
                <p className="text-gray-500 text-sm italic">Nenhum responsável cadastrado</p>
              ) : (
                <div className="space-y-2">
                  {people.map((person: any) => (
                    <div
                      key={person.id}
                      className="relative p-3 bg-gray-700/50 rounded-lg border border-gray-600 hover:border-gray-500 hover:bg-gray-700 transition-all cursor-pointer group"
                      onClick={() => handleViewItem('person', person)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center font-semibold text-sm flex-shrink-0">
                          {person.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-200 truncate">{person.name}</p>
                          {person.role && (
                            <p className="text-xs text-gray-400 truncate">{person.role}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {person.email && (
                            <a
                              href={`mailto:${person.email}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-gray-400 hover:text-primary-400 transition-colors p-1"
                            >
                              <FiMail className="w-4 h-4" />
                            </a>
                          )}
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(openMenuId === person.id ? null : person.id);
                              }}
                              className="text-gray-400 hover:text-gray-200 transition-colors p-1"
                            >
                              <FiMoreVertical className="w-4 h-4" />
                            </button>
                            {openMenuId === person.id && (
                              <>
                                <div
                                  className="fixed inset-0 z-10"
                                  onClick={() => setOpenMenuId(null)}
                                />
                                <div className="absolute right-0 top-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg py-1 z-20 min-w-[120px]">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removePersonMutation.mutate(person.id);
                                      setOpenMenuId(null);
                                    }}
                                    className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-red-400 transition-colors flex items-center gap-2"
                                  >
                                    <FiTrash2 className="w-3 h-3" />
                                    Desvincular
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                  <FiFileText className="w-4 h-4" />
                  Documentação
                </h3>
                <button
                  onClick={() => handleOpenAddModal('documents')}
                  className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                  title="Adicionar documento"
                >
                  <FiPlus className="w-4 h-4" />
                </button>
              </div>
              {documents.length === 0 ? (
                <p className="text-gray-500 text-sm italic">Nenhuma documentação cadastrada</p>
              ) : (
                <div className="space-y-2">
                  {documents.map((document: any) => (
                    <div
                      key={document.id}
                      className="relative p-3 bg-gray-700/50 rounded-lg border border-gray-600 hover:border-gray-500 hover:bg-gray-700 transition-all cursor-pointer group"
                      onClick={() => handleViewItem('document', document)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0 pr-2">
                          <p className="font-medium text-gray-200 truncate">{document.title}</p>
                          {document.description && (
                            <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                              {document.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {document.url && (
                            <a
                              href={document.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-gray-400 hover:text-primary-400 transition-colors p-1"
                            >
                              <FiExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(openMenuId === document.id ? null : document.id);
                              }}
                              className="text-gray-400 hover:text-gray-200 transition-colors p-1"
                            >
                              <FiMoreVertical className="w-4 h-4" />
                            </button>
                            {openMenuId === document.id && (
                              <>
                                <div
                                  className="fixed inset-0 z-10"
                                  onClick={() => setOpenMenuId(null)}
                                />
                                <div className="absolute right-0 top-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg py-1 z-20 min-w-[120px]">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeDocumentMutation.mutate(document.id);
                                      setOpenMenuId(null);
                                    }}
                                    className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-red-400 transition-colors flex items-center gap-2"
                                  >
                                    <FiTrash2 className="w-3 h-3" />
                                    Desvincular
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {addModalState.isOpen && addModalState.type && (
        <AddResourceModal
          isOpen={addModalState.isOpen}
          onClose={handleCloseAddModal}
          processId={process.id}
          resourceType={addModalState.type}
          alreadyLinkedIds={
            addModalState.type === 'tools'
              ? tools.map((t: any) => t.id)
              : addModalState.type === 'people'
                ? people.map((p: any) => p.id)
                : documents.map((d: any) => d.id)
          }
        />
      )}

      {viewModalState.isOpen && viewModalState.type === 'person' && (
        <PersonModal
          isOpen={viewModalState.isOpen}
          onClose={handleCloseViewModal}
          person={viewModalState.item}
          viewOnly={true}
        />
      )}

      {viewModalState.isOpen && viewModalState.type === 'tool' && (
        <ToolModal
          isOpen={viewModalState.isOpen}
          onClose={handleCloseViewModal}
          tool={viewModalState.item}
          viewOnly={true}
        />
      )}

      {viewModalState.isOpen && viewModalState.type === 'document' && (
        <DocumentModal
          isOpen={viewModalState.isOpen}
          onClose={handleCloseViewModal}
          document={viewModalState.item}
          viewOnly={true}
        />
      )}

      <ProcessModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        process={detailedProcess || process}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {
          deleteProcessMutation.mutate();
          setIsDeleteModalOpen(false);
        }}
        title="Excluir Processo"
        message={`Tem certeza que deseja excluir o processo "${process.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        isLoading={deleteProcessMutation.isPending}
      />
    </div>
  );
}

