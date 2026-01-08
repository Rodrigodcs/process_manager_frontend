'use client';

import { usePathname } from 'next/navigation';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/departments': 'Departamentos',
  '/processes': 'Processos',
  '/people': 'Pessoas',
  '/tools': 'Ferramentas',
  '/documents': 'Documentos',
};

export default function Header() {
  const pathname = usePathname();
  
  // Check if we're in a department detail page
  const isDepartmentDetail = pathname.startsWith('/departments/') && pathname !== '/departments';
  
  let title = pageTitles[pathname] || 'Process Manager';
  
  if (isDepartmentDetail) {
    title = 'Processos';
  }

  return (
    <header className="bg-[#1a1f2e] shadow-lg border-b-2 border-gray-700/50">
      <div className="px-6 py-4">
        <h1 className="text-2xl font-semibold text-white">{title}</h1>
      </div>
    </header>
  );
}

