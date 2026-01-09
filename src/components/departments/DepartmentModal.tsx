'use client';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { departmentService } from '@/services/departments';
import { CreateDepartmentDto, Department, UpdateDepartmentDto } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import * as Icons from 'react-icons/fi';

const COLORS = [
  { name: 'Azul', value: 'blue', class: 'bg-blue-500' },
  { name: 'Verde', value: 'green', class: 'bg-green-500' },
  { name: 'Roxo', value: 'purple', class: 'bg-purple-500' },
  { name: 'Rosa', value: 'pink', class: 'bg-pink-500' },
  { name: 'Laranja', value: 'orange', class: 'bg-orange-500' },
  { name: 'Vermelho', value: 'red', class: 'bg-red-500' },
  { name: 'Amarelo', value: 'yellow', class: 'bg-yellow-500' },
  { name: 'Ciano', value: 'cyan', class: 'bg-cyan-500' },
  { name: 'Índigo', value: 'indigo', class: 'bg-indigo-500' },
  { name: 'Cinza', value: 'gray', class: 'bg-gray-500' },
];

const ICONS = [
  { name: 'Pasta', value: 'FiFolder' },
  { name: 'Briefcase', value: 'FiBriefcase' },
  { name: 'Usuários', value: 'FiUsers' },
  { name: 'Monitor', value: 'FiMonitor' },
  { name: 'Pacote', value: 'FiPackage' },
  { name: 'Shopping', value: 'FiShoppingBag' },
  { name: 'Trending', value: 'FiTrendingUp' },
  { name: 'Dólar', value: 'FiDollarSign' },
  { name: 'Coração', value: 'FiHeart' },
  { name: 'Ferramenta', value: 'FiTool' },
  { name: 'Livro', value: 'FiBook' },
  { name: 'Globo', value: 'FiGlobe' },
];

interface DepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  department?: Department | null;
}

export default function DepartmentModal({ isOpen, onClose, department }: DepartmentModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    color: 'blue',
    icon: 'FiFolder',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();

  useEffect(() => {
    if (department) {
      setFormData({
        name: department.name,
        code: department.code,
        description: department.description || '',
        color: department.color || 'blue',
        icon: department.icon || 'FiFolder',
      });
    } else {
      setFormData({ name: '', code: '', description: '', color: 'blue', icon: 'FiFolder' });
    }
    setErrors({});
  }, [department, isOpen]);

  const createMutation = useMutation({
    mutationFn: departmentService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Departamento criado com sucesso!');
      onClose();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao criar departamento');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDepartmentDto }) =>
      departmentService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Departamento atualizado com sucesso!');
      onClose();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao atualizar departamento');
    },
  });

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Código é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const data = {
      name: formData.name,
      code: formData.code,
      description: formData.description || undefined,
      color: formData.color,
      icon: formData.icon,
    };

    if (department) {
      updateMutation.mutate({ id: department.id, data });
    } else {
      createMutation.mutate(data as CreateDepartmentDto);
    }
  };

  const IconComponent = (Icons as any)[formData.icon] || Icons.FiFolder;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={department ? 'Editar Departamento' : 'Novo Departamento'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nome"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={errors.name}
          placeholder="Ex: Recursos Humanos"
        />

        <Input
          label="Código"
          required
          value={formData.code}
          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          error={errors.code}
          placeholder="Ex: RH"
        />

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Descrição
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Descreva as responsabilidades do departamento..."
            rows={3}
            className="w-full px-4 py-2 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors placeholder:text-gray-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Cor
          </label>
          <div className="grid grid-cols-5 gap-2">
            {COLORS.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => setFormData({ ...formData, color: color.value })}
                className={clsx(
                  'p-3 rounded-lg transition-all',
                  color.class,
                  formData.color === color.value
                    ? 'ring-4 ring-offset-2 ring-offset-gray-800 ring-gray-500 scale-105'
                    : 'opacity-70 hover:opacity-100'
                )}
                title={color.name}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Ícone
          </label>
          <div className="grid grid-cols-6 gap-2">
            {ICONS.map((icon) => {
              const Icon = (Icons as any)[icon.value];
              return (
                <button
                  key={icon.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon: icon.value })}
                  className={clsx(
                    'p-3 rounded-lg border-2 transition-all flex items-center justify-center text-gray-300',
                    formData.icon === icon.value
                      ? 'border-gray-500 bg-gray-700'
                      : 'border-gray-600 hover:border-gray-500 bg-gray-750'
                  )}
                  title={icon.name}
                >
                  <Icon className="w-5 h-5" />
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            isLoading={createMutation.isPending || updateMutation.isPending}
            variant="success"
          >
            {department ? 'Atualizar' : 'Criar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

