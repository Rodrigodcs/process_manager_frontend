'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiFileText, FiFolder, FiGitBranch, FiHome, FiTool, FiUsers } from 'react-icons/fi';

const navigation = [
  { name: 'Início', href: '/', icon: FiHome },
  { name: 'Departamentos', href: '/departments', icon: FiFolder },
  { name: 'Processos', href: '/processes', icon: FiGitBranch },
  { name: 'Pessoas', href: '/people', icon: FiUsers },
  { name: 'Ferramentas', href: '/tools', icon: FiTool },
  { name: 'Documentos', href: '/documents', icon: FiFileText },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-64 bg-[#0f1419] shadow-2xl z-10">
      <div className="flex items-center justify-center h-16 px-4 bg-[#0a0e13] border-b border-gray-800">
        <h1 className="text-xl font-bold text-white">Process Manager</h1>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                isActive
                  ? 'bg-[#1a1f2e] text-white'
                  : 'text-gray-300 hover:bg-[#1a1f2e] hover:text-white'
              )}
            >
              <Icon className="mr-3 w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-700">
        <p className="text-xs text-gray-500 text-center">
          © 2026 Process Manager
        </p>
      </div>
    </div>
  );
}

