'use client';

import ToolModal from '@/components/tools/ToolModal';
import Button from '@/components/ui/Button';
import Card, { CardBody } from '@/components/ui/Card';
import ConfirmModal from '@/components/ui/ConfirmModal';
import EmptyState from '@/components/ui/EmptyState';
import Input from '@/components/ui/Input';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Tooltip from '@/components/ui/Tooltip';
import { useDebounce } from '@/hooks/useDebounce';
import { toolService } from '@/services/tools';
import { Tool } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiEdit2, FiExternalLink, FiPlus, FiSearch, FiTool, FiTrash2 } from 'react-icons/fi';

export default function ToolsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    isOpen: boolean;
    tool: Tool | null;
  }>({ isOpen: false, tool: null });
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const debouncedSearch = useDebounce(searchInput, 500);

  const { data: toolsData, isLoading } = useQuery({
    queryKey: ['tools', debouncedSearch, page],
    queryFn: () => toolService.getAll(debouncedSearch, page, 12),
    placeholderData: (previousData) => previousData,
  });

  const deleteMutation = useMutation({
    mutationFn: toolService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tools'] });
      toast.success('Ferramenta excluída com sucesso!');
      setDeleteConfirmModal({ isOpen: false, tool: null });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao excluir ferramenta');
    },
  });

  const handleDelete = (tool: Tool) => {
    setDeleteConfirmModal({ isOpen: true, tool });
  };

  const confirmDelete = () => {
    if (deleteConfirmModal.tool) {
      deleteMutation.mutate(deleteConfirmModal.tool.id);
    }
  };

  const handleEdit = (tool: Tool) => {
    setEditingTool(tool);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTool(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Ferramentas</h1>
          <p className="text-gray-400 mt-1">
            Gerencie as ferramentas e sistemas utilizados
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <FiPlus className="mr-2" />
          Nova Ferramenta
        </Button>
      </div>

      <Card className="mb-6">
        <CardBody>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar ferramentas..."
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setPage(1);
              }}
              className="pl-10"
            />
          </div>
        </CardBody>
      </Card>

      {toolsData && toolsData.data.length === 0 ? (
        <Card>
          <CardBody>
            <EmptyState
              icon={<FiTool className="w-8 h-8" />}
              title="Nenhuma ferramenta cadastrada"
              description="Comece adicionando as ferramentas e sistemas utilizados nos processos."
              action={
                <Button onClick={() => setIsModalOpen(true)}>
                  <FiPlus className="mr-2" />
                  Adicionar Ferramenta
                </Button>
              }
            />
          </CardBody>
        </Card>
      ) : (
        <>
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900 border-b border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Descrição
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      URL
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {toolsData?.data.map((tool) => (
                    <tr key={tool.id} className="hover:bg-gray-750 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-200 truncate max-w-xs">
                          {tool.name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {tool.description ? (
                          <Tooltip content={tool.description}>
                            <div className="text-sm text-gray-400 truncate max-w-md cursor-help">
                              {tool.description}
                            </div>
                          </Tooltip>
                        ) : (
                          <span className="text-sm text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {tool.url ? (
                          <a
                            href={tool.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-400 hover:text-blue-300 flex items-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <FiExternalLink className="w-4 h-4 mr-1" />
                            Acessar
                          </a>
                        ) : (
                          <span className="text-sm text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(tool)}
                            className="text-gray-400 hover:text-white transition-colors"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              handleDelete(tool);
                            }}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg"
                            title="Excluir"
                          ><FiTrash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {toolsData && toolsData.meta.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center space-x-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Anterior
              </Button>
              <span className="text-gray-300">
                Página {page} de {toolsData.meta.totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={page === toolsData.meta.totalPages}
                onClick={() => setPage(page + 1)}
              >
                Próxima
              </Button>
            </div>
          )}
        </>
      )}

      <ToolModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        tool={editingTool}
      />

      <ConfirmModal
        isOpen={deleteConfirmModal.isOpen}
        onClose={() => setDeleteConfirmModal({ isOpen: false, tool: null })}
        onConfirm={confirmDelete}
        title="Excluir Ferramenta"
        message={`Tem certeza que deseja excluir a ferramenta "${deleteConfirmModal.tool?.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        isLoading={deleteMutation.isPending}
        variant="danger"
      />
    </div>
  );
}

