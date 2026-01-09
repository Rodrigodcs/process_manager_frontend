'use client';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { documentService } from '@/services/documents';
import { CreateDocumentDto, Document, UpdateDocumentDto } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  document?: Document | null;
  viewOnly?: boolean;
}

export default function DocumentModal({ isOpen, onClose, document, viewOnly = false }: DocumentModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();

  useEffect(() => {
    if (document) {
      setFormData({
        title: document.title,
        description: document.description || '',
        url: document.url || '',
      });
    } else {
      setFormData({ title: '', description: '', url: '' });
    }
    setErrors({});
  }, [document, isOpen]);

  const createMutation = useMutation({
    mutationFn: documentService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Documento criado com sucesso!');
      onClose();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao criar documento');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDocumentDto }) =>
      documentService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Documento atualizado com sucesso!');
      onClose();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao atualizar documento');
    },
  });

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório';
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
      title: formData.title,
      description: formData.description || undefined,
      url: formData.url || undefined,
    };

    if (document) {
      updateMutation.mutate({ id: document.id, data });
    } else {
      createMutation.mutate(data as CreateDocumentDto);
    }
  };

  if (viewOnly && document) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-100">{document.title}</h2>

          {document.description && (
            <p className="text-gray-300 leading-relaxed">{document.description}</p>
          )}

          {document.url && (
            <a
              href={document.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-400 hover:text-primary-300 underline inline-block"
            >
              {document.url}
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
      title={document ? 'Editar Documento' : 'Novo Documento'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Título"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          error={errors.title}
          placeholder="Ex: Fluxo de Recrutamento"
        />

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Descrição
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Descreva o documento..."
            rows={4}
            className="w-full px-4 py-2 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors placeholder:text-gray-400"
          />
        </div>

        <Input
          label="URL"
          type="url"
          value={formData.url}
          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          error={errors.url}
          placeholder="Ex: https://docs.google.com/..."
        />

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            isLoading={createMutation.isPending || updateMutation.isPending}
          >
            {document ? 'Atualizar' : 'Criar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

