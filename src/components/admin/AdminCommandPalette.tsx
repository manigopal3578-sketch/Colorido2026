'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Plus,
  CheckCircle2,
  Users,
  Radio,
  LayoutTemplate,
  Palette,
  BarChart3,
  FileSpreadsheet,
  KeyRound,
  HeartPulse,
  Calendar,
  X,
} from 'lucide-react';

interface AdminCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminCommandPalette: React.FC<AdminCommandPaletteProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const actions = [
    { title: 'Open QR Check-In Desk', href: '/admin/checkin', icon: CheckCircle2, tag: 'Operations' },
    { title: 'Live Festival Control', href: '/admin/live', icon: Radio, tag: 'Live' },
    { title: 'View All Registrations', href: '/admin/registrations', icon: Users, tag: 'Data' },
    { title: 'Manage Events Roster', href: '/admin/events', icon: Calendar, tag: 'Events' },
    { title: 'Homepage Section Builder', href: '/admin/homepage', icon: LayoutTemplate, tag: 'Design' },
    { title: 'Brand Colors & Presets', href: '/admin/brand', icon: Palette, tag: 'Branding' },
    { title: 'Festival Analytics & Graphs', href: '/admin/analytics', icon: BarChart3, tag: 'Analytics' },
    { title: 'Download Master CSV Reports', href: '/admin/reports', icon: FileSpreadsheet, tag: 'Reports' },
    { title: 'Rotate Admin Password / Security', href: '/admin/settings/security', icon: KeyRound, tag: 'Security' },
    { title: 'System Health Diagnostics', href: '/admin/system', icon: HeartPulse, tag: 'Diagnostics' },
  ];

  const filtered = actions.filter((a) =>
    a.title.toLowerCase().includes(query.toLowerCase()) ||
    a.tag.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (href: string) => {
    onClose();
    router.push(href);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-fadeIn">
        {/* Search Input */}
        <div className="p-4 border-b border-gray-200 flex items-center gap-3">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            autoFocus
            type="text"
            placeholder="Type a command or module name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-sm font-semibold text-[#090814] focus:outline-none placeholder:text-gray-400"
          />
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 text-gray-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.title}
                onClick={() => handleSelect(act.href)}
                className="w-full p-3 rounded-xl hover:bg-[#F5F5FA] flex items-center justify-between text-left transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-[#5227FF] group-hover:text-white transition-colors">
                    <Icon className="w-4 h-4 text-gray-700 group-hover:text-white" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-[#090814]">
                    {act.title}
                  </span>
                </div>

                <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                  {act.tag}
                </span>
              </button>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-8 text-xs text-gray-400">
              No matching commands found.
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-2.5 bg-[#FBFBFD] border-t border-gray-200 text-center text-[10px] text-gray-400">
          Navigate with cursor • Press Esc to close
        </div>
      </div>
    </div>
  );
};
