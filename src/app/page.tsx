'use client';

import ActivityChart from '@/components/dashboard/ActivityChart';
import DepartmentChart from '@/components/dashboard/DepartmentChart';
import ProcessHierarchyCard from '@/components/dashboard/ProcessHierarchyCard';
import StatsCard from '@/components/dashboard/StatsCard';
import { dashboardService } from '@/services/dashboard';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { FiFileText, FiFolder, FiTool, FiUsers } from 'react-icons/fi';

export default function Home() {
    const { data: stats, isLoading } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: () => dashboardService.getStats(),
    });

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-100 mb-2">Dashboard</h1>
                    <p className="text-lg text-gray-400">Carregando informações...</p>
                </div>
                <div className="animate-pulse space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-gray-800 h-32 rounded-lg"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-100 mb-2">Dashboard</h1>
                    <p className="text-lg text-gray-400">Erro ao carregar informações</p>
                </div>
            </div>
        );
    }

    const quickAccessCards = [
        {
            title: 'Departamentos e Processos',
            description: 'Acesse os departamentos e seus processos',
            icon: FiFolder,
            href: '/departments',
            color: 'bg-blue-500',
            count: stats.overview.totalDepartments,
            highlighted: true,
        },
        {
            title: 'Pessoas',
            description: 'Gerencie os responsáveis',
            icon: FiUsers,
            href: '/people',
            color: 'bg-purple-500',
            count: stats.overview.totalPeople,
            highlighted: false,
        },
        {
            title: 'Ferramentas',
            description: 'Cadastre ferramentas e sistemas',
            icon: FiTool,
            href: '/tools',
            color: 'bg-orange-500',
            count: stats.overview.totalTools,
            highlighted: false,
        },
        {
            title: 'Documentos',
            description: 'Organize a documentação',
            icon: FiFileText,
            href: '/documents',
            color: 'bg-pink-500',
            count: stats.overview.totalDocuments,
            highlighted: false,
        },
    ];

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-100 mb-2">Dashboard</h1>
                <p className="text-lg text-gray-400">
                    Visão geral dos processos da sua organização
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatsCard
                    title="Total de Processos"
                    value={stats.overview.totalProcesses}
                    icon={FiFolder}
                    color="bg-blue-500"
                    subtitle={`${stats.overview.totalSubprocesses} subprocessos`}
                />
                <StatsCard
                    title="Departamentos"
                    value={stats.overview.totalDepartments}
                    icon={FiFolder}
                    color="bg-indigo-500"
                />
                <StatsCard
                    title="Pessoas"
                    value={stats.overview.totalPeople}
                    icon={FiUsers}
                    color="bg-purple-500"
                />
                <StatsCard
                    title="Recursos"
                    value={stats.overview.totalTools + stats.overview.totalDocuments}
                    icon={FiTool}
                    color="bg-orange-500"
                    subtitle={`${stats.overview.totalTools} ferramentas, ${stats.overview.totalDocuments} docs`}
                />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <DepartmentChart departments={stats.processesByDepartment} />
                <ActivityChart recentActivity={stats.recentActivity} />
            </div>

            {/* Process Hierarchy */}
            <div className="mb-8">
                <ProcessHierarchyCard hierarchy={stats.processHierarchy} />
            </div>

            {/* Quick Access Cards */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-100 mb-4">Acesso Rápido</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {quickAccessCards.map((card) => {
                        const Icon = card.icon;
                        return (
                            <Link
                                key={card.href}
                                href={card.href}
                                className={`group block p-4 rounded-lg shadow-md hover:shadow-xl transition-all duration-200 border ${card.highlighted
                                        ? 'bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-blue-500 hover:border-blue-400 ring-2 ring-blue-500/50'
                                        : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className={`inline-flex p-2 rounded-lg ${card.color} text-white`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <span className="text-2xl font-bold text-gray-100">{card.count}</span>
                                </div>
                                <h3 className={`text-base font-semibold mb-1 transition-colors ${card.highlighted ? 'text-blue-300' : 'text-gray-100 group-hover:text-gray-50'
                                    }`}>
                                    {card.title}
                                </h3>
                                <p className="text-xs text-gray-400">{card.description}</p>
                                {card.highlighted && (
                                    <div className="mt-2 text-xs text-blue-400 font-medium flex items-center gap-1">
                                        ⭐ Principal
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* About System */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
                <h2 className="text-xl font-bold text-gray-100 mb-3">Sobre o Sistema</h2>
                <div className="prose prose-blue max-w-none">
                    <p className="text-gray-300 mb-3 text-sm">
                        Esta ferramenta foi desenvolvida para ajudar empresas a mapear e documentar
                        seus processos internos de forma clara e organizada.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                        <ul className="space-y-1 text-gray-300 text-sm">
                            <li>• Hierarquia ilimitada de processos</li>
                            <li>• Organização por departamento</li>
                            <li>• Vinculação de responsáveis</li>
                            <li>• Documentação de ferramentas</li>
                        </ul>
                        <ul className="space-y-1 text-gray-300 text-sm">
                            <li>• Anexação de documentos</li>
                            <li>• Processos manuais e sistêmicos</li>
                            <li>• Acompanhamento de status</li>
                            <li>• Dashboard com métricas</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
