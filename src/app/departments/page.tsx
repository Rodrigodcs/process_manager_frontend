'use client';

import DepartmentModal from '@/components/departments/DepartmentModal';
import Button from '@/components/ui/Button';
import Card, { CardBody } from '@/components/ui/Card';
import ConfirmModal from '@/components/ui/ConfirmModal';
import EmptyState from '@/components/ui/EmptyState';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { departmentService } from '@/services/departments';
import { Department } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import Link from 'next/link';
import { useState } from 'react';
import toast from 'react-hot-toast';
import * as Icons from 'react-icons/fi';
import { FiChevronRight, FiFolder, FiPlus } from 'react-icons/fi';

const COLOR_MAP: Record<string, string> = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  purple: 'bg-purple-500',
  pink: 'bg-pink-500',
  orange: 'bg-orange-500',
  red: 'bg-red-500',
  yellow: 'bg-yellow-500',
  cyan: 'bg-cyan-500',
  indigo: 'bg-indigo-500',
  gray: 'bg-gray-500',
};

const COLOR_HOVER_MAP: Record<string, string> = {
  blue: 'group-hover:text-blue-500',
  green: 'group-hover:text-green-500',
  purple: 'group-hover:text-purple-500',
  pink: 'group-hover:text-pink-500',
  orange: 'group-hover:text-orange-500',
  red: 'group-hover:text-red-500',
  yellow: 'group-hover:text-yellow-500',
  cyan: 'group-hover:text-cyan-500',
  indigo: 'group-hover:text-indigo-500',
  gray: 'group-hover:text-gray-500',
};

const COLOR_BG_HOVER_MAP: Record<string, string> = {
  blue: 'group-hover:bg-blue-500/10',
  green: 'group-hover:bg-green-500/10',
  purple: 'group-hover:bg-purple-500/10',
  pink: 'group-hover:bg-pink-500/10',
  orange: 'group-hover:bg-orange-500/10',
  red: 'group-hover:bg-red-500/10',
  yellow: 'group-hover:bg-yellow-500/10',
  cyan: 'group-hover:bg-cyan-500/10',
  indigo: 'group-hover:bg-indigo-500/10',
  gray: 'group-hover:bg-gray-500/10',
};

const COLOR_BADGE_MAP: Record<string, string> = {
  blue: 'bg-blue-500 text-white',
  green: 'bg-green-500 text-white',
  purple: 'bg-purple-500 text-white',
  pink: 'bg-pink-500 text-white',
  orange: 'bg-orange-500 text-white',
  red: 'bg-red-500 text-white',
  yellow: 'bg-yellow-500 text-white',
  cyan: 'bg-cyan-500 text-white',
  indigo: 'bg-indigo-500 text-white',
  gray: 'bg-gray-500 text-white',
};

export default function DepartmentsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    isOpen: boolean;
    department: Department | null;
  }>({ isOpen: false, department: null });
  const queryClient = useQueryClient();

  const { data: departments, isLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentService.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: departmentService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Departamento excluído com sucesso!');
      setDeleteConfirmModal({ isOpen: false, department: null });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao excluir departamento');
    },
  });

  const handleDelete = (department: Department) => {
    setDeleteConfirmModal({ isOpen: true, department });
  };

  const confirmDelete = () => {
    if (deleteConfirmModal.department) {
      deleteMutation.mutate(deleteConfirmModal.department.id);
    }
  };

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDepartment(null);
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
          <h1 className="text-3xl font-bold text-gray-100">Departamentos</h1>
          <p className="text-gray-400 mt-1">
            Gerencie os departamentos da sua organização
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <FiPlus className="mr-2" />
          Novo Departamento
        </Button>
      </div>

      {departments && departments.length === 0 ? (
        <Card>
          <CardBody>
            <EmptyState
              icon={<FiFolder className="w-8 h-8" />}
              title="Nenhum departamento cadastrado"
              description="Comece criando seu primeiro departamento para organizar os processos."
              action={
                <Button onClick={() => setIsModalOpen(true)}>
                  <FiPlus className="mr-2" />
                  Criar Departamento
                </Button>
              }
            />
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
          {departments?.map((department) => {
            const IconComponent = (Icons as any)[department.icon || 'FiFolder'] || Icons.FiFolder;
            const colorClass = COLOR_MAP[department.color || 'blue'];
            const colorHoverClass = COLOR_HOVER_MAP[department.color || 'blue'];
            const colorBadgeClass = COLOR_BADGE_MAP[department.color || 'blue'];

            return (
              <Link
                key={department.id}
                href={`/departments/${department.id}`}
                className="group block h-full"
              >
                <Card className="h-full transition-all duration-200 hover:shadow-xl hover:-translate-y-1 hover:bg-gray-750 cursor-pointer border-2 border-transparent hover:border-gray-600">
                  <CardBody className="p-6 h-full flex flex-col">
                    {/* Header com ícone e seta */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-3 flex-1 min-w-0">
                        <div className={clsx('p-3 rounded-lg text-white flex-shrink-0', colorClass)}>
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-300 group-hover:text-gray-100 transition-colors truncate">
                            {department.name}
                          </h3>
                          <p className="text-sm text-gray-500 mt-0.5">
                            {department.code}
                          </p>
                        </div>
                      </div>
                      <FiChevronRight
                        className={clsx(
                          'w-5 h-5 text-gray-500 transition-colors flex-shrink-0 ml-2',
                          colorHoverClass
                        )}
                      />
                    </div>

                    {/* Descrição com altura fixa */}
                    <div className="flex-1 mb-4">
                      {department.description ? (
                        <p className="text-sm text-gray-400 line-clamp-3">
                          {department.description}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-500 italic">
                          Sem descrição
                        </p>
                      )}
                    </div>

                    {/* Footer fixo na parte inferior */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-700 mt-auto">
                      <span className={clsx(
                        'px-3 py-1 rounded-full text-sm font-medium',
                        colorBadgeClass
                      )}>
                        {department.processes?.length || 0} processo{(department.processes?.length || 0) !== 1 ? 's' : ''}
                      </span>
                      <div className="flex space-x-1" onClick={(e) => e.preventDefault()}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handleEdit(department);
                          }}
                          className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg"
                          title="Editar"
                        >
                          <Icons.FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handleDelete(department);
                          }}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg"
                          title="Excluir"
                        >
                          <Icons.FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      <DepartmentModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        department={editingDepartment}
      />

      <ConfirmModal
        isOpen={deleteConfirmModal.isOpen}
        onClose={() => setDeleteConfirmModal({ isOpen: false, department: null })}
        onConfirm={confirmDelete}
        title="Excluir Departamento"
        message={`Tem certeza que deseja excluir o departamento "${deleteConfirmModal.department?.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        isLoading={deleteMutation.isPending}
        variant="danger"
      />
    </div>
  );
}

