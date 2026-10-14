'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Radio,
  Sliders,
  LayoutTemplate,
  Palette,
  Tags,
  CalendarDays,
  Calendar,
  MapPin,
  Users,
  UserCheck,
  Shield,
  QrCode,
  CheckCircle2,
  Hourglass,
  UserCog,
  Briefcase,
  Mic,
  Music,
  Image as ImageIcon,
  Sparkles,
  Crop,
  Bell,
  HelpCircle,
  History,
  BarChart3,
  FileSpreadsheet,
  CloudLightning,
  KeyRound,
  Activity,
  HeartPulse,
  ExternalLink,
  Trophy,
  Code2,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: any;
  badge?: string;
  highlight?: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();

  const navGroups: NavGroup[] = [
    {
      title: 'OPERATIONS',
      items: [
        { label: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'Live Control', href: '/admin/live', icon: Radio, badge: 'PULSE' },
        { label: 'Entry Gate Station', href: '/entry', icon: QrCode, badge: 'LIVE', highlight: true },
      ],
    },
    {
      title: 'FESTIVAL MANAGEMENT',
      items: [
        { label: 'Festival Settings', href: '/admin/settings', icon: Sliders },
        { label: 'Homepage Manager', href: '/admin/homepage', icon: LayoutTemplate },
        { label: 'Brand System', href: '/admin/brand', icon: Palette },
        { label: 'Categories', href: '/admin/categories', icon: Tags },
        { label: 'Events Hub', href: '/admin/events', icon: CalendarDays },
        { label: 'Results & Laurels', href: '/admin/results', icon: Trophy, badge: 'NEW' },
        { label: 'Schedule Admin', href: '/admin/schedule', icon: Calendar },
        { label: 'Venues & Arenas', href: '/admin/venues', icon: MapPin },
        { label: 'Checkpoint Gates', href: '/admin/gates', icon: MapPin },
      ],
    },
    {
      title: 'REGISTRATION & ACCESS',
      items: [
        { label: 'Registrations', href: '/admin/registrations', icon: UserCheck },
        { label: 'Participants', href: '/admin/participants', icon: Users },
        { label: 'Teams & Squads', href: '/admin/teams', icon: Shield },
        { label: 'Tickets', href: '/admin/tickets', icon: QrCode },
        { label: 'QR Check-In', href: '/admin/checkin', icon: CheckCircle2 },
        { label: 'Attendance', href: '/admin/attendance', icon: Activity },
        { label: 'Waitlist', href: '/admin/waitlist', icon: Hourglass },
      ],
    },
    {
      title: 'PEOPLE',
      items: [
        { label: 'Organizers', href: '/admin/organizers', icon: UserCog },
        { label: 'Coordinators', href: '/admin/coordinators', icon: Briefcase },
        { label: 'Speakers & Guests', href: '/admin/speakers', icon: Mic },
        { label: 'Performers', href: '/admin/performers', icon: Music },
      ],
    },
    {
      title: 'CONTENT & CREATIVE',
      items: [
        { label: 'Media Library', href: '/admin/media', icon: ImageIcon },
        { label: 'AI Visual Generator', href: '/admin/ai-studio', icon: Sparkles },
        { label: 'Frame Studio', href: '/admin/frame-studio', icon: Crop },
        { label: 'Announcements', href: '/admin/announcements', icon: Bell },
        { label: 'FAQ Manager', href: '/admin/faq', icon: HelpCircle },
        { label: 'Sponsors', href: '/admin/sponsors', icon: Shield },
      ],
    },
    {
      title: 'INTELLIGENCE & REPORTS',
      items: [
        { label: 'Festival Analytics', href: '/admin/analytics', icon: BarChart3 },
        { label: 'Data Export Center', href: '/admin/reports', icon: FileSpreadsheet },
        { label: 'Google Sheets', href: '/admin/sheets', icon: CloudLightning },
      ],
    },
    {
      title: 'SYSTEM & SECURITY',
      items: [
        { label: 'User Roles', href: '/admin/users', icon: Users },
        { label: 'Security & Password', href: '/admin/settings/security', icon: KeyRound },
        { label: 'Activity Logs', href: '/admin/activity', icon: Activity },
        { label: 'Version History', href: '/admin/version-history', icon: History },
        { label: 'System Health', href: '/admin/system', icon: HeartPulse },
        { label: 'Settings', href: '/admin/settings', icon: Sliders },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-[#090814] text-white flex flex-col justify-between shrink-0 border-r border-white/10 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-white/10">
        <Link href="/admin/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#5227FF] via-[#FF2E93] to-[#FF5E3A] flex items-center justify-center font-black font-display text-white text-base shadow-md">
            C
          </div>
          <div>
            <span className="font-display font-black text-lg tracking-tight text-white block">
              COLORIDO <span className="text-[#5227FF]">OS</span>
            </span>
            <span className="text-[10px] font-bold text-[#00DCEB] tracking-wider uppercase block">
              Festival Operations
            </span>
          </div>
        </Link>
      </div>

      {/* Nav Items List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navGroups.map((grp) => (
          <div key={grp.title} className="space-y-1">
            <span className="px-3 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 block mb-1.5">
              {grp.title}
            </span>
            {grp.items.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#5227FF] text-white shadow-md'
                      : item.highlight
                      ? 'text-white bg-white/5 hover:bg-white/10'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-[#FF2E93]' : 'text-gray-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-red-500 text-white animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Sidebar Footer Link */}
      <div className="p-4 border-t border-white/10 bg-white/[0.02]">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <span>View Public Site</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>
    </aside>
  );
};
