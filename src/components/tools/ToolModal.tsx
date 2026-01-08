'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toolService } from '@/services/tools';
import { Tool, CreateToolDto, UpdateToolDto } from '@/types';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

interface ToolModalProps {
  isOpen: boolean;
  onClose: () => void;
  tool?: Tool | null;
  viewOnly?: boolean;
}

export default function ToolModal({ isOpen, onClose, tool, viewOnly = false }: ToolModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    url: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();

  useEffect(() => {
    if (tool) {
      setFormData({
        name: tool.name,
        description: tool.description || '',
        url: tool.url || '',
      });
    } else {
      setFormData({ name: '', description: '', url: '' });
    }
    setErrors({});
  }, [tool, isOpen]);

  const createMutation = useMutation({
    mutationFn: toolService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tools'] });
      toast.success('Ferramenta criada com sucesso!');
      onClose();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao criar ferramenta');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateToolDto }) =>
      toolService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tools'] });
      toast.success('Ferramenta atualizada com sucesso!');
      onClose();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao atualizar ferramenta');
    },
  });

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (formData.url && !/^https?:\/\/.+/.test(formData.url)) {
      newErrors.url = 'URL inválida (deve começar com http:// ou https://)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const data = {
      name: formData.name,
      description: formData.description || undefined,
      url: formData.url || undefined,
    };

    if (tool) {
      updateMutation.mutate({ id: tool.id, data });
    } else {
      createMutation.mutate(data as CreateToolDto);
    }
  };

  if (viewOnly && tool) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-100">{tool.name}</h2>
          
          {tool.description && (
            <p className="text-gray-300 leading-relaxed">{tool.description}</p>
          )}
          
          {tool.url && (
            <a
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-400 hover:text-primary-300 underline inline-block"
            >
              {tool.url}
            </a>
          )}

          <div className="flex justify-end pt-4">
            <Button type="button" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={tool ? 'Editar Ferramenta' : 'Nova Ferramenta'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nome"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={errors.name}
          placeholder="Ex: Trello"
        />

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Descrição
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Descreva a ferramenta e sua finalidade..."
            rows={3}
            className="w-full px-4 py-2 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors placeholder:text-gray-400"
          />
        </div>

        <Input
          label="URL"
          type="url"
          value={formData.url}
          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          error={errors.url}
          placeholder="Ex: https://trello.com"
        />

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            isLoading={createMutation.isPending || updateMutation.isPending}
          >
            {tool ? 'Atualizar' : 'Criar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

