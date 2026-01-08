'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { processService } from '@/services/processes';
import { personService } from '@/services/people';
import { toolService } from '@/services/tools';
import { documentService } from '@/services/documents';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Card, { CardBody, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { FiArrowLeft, FiPlus, FiTrash2, FiUsers, FiTool, FiFileText, FiGitBranch } from 'react-icons/fi';
import Link from 'next/link';
import ProcessModal from '@/components/processes/ProcessModal';
import AddResourceModal from '@/components/processes/AddResourceModal';
import ProcessHierarchyView from '@/components/processes/ProcessHierarchyView';
import toast from 'react-hot-toast';
import { ProcessStatus, ProcessType } from '@/types';
import clsx from 'clsx';

export default function ProcessDetailPage({ params }: { params: { id: string } }) {
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [isAddPeopleModalOpen, setIsAddPeopleModalOpen] = useState(false);
  const [isAddToolsModalOpen, setIsAddToolsModalOpen] = useState(false);
  const [isAddDocsModalOpen, setIsAddDocsModalOpen] = useState(false);
  const [showHierarchy, setShowHierarchy] = useState(false);
  const queryClient = useQueryClient();

  const { data: process, isLoading } = useQuery({
    queryKey: ['processes', params.id],
    queryFn: () => processService.getById(params.id),
  });

  const { data: people } = useQuery({
    queryKey: ['processes', params.id, 'people'],
    queryFn: () => processService.getPeople(params.id),
    enabled: !!params.id,
  });

  const { data: tools } = useQuery({
    queryKey: ['processes', params.id, 'tools'],
    queryFn: () => processService.getTools(params.id),
    enabled: !!params.id,
  });

  const { data: documents } = useQuery({
    queryKey: ['processes', params.id, 'documents'],
    queryFn: () => processService.getDocuments(params.id),
    enabled: !!params.id,
  });

  const { data: allProcesses } = useQuery({
    queryKey: ['processes'],
    queryFn: processService.getAll,
  });

  const { data: availablePeople } = useQuery({
    queryKey: ['people'],
    queryFn: () => personService.getAll('', 1, 100),
  });

  const { data: availableTools } = useQuery({
    queryKey: ['tools'],
    queryFn: () => toolService.getAll('', 1, 100),
  });

  const { data: availableDocuments } = useQuery({
    queryKey: ['documents'],
    queryFn: () => documentService.getAll('', 1, 100),
  });

  const removePersonMutation = useMutation({
    mutationFn: (personId: string) => processService.removePerson(params.id, personId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['processes', params.id, 'people'] });
      toast.success('Pessoa removida do processo!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao remover pessoa');
    },
  });

  const removeToolMutation = useMutation({
    mutationFn: (toolId: string) => processService.removeTool(params.id, toolId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['processes', params.id, 'tools'] });
      toast.success('Ferramenta removida do processo!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao remover ferramenta');
    },
  });

  const removeDocumentMutation = useMutation({
    mutationFn: (documentId: string) => processService.removeDocument(params.id, documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['processes', params.id, 'documents'] });
      toast.success('Documento removido do processo!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao remover documento');
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!process) {
    return (
      <div className="max-w-7xl mx-auto">
        <Card>
          <CardBody>
            <p className="text-center text-gray-500">Processo não encontrado</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  const children = allProcesses?.filter((p) => p.parentId === params.id) || [];

  const statusColors = {
    [ProcessStatus.ACTIVE]: 'bg-green-100 text-green-800',
    [ProcessStatus.IN_REVIEW]: 'bg-yellow-100 text-yellow-800',
    [ProcessStatus.DEPRECATED]: 'bg-red-100 text-red-800',
  };

  const statusLabels = {
    [ProcessStatus.ACTIVE]: 'Ativo',
    [ProcessStatus.IN_REVIEW]: 'Em Revisão',
    [ProcessStatus.DEPRECATED]: 'Descontinuado',
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <Link href="/processes">
          <Button variant="ghost" size="sm">
            <FiArrowLeft className="mr-2" />
            Voltar
          </Button>
        </Link>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{process.name}</h1>
              <div className="flex items-center space-x-3">
                <span
                  className={clsx(
                    'px-3 py-1 text-sm font-medium rounded-full',
                    statusColors[process.status]
                  )}
                >
                  {statusLabels[process.status]}
                </span>
                <span
                  className={clsx(
                    'px-3 py-1 text-sm font-medium rounded-full',
                    process.type === ProcessType.SYSTEMIC
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  )}
                >
                  {process.type === ProcessType.SYSTEMIC ? 'Sistêmico' : 'Manual'}
                </span>
              </div>
            </div>
            <Button onClick={() => setIsProcessModalOpen(true)} size="sm">
              Editar
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          {process.description && (
            <p className="text-gray-600 mb-4">{process.description}</p>
          )}
          {process.parent && (
            <div className="text-sm text-gray-500">
              Subprocesso de: <Link href={`/processes/${process.parent.id}`} className="text-primary-600 hover:underline">{process.parent.name}</Link>
            </div>
          )}
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FiUsers className="text-gray-600" />
                <h3 className="font-semibold text-gray-900">Pessoas</h3>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsAddPeopleModalOpen(true)}
              >
                <FiPlus className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardBody>
            {people && people.length > 0 ? (
              <ul className="space-y-2">
                {people.map((person) => (
                  <li
                    key={person.id}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{person.name}</p>
                      {person.role && (
                        <p className="text-xs text-gray-500">{person.role}</p>
                      )}
                    </div>
                    <button
                      onClick={() => removePersonMutation.mutate(person.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                Nenhuma pessoa vinculada
              </p>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FiTool className="text-gray-600" />
                <h3 className="font-semibold text-gray-900">Ferramentas</h3>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsAddToolsModalOpen(true)}
              >
                <FiPlus className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardBody>
            {tools && tools.length > 0 ? (
              <ul className="space-y-2">
                {tools.map((tool) => (
                  <li
                    key={tool.id}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                  >
                    <p className="text-sm font-medium text-gray-900">{tool.name}</p>
                    <button
                      onClick={() => removeToolMutation.mutate(tool.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                Nenhuma ferramenta vinculada
              </p>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FiFileText className="text-gray-600" />
                <h3 className="font-semibold text-gray-900">Documentos</h3>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsAddDocsModalOpen(true)}
              >
                <FiPlus className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardBody>
            {documents && documents.length > 0 ? (
              <ul className="space-y-2">
                {documents.map((document) => (
                  <li
                    key={document.id}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                  >
                    <p className="text-sm font-medium text-gray-900">{document.title}</p>
                    <button
                      onClick={() => removeDocumentMutation.mutate(document.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                Nenhum documento vinculado
              </p>
            )}
          </CardBody>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FiGitBranch className="text-gray-600" />
              <h3 className="font-semibold text-gray-900">Subprocessos</h3>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setShowHierarchy(!showHierarchy)}
              >
                {showHierarchy ? 'Ver Lista' : 'Ver Hierarquia'}
              </Button>
              <Button
                size="sm"
                onClick={() => setIsProcessModalOpen(true)}
              >
                <FiPlus className="mr-2 w-4 h-4" />
                Adicionar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          {showHierarchy ? (
            <ProcessHierarchyView processId={params.id} allProcesses={allProcesses || []} />
          ) : children.length > 0 ? (
            <div className="space-y-3">
              {children.map((child) => (
                <Link
                  key={child.id}
                  href={`/processes/${child.id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{child.name}</h4>
                      {child.description && (
                        <p className="text-sm text-gray-500 mt-1">{child.description}</p>
                      )}
                    </div>
                    <span
                      className={clsx(
                        'px-2 py-1 text-xs font-medium rounded-full',
                        statusColors[child.status]
                      )}
                    >
                      {statusLabels[child.status]}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">
              Nenhum subprocesso cadastrado
            </p>
          )}
        </CardBody>
      </Card>

      <ProcessModal
        isOpen={isProcessModalOpen}
        onClose={() => setIsProcessModalOpen(false)}
        parentId={params.id}
        departmentId={process.departmentId}
      />

      <AddResourceModal
        isOpen={isAddPeopleModalOpen}
        onClose={() => setIsAddPeopleModalOpen(false)}
        title="Adicionar Pessoas"
        items={availablePeople?.data || []}
        selectedIds={people?.map((p) => p.id) || []}
        onAdd={(personId) => processService.addPerson(params.id, personId)}
        queryKey={['processes', params.id, 'people']}
        renderItem={(person) => (
          <div>
            <p className="font-medium">{person.name}</p>
            {person.role && <p className="text-sm text-gray-500">{person.role}</p>}
          </div>
        )}
      />

      <AddResourceModal
        isOpen={isAddToolsModalOpen}
        onClose={() => setIsAddToolsModalOpen(false)}
        title="Adicionar Ferramentas"
        items={availableTools?.data || []}
        selectedIds={tools?.map((t) => t.id) || []}
        onAdd={(toolId) => processService.addTool(params.id, toolId)}
        queryKey={['processes', params.id, 'tools']}
        renderItem={(tool) => <p className="font-medium">{tool.name}</p>}
      />

      <AddResourceModal
        isOpen={isAddDocsModalOpen}
        onClose={() => setIsAddDocsModalOpen(false)}
        title="Adicionar Documentos"
        items={availableDocuments?.data || []}
        selectedIds={documents?.map((d) => d.id) || []}
        onAdd={(documentId) => processService.addDocument(params.id, documentId)}
        queryKey={['processes', params.id, 'documents']}
        renderItem={(document) => (
          <div>
            <p className="font-medium">{document.title}</p>
            {document.description && (
              <p className="text-sm text-gray-500">{document.description}</p>
            )}
          </div>
        )}
      />
    </div>
  );
}

