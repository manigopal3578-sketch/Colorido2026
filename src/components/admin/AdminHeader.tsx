'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Command,
  Bell,
  LogOut,
  Shield,
  Activity,
  CheckCircle,
} from 'lucide-react';

interface AdminHeaderProps {
  user?: {
    name: string;
    organizerId: string;
    role: string;
  };
  onOpenCommandPalette: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ user, onOpenCommandPalette }) => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch {
      router.push('/admin/login');
    }
  };

  return (
    <header className="h-16 px-6 bg-white border-b border-border flex items-center justify-between z-30 shrink-0">
      {/* Search & Command Palette trigger */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-[#F5F5FA] hover:bg-gray-200/80 text-xs font-semibold text-[#525266] border border-gray-200 transition-colors"
        >
          <Search className="w-3.5 h-3.5 text-gray-500" />
          <span>Quick actions & search...</span>
          <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white border border-gray-300 text-[10px] font-mono text-gray-700 shadow-xs">
            <Command className="w-2.5 h-2.5" /> K
          </kbd>
        </button>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 border border-green-200 text-[11px] font-bold text-green-700">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span>PUBLIC SYNC: ACTIVE</span>
        </div>
      </div>

      {/* User profile & actions */}
      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <span className="text-xs font-bold text-[#090814] block leading-tight">
            {user?.name || 'Festival Organizer'}
          </span>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#5227FF]">
            {user?.role || 'ADMIN'} • {user?.organizerId || 'CLR26-ADMIN'}
          </span>
        </div>

        <button
          onClick={handleLogout}
          title="Sign Out of COLORIDO OS"
          className="p-2 rounded-xl border border-gray-200 hover:bg-red-50 hover:text-red-600 text-gray-500 transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
