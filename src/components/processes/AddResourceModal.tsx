'use client';

import DocumentModal from '@/components/documents/DocumentModal';
import PersonModal from '@/components/people/PersonModal';
import ToolModal from '@/components/tools/ToolModal';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Modal from '@/components/ui/Modal';
import { useDebounce } from '@/hooks/useDebounce';
import { documentService } from '@/services/documents';
import { personService } from '@/services/people';
import { processService } from '@/services/processes';
import { toolService } from '@/services/tools';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiCheck, FiPlus, FiSearch } from 'react-icons/fi';

type ResourceType = 'people' | 'tools' | 'documents';

interface AddResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  processId: string;
  resourceType: ResourceType;
  alreadyLinkedIds: string[];
}

const RESOURCE_CONFIG = {
  people: {
    title: 'Adicionar Pessoas',
    service: personService,
    processService: {
      addBulk: (processId: string, resourceIds: string[]) =>
        processService.addPeople(processId, resourceIds),
    },
    getDisplayName: (item: any) => item.name,
    getSecondaryInfo: (item: any) => item.role || item.email,
    emptyMessage: 'Nenhuma pessoa encontrada',
  },
  tools: {
    title: 'Adicionar Ferramentas',
    service: toolService,
    processService: {
      addBulk: (processId: string, resourceIds: string[]) =>
        processService.addTools(processId, resourceIds),
    },
    getDisplayName: (item: any) => item.name,
    getSecondaryInfo: (item: any) => item.description,
    emptyMessage: 'Nenhuma ferramenta encontrada',
  },
  documents: {
    title: 'Adicionar Documentos',
    service: documentService,
    processService: {
      addBulk: (processId: string, resourceIds: string[]) =>
        processService.addDocuments(processId, resourceIds),
    },
    getDisplayName: (item: any) => item.title,
    getSecondaryInfo: (item: any) => item.description,
    emptyMessage: 'Nenhum documento encontrado',
  },
};

export default function AddResourceModal({
  isOpen,
  onClose,
  processId,
  resourceType,
  alreadyLinkedIds,
}: AddResourceModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const debouncedSearch = useDebounce(searchTerm, 500);
  const queryClient = useQueryClient();
  const itemsPerPage = 5;

  const config = RESOURCE_CONFIG[resourceType];

  // Reset to page 1 when search changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // Reset modal state when it opens
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setCurrentPage(1);
      setIsCreateModalOpen(false);
      setSelectedIds([]);
    }
  }, [isOpen]);

  // Fetch resources
  const { data: resourcesResponse, isLoading } = useQuery<any>({
    queryKey: [resourceType, 'modal', debouncedSearch, currentPage],
    queryFn: () => config.service.getAll(debouncedSearch, currentPage, itemsPerPage),
    placeholderData: (previousData: any) => previousData,
    enabled: isOpen,
  });

  // Extract resources from paginated response
  const resourcesList = resourcesResponse?.data || [];
  const totalPages = resourcesResponse?.meta?.totalPages || 1;
  const totalItems = resourcesResponse?.meta?.total || 0;

  // Mutation to add multiple resources
  const addMutation = useMutation({
    mutationFn: (resourceIds: string[]) =>
      config.processService.addBulk(processId, resourceIds),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['process', processId] });
      const message = result.skipped > 0
        ? `${result.linked} vinculado(s) com sucesso! ${result.skipped} já estava(m) vinculado(s).`
        : `${result.linked} vinculado(s) com sucesso!`;
      toast.success(message);
      onClose();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao vincular');
    },
  });

  const handleToggleSelection = (itemId: string) => {
    setSelectedIds((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleLinkSelected = () => {
    if (selectedIds.length > 0) {
      addMutation.mutate(selectedIds);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={config.title} size="lg">
      <div className="flex flex-col h-[600px]">
        {/* Header with Create Button */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={`Buscar ${resourceType === 'people' ? 'pessoas' : resourceType === 'tools' ? 'ferramentas' : 'documentos'}...`}
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex-shrink-0"
          >
            <FiPlus className="w-4 h-4 mr-2" />
            Novo
          </Button>
        </div>

        {/* List - Fixed height */}
        <div className="flex-1 overflow-y-auto mb-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <LoadingSpinner size="md" />
            </div>
          ) : resourcesList.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400">{config.emptyMessage}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {resourcesList.map((item: any) => {
                const isAlreadyLinked = alreadyLinkedIds.includes(item.id);
                const isSelected = selectedIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${isAlreadyLinked
                      ? 'bg-gray-700/30 border-gray-600 opacity-50 cursor-not-allowed'
                      : isSelected
                        ? 'bg-primary-500/20 border-primary-500 cursor-pointer'
                        : 'bg-gray-700/50 border-gray-600 hover:bg-gray-700 cursor-pointer'
                      }`}
                    onClick={() => !isAlreadyLinked && handleToggleSelection(item.id)}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* Checkbox */}
                      {!isAlreadyLinked && (
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${isSelected
                            ? 'bg-primary-500 border-primary-500'
                            : 'border-gray-500'
                            }`}
                        >
                          {isSelected && <FiCheck className="w-3 h-3 text-white" />}
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-200 truncate">
                          {config.getDisplayName(item)}
                        </p>
                        {config.getSecondaryInfo(item) && (
                          <p className="text-sm text-gray-400 truncate mt-0.5">
                            {config.getSecondaryInfo(item)}
                          </p>
                        )}
                      </div>
                    </div>

                    {isAlreadyLinked && (
                      <div className="flex items-center gap-2 text-green-500 ml-4">
                        <FiCheck className="w-5 h-5" />
                        <span className="text-sm font-medium">Vinculado</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-700">
          <div className="text-sm text-gray-400">
            {totalItems > 0 ? (
              <>
                Mostrando {(currentPage - 1) * itemsPerPage + 1}-
                {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems}
              </>
            ) : (
              'Nenhum item encontrado'
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1 || isLoading}
            >
              Anterior
            </Button>

            <span className="text-sm text-gray-300 px-3">
              Página {currentPage} de {totalPages}
            </span>

            <Button
              size="sm"
              variant="secondary"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage >= totalPages || isLoading}
            >
              Próxima
            </Button>
          </div>
        </div>

        {/* Footer with Link Button */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-700 mt-4">
          <div className="text-sm text-gray-400">
            {selectedIds.length > 0 && (
              <span>{selectedIds.length} item(ns) selecionado(s)</span>
            )}
          </div>
          <Button
            onClick={handleLinkSelected}
            disabled={selectedIds.length === 0 || addMutation.isPending}
            isLoading={addMutation.isPending}
            className={`transition-colors ${selectedIds.length === 0
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed hover:bg-gray-700'
              : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
          >
            Vincular {selectedIds.length > 0 && `(${selectedIds.length})`}
          </Button>
        </div>
      </div>

      {/* Creation Modals */}
      {resourceType === 'people' && (
        <PersonModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}

      {resourceType === 'tools' && (
        <ToolModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}

      {resourceType === 'documents' && (
        <DocumentModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}
    </Modal>
  );
}
