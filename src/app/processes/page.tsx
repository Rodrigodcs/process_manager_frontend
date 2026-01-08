'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiPlus, FiEdit2, FiTrash2, FiGitBranch, FiFilter } from 'react-icons/fi';
import { processService } from '@/services/processes';
import { departmentService } from '@/services/departments';
import { Process } from '@/types';
import Button from '@/components/ui/Button';
import Card, { CardBody, CardHeader } from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import ProcessModal from '@/components/processes/ProcessModal';
import ProcessCard from '@/components/processes/ProcessCard';
import toast from 'react-hot-toast';
import Select from '@/components/ui/Select';
import Link from 'next/link';

export default function ProcessesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProcess, setEditingProcess] = useState<Process | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const queryClient = useQueryClient();

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentService.getAll,
  });

  const { data: processes, isLoading } = useQuery({
    queryKey: ['processes'],
    queryFn: processService.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: processService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['processes'] });
      toast.success('Processo excluído com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao excluir processo');
    },
  });

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este processo? Todos os subprocessos também serão excluídos.')) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (process: Process) => {
    setEditingProcess(process);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProcess(null);
  };

  const filteredProcesses = processes?.filter((p) => {
    if (!selectedDepartment) return !p.parentId; // Show only main processes
    return p.departmentId === selectedDepartment && !p.parentId;
  });

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
          <h1 className="text-3xl font-bold text-gray-900">Processos</h1>
          <p className="text-gray-600 mt-1">
            Gerencie processos e subprocessos da organização
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <FiPlus className="mr-2" />
          Novo Processo
        </Button>
      </div>

      <Card className="mb-6">
        <CardBody>
          <div className="flex items-center space-x-4">
            <FiFilter className="text-gray-400" />
            <Select
              options={[
                { value: '', label: 'Todos os departamentos' },
                ...(departments?.map((d) => ({ value: d.id, label: d.name })) || []),
              ]}
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
            />
          </div>
        </CardBody>
      </Card>

      {filteredProcesses && filteredProcesses.length === 0 ? (
        <Card>
          <CardBody>
            <EmptyState
              icon={<FiGitBranch className="w-8 h-8" />}
              title="Nenhum processo cadastrado"
              description="Comece criando seu primeiro processo para mapear os fluxos da organização."
              action={
                <Button onClick={() => setIsModalOpen(true)}>
                  <FiPlus className="mr-2" />
                  Criar Processo
                </Button>
              }
            />
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredProcesses?.map((process) => (
            <ProcessCard
              key={process.id}
              process={process}
              allProcesses={processes || []}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <ProcessModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        process={editingProcess}
      />
    </div>
  );
}

