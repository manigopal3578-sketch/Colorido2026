'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Code2,
  Trophy,
  Calendar,
  Users,
  Save,
  CheckCircle2,
  ExternalLink,
  Laptop,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { WebsiteChallengeConfig } from '@/lib/types';

export default function AdminChallengePage() {
  const [config, setConfig] = useState<WebsiteChallengeConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchChallenge = () => {
    fetch('/api/admin/challenge')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setConfig(data.challenge);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchChallenge();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;

    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      const data = await res.json();
      if (data.success) {
        setConfig(data.challenge);
        setSuccessMsg('Website Challenge parameters updated and published successfully!');
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setErrorMsg(data.message || 'Failed to update challenge settings');
      }
    } catch (err: any) {
      setErrorMsg('Network error saving settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center justify-center gap-3">
        <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <span>Loading Challenge Configuration...</span>
      </div>
    );
  }

  if (!config) {
    return <div>Failed to load challenge configuration.</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-black uppercase tracking-widest mb-2">
            <Code2 className="w-3.5 h-3.5" />
            <span>WEBSITE DESIGN CHALLENGE</span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-gray-900 tracking-tight">
            Official Challenge Settings & Criteria
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Configure dates, 2-member team requirement, cash prizes, and guidelines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/challenge"
            target="_blank"
            className="px-3.5 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-300 text-gray-700 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition"
          >
            <span>Preview Public Page</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Core Challenge Identity */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-900 text-base border-b border-gray-100 pb-2">
            Challenge Identification & Subtitle
          </h2>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Challenge Title
              </label>
              <input
                type="text"
                value={config.title}
                onChange={(e) => setConfig({ ...config, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:border-indigo-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Subtitle Phrase
              </label>
              <input
                type="text"
                value={config.subtitle}
                onChange={(e) => setConfig({ ...config, subtitle: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-indigo-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Full Description
              </label>
              <textarea
                rows={3}
                value={config.description}
                onChange={(e) => setConfig({ ...config, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-indigo-600"
                required
              />
            </div>
          </div>
        </div>

        {/* Essential Rules: Deadline, Team Size, Tech */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-900 text-base border-b border-gray-100 pb-2">
            Official Parameters & Rules
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Official Deadline
              </label>
              <input
                type="text"
                value={config.deadline}
                onChange={(e) => setConfig({ ...config, deadline: e.target.value })}
                placeholder="30 SEPTEMBER 2026"
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:border-indigo-600"
                required
              />
              <span className="text-[10px] text-gray-500 mt-1 block">Preserve official: 30 SEPTEMBER 2026</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Team Size Constraint
              </label>
              <input
                type="text"
                value={config.teamSize}
                onChange={(e) => setConfig({ ...config, teamSize: e.target.value })}
                placeholder="2 MEMBERS ONLY"
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:border-indigo-600"
                required
              />
              <span className="text-[10px] text-gray-500 mt-1 block">Specific to Website Challenge</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Status
              </label>
              <select
                value={config.status}
                onChange={(e) => setConfig({ ...config, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:border-indigo-600"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="UPCOMING">UPCOMING</option>
                <option value="CLOSED">CLOSED</option>
              </select>
            </div>
          </div>
        </div>

        {/* Prize Money Pool */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-900 text-base border-b border-gray-100 pb-2">
            Prize Money Structure
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
                1st Prize (Champion)
              </label>
              <input
                type="text"
                value={config.prizes.first}
                onChange={(e) =>
                  setConfig({ ...config, prizes: { ...config.prizes, first: e.target.value } })
                }
                placeholder="₹3,000/-"
                className="w-full px-3 py-2 border border-amber-300 bg-amber-50/50 rounded-xl text-xs font-black text-gray-900 focus:outline-none focus:border-amber-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                2nd Prize (Runner-Up)
              </label>
              <input
                type="text"
                value={config.prizes.second}
                onChange={(e) =>
                  setConfig({ ...config, prizes: { ...config.prizes, second: e.target.value } })
                }
                placeholder="₹2,000/-"
                className="w-full px-3 py-2 border border-gray-300 bg-gray-50 rounded-xl text-xs font-black text-gray-900 focus:outline-none focus:border-indigo-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">
                3rd Prize (Second Runner-Up)
              </label>
              <input
                type="text"
                value={config.prizes.third}
                onChange={(e) =>
                  setConfig({ ...config, prizes: { ...config.prizes, third: e.target.value } })
                }
                placeholder="₹1,500/-"
                className="w-full px-3 py-2 border border-gray-300 bg-gray-50 rounded-xl text-xs font-black text-gray-900 focus:outline-none focus:border-indigo-600"
                required
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Changes...' : 'Save & Publish Challenge Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
