'use client';

import DocumentModal from '@/components/documents/DocumentModal';
import Button from '@/components/ui/Button';
import Card, { CardBody } from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import Input from '@/components/ui/Input';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Tooltip from '@/components/ui/Tooltip';
import { useDebounce } from '@/hooks/useDebounce';
import { documentService } from '@/services/documents';
import { Document } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiEdit2, FiExternalLink, FiFileText, FiPlus, FiSearch, FiTrash2 } from 'react-icons/fi';

export default function DocumentsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  // Debounce search input - only triggers after 0.5 seconds of no typing
  const debouncedSearch = useDebounce(searchInput, 500);

  const { data: documentsData, isLoading } = useQuery({
    queryKey: ['documents', debouncedSearch, page],
    queryFn: () => documentService.getAll(debouncedSearch, page, 12),
    placeholderData: (previousData) => previousData,
  });

  const deleteMutation = useMutation({
    mutationFn: documentService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Documento excluído com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao excluir documento');
    },
  });

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este documento?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (document: Document) => {
    setEditingDocument(document);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDocument(null);
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
          <h1 className="text-3xl font-bold text-gray-100">Documentos</h1>
          <p className="text-gray-400 mt-1">
            Gerencie a documentação dos processos
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <FiPlus className="mr-2" />
          Novo Documento
        </Button>
      </div>

      <Card className="mb-6">
        <CardBody>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar documentos..."
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

      {documentsData && documentsData.data.length === 0 ? (
        <Card>
          <CardBody>
            <EmptyState
              icon={<FiFileText className="w-8 h-8" />}
              title="Nenhum documento cadastrado"
              description="Comece adicionando a documentação relacionada aos processos."
              action={
                <Button onClick={() => setIsModalOpen(true)}>
                  <FiPlus className="mr-2" />
                  Adicionar Documento
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
                      Título
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
                  {documentsData?.data.map((document) => (
                    <tr key={document.id} className="hover:bg-gray-750 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-200 truncate max-w-xs">
                          {document.title}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {document.description ? (
                          <Tooltip content={document.description}>
                            <div className="text-sm text-gray-400 truncate max-w-md cursor-help">
                              {document.description}
                            </div>
                          </Tooltip>
                        ) : (
                          <span className="text-sm text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {document.url ? (
                          <a
                            href={document.url}
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
                            onClick={() => handleEdit(document)}
                            className="text-gray-400 hover:text-white transition-colors"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(document.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {documentsData && documentsData.meta.totalPages > 1 && (
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
                Página {page} de {documentsData.meta.totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={page === documentsData.meta.totalPages}
                onClick={() => setPage(page + 1)}
              >
                Próxima
              </Button>
            </div>
          )}
        </>
      )}

      <DocumentModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        document={editingDocument}
      />
    </div>
  );
}

