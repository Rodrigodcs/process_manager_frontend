'use client';

import PersonModal from '@/components/people/PersonModal';
import Button from '@/components/ui/Button';
import Card, { CardBody } from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import Input from '@/components/ui/Input';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Tooltip from '@/components/ui/Tooltip';
import { useDebounce } from '@/hooks/useDebounce';
import { personService } from '@/services/people';
import { Person } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiEdit2, FiMail, FiPlus, FiSearch, FiTrash2, FiUsers } from 'react-icons/fi';

export default function PeoplePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  // Debounce search input - only triggers after 0.5 seconds of no typing
  const debouncedSearch = useDebounce(searchInput, 500);

  const { data: peopleData, isLoading } = useQuery({
    queryKey: ['people', debouncedSearch, page],
    queryFn: () => personService.getAll(debouncedSearch, page, 12),
    placeholderData: (previousData) => previousData,
  });

  const deleteMutation = useMutation({
    mutationFn: personService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] });
      toast.success('Pessoa excluída com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao excluir pessoa');
    },
  });

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta pessoa?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (person: Person) => {
    setEditingPerson(person);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPerson(null);
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
          <h1 className="text-3xl font-bold text-gray-100">Pessoas</h1>
          <p className="text-gray-400 mt-1">
            Gerencie os responsáveis pelos processos
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <FiPlus className="mr-2" />
          Nova Pessoa
        </Button>
      </div>

      <Card className="mb-6">
        <CardBody>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar por nome..."
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

      {peopleData && peopleData.data.length === 0 ? (
        <Card>
          <CardBody>
            <EmptyState
              icon={<FiUsers className="w-8 h-8" />}
              title="Nenhuma pessoa cadastrada"
              description="Comece adicionando as pessoas responsáveis pelos processos."
              action={
                <Button onClick={() => setIsModalOpen(true)}>
                  <FiPlus className="mr-2" />
                  Adicionar Pessoa
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
                      Cargo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {peopleData?.data.map((person) => (
                    <tr key={person.id} className="hover:bg-gray-750 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-200 truncate max-w-xs">
                          {person.name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {person.role ? (
                          <Tooltip content={person.role}>
                            <div className="text-sm text-gray-400 truncate max-w-md cursor-help">
                              {person.role}
                            </div>
                          </Tooltip>
                        ) : (
                          <span className="text-sm text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <a
                          href={`mailto:${person.email}`}
                          className="text-sm text-blue-400 hover:text-blue-300 flex items-center"
                        >
                          <FiMail className="w-4 h-4 mr-1" />
                          {person.email}
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(person)}
                            className="text-gray-400 hover:text-white transition-colors"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(person.id)}
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

          {peopleData && peopleData.meta.totalPages > 1 && (
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
                Página {page} de {peopleData.meta.totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={page === peopleData.meta.totalPages}
                onClick={() => setPage(page + 1)}
              >
                Próxima
              </Button>
            </div>
          )}
        </>
      )}

      <PersonModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        person={editingPerson}
      />
    </div>
  );
}

