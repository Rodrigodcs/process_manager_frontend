'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { initAuth, isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated && pathname !== '/login') {
        router.push('/login');
      }
      else if (isAuthenticated && pathname === '/login') {
        router.push('/');
      }
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f1419] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

