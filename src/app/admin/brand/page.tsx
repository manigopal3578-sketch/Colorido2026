'use client';

import React, { useState, useEffect } from 'react';
import { Palette, CheckCircle2, RefreshCw, Sparkles } from 'lucide-react';

export default function AdminBrandPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [preset, setPreset] = useState<'EDITORIAL' | 'FESTIVAL' | 'ENERGETIC' | 'MINIMAL'>('FESTIVAL');
  const [primaryColor, setPrimaryColor] = useState('#5227FF');
  const [culturalColor, setCulturalColor] = useState('#FF2E93');
  const [sportsColor, setSportsColor] = useState('#FF5E3A');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetch('/api/data/state')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.settings) {
          setData(json);
          setPreset(json.settings.themePreset || 'FESTIVAL');
          if (json.settings.colors) {
            setPrimaryColor(json.settings.colors.primary || '#5227FF');
            setCulturalColor(json.settings.colors.cultural || '#FF2E93');
            setSportsColor(json.settings.colors.sports || '#FF5E3A');
          }
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleApplyPreset = (theme: 'EDITORIAL' | 'FESTIVAL' | 'ENERGETIC' | 'MINIMAL') => {
    setPreset(theme);
    if (theme === 'EDITORIAL') {
      setPrimaryColor('#1B1A24');
      setCulturalColor('#E01C7B');
      setSportsColor('#E84925');
    } else if (theme === 'FESTIVAL') {
      setPrimaryColor('#5227FF');
      setCulturalColor('#FF2E93');
      setSportsColor('#FF5E3A');
    } else if (theme === 'ENERGETIC') {
      setPrimaryColor('#6838FF');
      setCulturalColor('#FF007A');
      setSportsColor('#FF4500');
    } else if (theme === 'MINIMAL') {
      setPrimaryColor('#090814');
      setCulturalColor('#D63384');
      setSportsColor('#FD7E14');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMsg('');

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updates: {
            themePreset: preset,
            colors: {
              primary: primaryColor,
              cultural: culturalColor,
              sports: sportsColor,
              cyan: '#00DCEB',
              gold: '#FFC857',
            },
          },
        }),
      });
      const json = await res.json();
      if (json.success) {
        setMsg('Brand system colors and theme preset successfully updated across festival platform!');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-xs font-bold text-gray-500 uppercase tracking-widest">Loading Brand System...</div>;
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-light text-[#5227FF] text-xs font-black uppercase tracking-widest mb-2">
            <Palette className="w-3.5 h-3.5" />
            <span>VISUAL IDENTITY SYSTEM</span>
          </div>
          <h1 className="font-display font-black text-3xl text-[#090814]">
            BRAND SYSTEM & PRESETS
          </h1>
          <p className="text-xs sm:text-sm text-[#525266]">
            Control approved color hierarchies and typography themes with guaranteed readability.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 rounded-xl bg-[#5227FF] hover:bg-primary-hover text-white text-xs sm:text-sm font-bold shadow-md transition-all shrink-0"
        >
          {saving ? 'Saving...' : 'Apply Brand Settings'}
        </button>
      </div>

      {msg && (
        <div className="p-3.5 rounded-xl bg-green-50 border border-green-200 text-green-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <span>{msg}</span>
        </div>
      )}

      {/* Preset Selector */}
      <div className="p-8 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-6">
        <div>
          <h2 className="font-display font-bold text-xl text-[#090814]">
            Curated Festival Design Presets
          </h2>
          <p className="text-xs text-[#525266] mt-0.5">
            Select an officially tested visual preset to preserve contrast and typography balance.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[
            { id: 'FESTIVAL', name: 'Festival Electric', desc: 'Vibrant purple, vivid magenta, dynamic coral (Default)' },
            { id: 'EDITORIAL', name: 'Editorial Prestige', desc: 'Sophisticated deep tones, high-fashion layout' },
            { id: 'ENERGETIC', name: 'Hyper Velocity', desc: 'Punchy ultra-saturated neon accents' },
            { id: 'MINIMAL', name: 'Clean Modernist', desc: 'High white space, restrained accent hierarchy' },
          ].map((th) => (
            <button
              key={th.id}
              onClick={() => handleApplyPreset(th.id as any)}
              className={`p-5 rounded-2xl border-2 text-left transition-all ${
                preset === th.id
                  ? 'border-[#5227FF] bg-primary-light/30 shadow-md scale-[1.02]'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-[10px] font-black uppercase tracking-wider block text-[#5227FF]">
                {th.id}
              </span>
              <strong className="font-display font-bold text-base block text-[#090814] mt-0.5">
                {th.name}
              </strong>
              <p className="text-xs text-[#525266] mt-1">{th.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Color Hex Fields */}
      <div className="p-8 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-6">
        <h2 className="font-display font-bold text-xl text-[#090814]">
          Color Palette Tokens
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-4 rounded-2xl bg-[#FBFBFD] border border-gray-200 space-y-2">
            <span className="text-xs font-bold text-[#525266]">Primary Accent</span>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200"
              />
              <span className="font-mono text-xs font-bold text-[#090814]">{primaryColor}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#FBFBFD] border border-gray-200 space-y-2">
            <span className="text-xs font-bold text-[#FF2E93]">Cultural World Color</span>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={culturalColor}
                onChange={(e) => setCulturalColor(e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200"
              />
              <span className="font-mono text-xs font-bold text-[#090814]">{culturalColor}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#FBFBFD] border border-gray-200 space-y-2">
            <span className="text-xs font-bold text-[#FF5E3A]">Sports World Color</span>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={sportsColor}
                onChange={(e) => setSportsColor(e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200"
              />
              <span className="font-mono text-xs font-bold text-[#090814]">{sportsColor}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
