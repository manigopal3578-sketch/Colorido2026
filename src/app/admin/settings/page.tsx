'use client';

import React, { useState, useEffect } from 'react';
import { Sliders, CheckCircle2, Save, Calendar, Sparkles } from 'lucide-react';
import { FestivalSettings } from '@/lib/types';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<FestivalSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchSettings = () => {
    fetch('/api/data/state')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.settings) {
          setSettings(json.settings);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setMsg('');

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates: settings }),
      });
      const json = await res.json();
      if (json.success) {
        setMsg('Festival operational settings saved and synced with public website!');
        setSettings(json.settings);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return <div className="p-8 text-xs font-bold text-gray-500 uppercase tracking-widest">Loading Settings...</div>;
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-light text-[#5227FF] text-xs font-black uppercase tracking-widest mb-2">
          <Sliders className="w-3.5 h-3.5" />
          <span>FESTIVAL CONFIGURATION</span>
        </div>
        <h1 className="font-display font-black text-3xl text-[#090814]">
          FESTIVAL SETTINGS & DATES
        </h1>
        <p className="text-xs sm:text-sm text-[#525266]">
          Configure primary dates, active domains, countdown controls, and official collegiate institutional data.
        </p>
      </div>

      {msg && (
        <div className="p-3.5 rounded-xl bg-green-50 border border-green-200 text-green-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <span>{msg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Core Identity */}
        <div className="p-8 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-4">
          <h2 className="font-display font-bold text-lg text-[#090814]">
            Brand & College Identification
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-[#525266] mb-1">Festival Name</label>
              <input
                type="text"
                value={settings.festivalName}
                onChange={(e) => setSettings({ ...settings, festivalName: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-300 font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-[#525266] mb-1">Host College</label>
              <input
                type="text"
                value={settings.college}
                onChange={(e) => setSettings({ ...settings, college: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-300 font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-[#525266] mb-1">Primary Tagline</label>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-300"
              />
            </div>

            <div>
              <label className="block font-bold text-[#525266] mb-1">Secondary Experience Phrase</label>
              <input
                type="text"
                value={settings.secondaryPhrase}
                onChange={(e) => setSettings({ ...settings, secondaryPhrase: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-300"
              />
            </div>
          </div>
        </div>

        {/* Dates & Countdown Control */}
        <div className="p-8 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-4">
          <h2 className="font-display font-bold text-lg text-[#090814]">
            Official Dates & Live Countdown
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-[#525266] mb-1">Start Date (Day 01) *</label>
              <input
                type="date"
                value={settings.startDate}
                onChange={(e) => setSettings({ ...settings, startDate: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-300 font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-[#525266] mb-1">End Date (Day 02) *</label>
              <input
                type="date"
                value={settings.endDate}
                onChange={(e) => setSettings({ ...settings, endDate: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-300 font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-[#525266] mb-1">Opening Time *</label>
              <input
                type="time"
                value={settings.startTime}
                onChange={(e) => setSettings({ ...settings, startTime: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-300 font-semibold"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <input
              type="checkbox"
              id="countdown-toggle"
              checked={settings.countdownVisible}
              onChange={(e) => setSettings({ ...settings, countdownVisible: e.target.checked })}
              className="w-4 h-4 rounded text-[#5227FF]"
            />
            <label htmlFor="countdown-toggle" className="text-xs font-semibold text-[#090814]">
              Display Live Countdown Clock on Homepage
            </label>
          </div>
        </div>

        {/* Technical Postponement Notice Control */}
        <div className="p-8 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-4">
          <h2 className="font-display font-bold text-lg text-[#090814]">
            Technical Event Schedule Control
          </h2>

          <div className="text-xs space-y-3">
            <div>
              <label className="block font-bold text-[#525266] mb-1">Rescheduled Technical Date</label>
              <input
                type="date"
                value={settings.technicalPostponedDate}
                onChange={(e) => setSettings({ ...settings, technicalPostponedDate: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-300 font-semibold max-w-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-[#525266] mb-1">Notice Description</label>
              <input
                type="text"
                value={settings.technicalStatusNotice}
                onChange={(e) => setSettings({ ...settings, technicalStatusNotice: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-300"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="tech-card-toggle"
                checked={settings.technicalCardVisible}
                onChange={(e) => setSettings({ ...settings, technicalCardVisible: e.target.checked })}
                className="w-4 h-4 rounded text-[#5227FF]"
              />
              <label htmlFor="tech-card-toggle" className="text-xs font-semibold text-[#090814]">
                Show official Postponed Technical Events notice card in Event Explorer
              </label>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-4 px-6 rounded-2xl bg-[#090814] hover:bg-black text-white text-xs sm:text-sm font-bold shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save All Festival Settings'}</span>
        </button>
      </form>
    </div>
  );
}
