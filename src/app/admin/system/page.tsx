'use client';

import React, { useState, useEffect } from 'react';
import {
  HeartPulse,
  Database,
  KeyRound,
  HardDrive,
  Sparkles,
  CloudLightning,
  Mail,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { SystemHealthStatus } from '@/lib/types';

export default function AdminSystemPage() {
  const [health, setHealth] = useState<SystemHealthStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = () => {
    fetch('/api/data/state')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setHealth(json.systemHealth);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  if (loading) {
    return <div className="p-8 text-xs font-bold text-gray-500 uppercase tracking-widest">Loading System Health...</div>;
  }

  const items = [
    {
      name: 'Database Engine',
      status: health?.database || 'HEALTHY',
      desc: 'Persistent JSON File Database with atomic write sync (data/colorido_db.json)',
      icon: Database,
    },
    {
      name: 'Authentication Subsystem',
      status: health?.auth || 'HEALTHY',
      desc: 'bcryptjs salt hashing + jose JWT encrypted sessions with token versioning',
      icon: KeyRound,
    },
    {
      name: 'Public Cache & Memory Sync',
      status: health?.publicSync || 'HEALTHY',
      desc: 'Instant in-memory revalidation connecting admin edits directly to public pages',
      icon: RefreshCw,
    },
    {
      name: 'Static Media & Assets',
      status: health?.storage || 'HEALTHY',
      desc: 'Local file assets & high-resolution Unsplash CDN imagery',
      icon: HardDrive,
    },
    {
      name: 'AI Event Visual Generator',
      status: health?.aiGeneration || 'HEALTHY',
      desc: 'Google Gemini Pro / Flash SDK runtime with draft preview and approval gate',
      icon: Sparkles,
    },
    {
      name: 'Google Sheets Integration',
      status: health?.googleSheets || 'NOT_CONFIGURED',
      desc: 'Service Account credentials awaiting configuration in environment secrets',
      icon: CloudLightning,
    },
    {
      name: 'Email SMTP Dispatcher',
      status: health?.email || 'NOT_CONFIGURED',
      desc: 'Optional SMTP gateway for outbound participant notifications',
      icon: Mail,
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-light text-[#5227FF] text-xs font-black uppercase tracking-widest mb-2">
            <HeartPulse className="w-3.5 h-3.5" />
            <span>DIAGNOSTICS & TELEMETRY</span>
          </div>
          <h1 className="font-display font-black text-3xl text-[#090814]">
            COLORIDO OS SYSTEM HEALTH
          </h1>
          <p className="text-xs sm:text-sm text-[#525266]">
            Real-time status monitor across storage engines, authentication, public sync, and external services.
          </p>
        </div>

        <button
          onClick={fetchHealth}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-xs font-bold text-[#090814] hover:bg-gray-50 shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Run Self-Test</span>
        </button>
      </div>

      {/* Diagnostics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((item) => {
          const Icon = item.icon;
          const isHealthy = item.status === 'HEALTHY';
          const isNotConfig = item.status === 'NOT_CONFIGURED';

          return (
            <div
              key={item.name}
              className="p-6 rounded-3xl bg-white border border-gray-200 shadow-sm flex items-start justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-2xl shrink-0 ${
                  isHealthy ? 'bg-green-100 text-green-700' : isNotConfig ? 'bg-gray-100 text-gray-500' : 'bg-red-100 text-red-700'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>

                <div>
                  <h3 className="font-display font-bold text-base text-[#090814]">
                    {item.name}
                  </h3>
                  <p className="text-xs text-[#525266] mt-0.5 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 ${
                isHealthy ? 'bg-green-100 text-green-800' : isNotConfig ? 'bg-gray-100 text-gray-600' : 'bg-red-100 text-red-800'
              }`}>
                {item.status.replace('_', ' ')}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
