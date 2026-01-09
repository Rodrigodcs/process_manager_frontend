'use client';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Select from '@/components/ui/Select';
import { departmentService } from '@/services/departments';
import { processService } from '@/services/processes';
import { CreateProcessDto, Process, ProcessStatus, ProcessType, UpdateProcessDto } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface ProcessModalProps {
  isOpen: boolean;
  onClose: () => void;
  process?: Process | null;
  parentId?: string;
  departmentId?: string;
  onSubprocessCreated?: (parentId: string) => void;
}

export default function ProcessModal({
  isOpen,
  onClose,
  process,
  parentId,
  departmentId,
  onSubprocessCreated,
}: ProcessModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: ProcessType.MANUAL,
    status: ProcessStatus.ACTIVE,
    departmentId: departmentId || '',
    parentId: parentId || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentService.getAll,
  });

  const { data: processes } = useQuery({
    queryKey: ['processes'],
    queryFn: processService.getAll,
    enabled: isOpen,
  });

  useEffect(() => {
    if (process) {
      setFormData({
        name: process.name,
        description: process.description || '',
        type: process.type,
        status: process.status,
        departmentId: process.departmentId,
        parentId: process.parentId || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        type: ProcessType.MANUAL,
        status: ProcessStatus.ACTIVE,
        departmentId: departmentId || '',
        parentId: parentId || '',
      });
    }
    setErrors({});
  }, [process, parentId, departmentId, isOpen]);

  const createMutation = useMutation({
    mutationFn: processService.create,
    onSuccess: (newProcess) => {
      queryClient.invalidateQueries({ queryKey: ['processes'] });
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['department', newProcess.departmentId] });
      if (newProcess.parentId) {
        queryClient.invalidateQueries({ queryKey: ['process-children', newProcess.parentId] });
        queryClient.invalidateQueries({ queryKey: ['process', newProcess.parentId] });
        if (onSubprocessCreated) {
          onSubprocessCreated(newProcess.parentId);
        }
      }
      toast.success('Processo criado com sucesso!');
      onClose();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao criar processo');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProcessDto }) =>
      processService.update(id, data),
    onSuccess: (updatedProcess, variables) => {
      queryClient.invalidateQueries({ queryKey: ['processes'] });
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['process', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['department', updatedProcess.departmentId] });
      queryClient.invalidateQueries({ queryKey: ['process-children'] });
      if (updatedProcess.parentId) {
        queryClient.invalidateQueries({ queryKey: ['process-children', updatedProcess.parentId] });
      }
      toast.success('Processo atualizado com sucesso!');
      onClose();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao atualizar processo');
    },
  });

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.departmentId && !departmentId) {
      newErrors.departmentId = 'Departamento é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const data: CreateProcessDto = {
      name: formData.name,
      description: formData.description || undefined,
      type: formData.type,
      status: formData.status,
      departmentId: departmentId || formData.departmentId,
      parentId: parentId || formData.parentId || undefined,
    };

    if (process) {
      updateMutation.mutate({ id: process.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const availableParentProcesses = processes?.filter(
    (p) => p.id !== process?.id && p.departmentId === formData.departmentId
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={process ? 'Editar Processo' : 'Novo Processo'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nome"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={errors.name}
          placeholder="Ex: Recrutamento e Seleção"
        />

        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">
            Descrição
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Descreva o processo..."
            rows={4}
            className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors bg-gray-700 text-gray-100 placeholder-gray-400"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Tipo"
            required
            options={[
              { value: ProcessType.MANUAL, label: 'Manual' },
              { value: ProcessType.SYSTEMIC, label: 'Sistêmico' },
            ]}
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as ProcessType })}
          />

          <Select
            label="Status"
            required
            options={[
              { value: ProcessStatus.ACTIVE, label: 'Ativo' },
              { value: ProcessStatus.IN_REVIEW, label: 'Em Revisão' },
              { value: ProcessStatus.DEPRECATED, label: 'Descontinuado' },
            ]}
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value as ProcessStatus })
            }
          />
        </div>

        {!departmentId && (
          <Select
            label="Departamento"
            required
            options={[
              { value: '', label: 'Selecione um departamento' },
              ...(departments?.map((d) => ({ value: d.id, label: d.name })) || []),
            ]}
            value={formData.departmentId}
            onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
            error={errors.departmentId}
          />
        )}

        {!departmentId && formData.departmentId && (
          <Select
            label="Processo Pai (opcional)"
            options={[
              { value: '', label: 'Nenhum (processo principal)' },
              ...(availableParentProcesses?.map((p) => ({ value: p.id, label: p.name })) || []),
            ]}
            value={formData.parentId}
            onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
          />
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            isLoading={createMutation.isPending || updateMutation.isPending}
          >
            {process ? 'Atualizar' : 'Criar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

