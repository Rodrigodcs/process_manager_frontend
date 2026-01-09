'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { useState, useRef, useEffect } from 'react';
import { 
  FiLogOut, 
  FiUser, 
  FiStar, 
  FiHeart, 
  FiSmile, 
  FiZap, 
  FiCoffee,
  FiTrendingUp,
  FiTarget,
  FiAward,
  FiCode,
  FiCommand,
  FiCpu,
} from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { IconType } from 'react-icons';

const ICON_MAP: Record<string, IconType> = {
  FiUser,
  FiStar,
  FiHeart,
  FiSmile,
  FiZap,
  FiCoffee,
  FiTrendingUp,
  FiTarget,
  FiAward,
  FiCode,
  FiCommand,
  FiCpu,
};

export default function UserMenu() {
  const { user, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!user) return null;

  const initial = user.name?.charAt(0).toUpperCase() || 'U';
  const displayColor = user.color || '#3b82f6';
  
  const IconComponent = user.icon && ICON_MAP[user.icon] ? ICON_MAP[user.icon] : FiUser;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-700/50 transition-colors"
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg"
          style={{ backgroundColor: displayColor }}
        >
          <IconComponent className="w-5 h-5" />
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-sm font-medium text-white">{user.name}</p>
          <p className="text-xs text-gray-400">{user.email}</p>
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-lg shadow-xl border border-gray-700 py-2 z-50">
          <div className="px-4 py-3 border-b border-gray-700">
            <p className="text-sm font-medium text-white">{user.name}</p>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <FiLogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      )}
    </div>
  );
}

