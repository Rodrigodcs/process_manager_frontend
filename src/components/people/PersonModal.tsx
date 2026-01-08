'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { personService } from '@/services/people';
import { Person, CreatePersonDto, UpdatePersonDto } from '@/types';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

interface PersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  person?: Person | null;
  viewOnly?: boolean;
}

export default function PersonModal({ isOpen, onClose, person, viewOnly = false }: PersonModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();

  useEffect(() => {
    if (person) {
      setFormData({
        name: person.name,
        email: person.email,
        role: person.role || '',
      });
    } else {
      setFormData({ name: '', email: '', role: '' });
    }
    setErrors({});
  }, [person, isOpen]);

  const createMutation = useMutation({
    mutationFn: personService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] });
      toast.success('Pessoa criada com sucesso!');
      onClose();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao criar pessoa');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePersonDto }) =>
      personService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] });
      toast.success('Pessoa atualizada com sucesso!');
      onClose();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao atualizar pessoa');
    },
  });

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const data = {
      ...formData,
      role: formData.role || undefined,
    };

    if (person) {
      updateMutation.mutate({ id: person.id, data });
    } else {
      createMutation.mutate(data as CreatePersonDto);
    }
  };

  if (viewOnly && person) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-100">{person.name}</h2>
          
          {person.role && (
            <p className="text-gray-300 text-lg">{person.role}</p>
          )}
          
          {person.email && (
            <a
              href={`mailto:${person.email}`}
              className="text-primary-400 hover:text-primary-300 underline inline-block"
            >
              {person.email}
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
      title={person ? 'Editar Pessoa' : 'Nova Pessoa'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nome"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={errors.name}
          placeholder="Ex: João Silva"
        />

        <Input
          label="Email"
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          error={errors.email}
          placeholder="Ex: joao.silva@empresa.com"
        />

        <Input
          label="Cargo"
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          placeholder="Ex: Gerente de RH"
        />

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            isLoading={createMutation.isPending || updateMutation.isPending}
          >
            {person ? 'Atualizar' : 'Criar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

