import Link from 'next/link';
import { FiFileText, FiFolder, FiTool, FiUsers } from 'react-icons/fi';

export default function Home() {
    const cards = [
        {
            title: 'Departamentos',
            description: 'Gerencie as áreas da sua organização',
            icon: FiFolder,
            href: '/departments',
            color: 'bg-blue-500',
        },
        {
            title: 'Pessoas',
            description: 'Gerencie os responsáveis pelos processos',
            icon: FiUsers,
            href: '/people',
            color: 'bg-purple-500',
        },
        {
            title: 'Ferramentas',
            description: 'Cadastre ferramentas e sistemas utilizados',
            icon: FiTool,
            href: '/tools',
            color: 'bg-orange-500',
        },
        {
            title: 'Documentos',
            description: 'Organize a documentação dos processos',
            icon: FiFileText,
            href: '/documents',
            color: 'bg-pink-500',
        },
    ];

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-100 mb-2">
                    Process Manager
                </h1>
                <p className="text-lg text-gray-400">
                    Mapeie, organize e gerencie os processos da sua organização
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <Link
                            key={card.href}
                            href={card.href}
                            className="group block p-6 bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-200 border border-gray-700 hover:border-gray-600"
                        >
                            <div className={`inline-flex p-3 rounded-lg ${card.color} text-white mb-4`}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-100 mb-2 group-hover:text-gray-50 transition-colors">
                                {card.title}
                            </h3>
                            <p className="text-gray-400">{card.description}</p>
                        </Link>
                    );
                })}
            </div>

            <div className="mt-12 bg-gray-800 p-8 rounded-lg shadow-md border border-gray-700">
                <h2 className="text-2xl font-bold text-gray-100 mb-4">
                    Sobre o Sistema
                </h2>
                <div className="prose prose-blue max-w-none">
                    <p className="text-gray-300 mb-4">
                        Esta ferramenta foi desenvolvida para ajudar empresas a mapear e documentar
                        seus processos internos de forma clara e organizada. Com ela, você pode:
                    </p>
                    <ul className="space-y-2 text-gray-300">
                        <li>• Criar uma hierarquia ilimitada de processos e subprocessos</li>
                        <li>• Organizar processos por departamento ou área</li>
                        <li>• Vincular pessoas responsáveis a cada processo</li>
                        <li>• Documentar ferramentas e sistemas utilizados</li>
                        <li>• Anexar documentação relevante aos processos</li>
                        <li>• Diferenciar entre processos manuais e sistêmicos</li>
                        <li>• Acompanhar o status de cada processo</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

