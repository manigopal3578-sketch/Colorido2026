'use client';

import React, { useState, useEffect } from 'react';
import {
  LayoutTemplate,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Save,
  Send,
  Calendar,
  Image as ImageIcon,
  Tag,
  Link as LinkIcon,
  Sliders,
} from 'lucide-react';
import { HomepageSectionConfig, HomepageHeroConfig } from '@/lib/types';

const defaultHero: HomepageHeroConfig = {
  institutionalLabel: 'R.V.R. & J.C. COLLEGE OF ENGINEERING • GUNTUR',
  title: 'COLORIDO',
  edition: '2K26',
  tagline: 'CREATE • COMPETE • EXPRESS • CONNECT',
  datesText: '28–29 DECEMBER 2026',
  targetDate: '2026-12-28T09:00:00+05:30',
  heroImage: '/images/colorido-hero-bg.jpg',
  countdownVisible: true,
  ctaPrimaryText: 'REGISTER NOW',
  ctaPrimaryLink: '/register',
  ctaPrimaryVisible: true,
  ctaSecondaryText: 'EXPLORE EVENTS',
  ctaSecondaryLink: '/events',
  ctaSecondaryVisible: true,
};

export default function AdminHomepageManagerPage() {
  const [sections, setSections] = useState<HomepageSectionConfig[]>([]);
  const [hero, setHero] = useState<HomepageHeroConfig>(defaultHero);
  const [publishedVersion, setPublishedVersion] = useState<number>(1);
  const [publishedAt, setPublishedAt] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'SECTIONS' | 'HERO'>('SECTIONS');
  const [loading, setLoading] = useState(true);
  const [savingDraft, setSavingDraft] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchHomepageData = () => {
    fetch('/api/admin/homepage')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          const config = json.draft || json.published;
          if (config) {
            if (config.hero) setHero(config.hero);
            if (config.sections) {
              const sorted = [...config.sections].sort((a, b) => a.order - b.order);
              setSections(sorted);
            }
            if (config.version) setPublishedVersion(config.version);
            if (config.publishedAt) setPublishedAt(config.publishedAt);
          } else if (json.sections) {
            const sorted = [...json.sections].sort((a, b) => a.order - b.order);
            setSections(sorted);
          }
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchHomepageData();
  }, []);

  const handleToggle = (id: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const handleMove = (index: number, direction: 'UP' | 'DOWN') => {
    const targetIdx = direction === 'UP' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= sections.length) return;

    const reordered = [...sections];
    const temp = reordered[index];
    reordered[index] = reordered[targetIdx];
    reordered[targetIdx] = temp;

    // re-assign order numbers
    const updated = reordered.map((item, idx) => ({ ...item, order: idx + 1 }));
    setSections(updated);
  };

  const handleSaveDraft = async () => {
    setSavingDraft(true);
    setSuccessMsg('');

    try {
      const res = await fetch('/api/admin/homepage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SAVE_DRAFT',
          hero,
          sections,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSuccessMsg('Draft saved! Changes are stored in draft and not yet visible on public homepage.');
        setTimeout(() => setSuccessMsg(''), 5000);
      }
    } finally {
      setSavingDraft(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    setSuccessMsg('');

    try {
      const res = await fetch('/api/admin/homepage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'PUBLISH',
          hero,
          sections,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSuccessMsg(json.message || 'Homepage published live to public website!');
        if (json.version) setPublishedVersion(json.version);
        if (json.publishedAt) setPublishedAt(json.publishedAt);
        setTimeout(() => setSuccessMsg(''), 6000);
      }
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-xs font-bold text-gray-500 uppercase tracking-widest">Loading Homepage Manager...</div>;
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-light text-[#5227FF] text-xs font-black uppercase tracking-widest mb-2">
            <LayoutTemplate className="w-3.5 h-3.5" />
            <span>HOMEPAGE ARCHITECTURE</span>
          </div>
          <h1 className="font-display font-black text-3xl text-[#090814]">
            HOMEPAGE MANAGER & SINGLE SOURCE OF TRUTH
          </h1>
          <p className="text-xs sm:text-sm text-[#525266]">
            Configure hero copy, festival dates, image branding, section order, and publish updates live.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={savingDraft || publishing}
            className="px-4 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-100 text-[#090814] text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center gap-2 disabled:opacity-50"
            title="Save changes to draft without modifying public site"
          >
            <Save className="w-4 h-4 text-gray-600" />
            <span>{savingDraft ? 'Saving Draft...' : 'Save Draft'}</span>
          </button>

          <button
            type="button"
            onClick={handlePublish}
            disabled={publishing || savingDraft}
            className="px-6 py-2.5 rounded-xl bg-[#5227FF] hover:bg-primary-hover text-white text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            title="Publish changes to the public website immediately"
          >
            <Send className="w-4 h-4" />
            <span>{publishing ? 'Publishing...' : 'Publish Changes'}</span>
          </button>
        </div>
      </div>

      {/* Published State Badge */}
      <div className="flex items-center justify-between text-xs text-[#525266] bg-gray-50 border border-gray-200/80 rounded-2xl px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="font-bold text-[#090814]">Published Status: Active Version #{publishedVersion}</span>
          {publishedAt && (
            <span className="text-gray-400">
              (Last published: {new Date(publishedAt).toLocaleString()})
            </span>
          )}
        </div>
        <span className="text-[11px] font-semibold text-[#5227FF]">
          Controls both Desktop & Mobile Public Homepages
        </span>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-green-50 border border-green-200 text-green-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 text-xs font-bold gap-4">
        <button
          onClick={() => setActiveTab('SECTIONS')}
          className={`pb-3 px-2 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'SECTIONS'
              ? 'border-[#5227FF] text-[#5227FF]'
              : 'border-transparent text-gray-500 hover:text-[#090814]'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Section Flow & Ordering ({sections.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('HERO')}
          className={`pb-3 px-2 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'HERO'
              ? 'border-[#5227FF] text-[#5227FF]'
              : 'border-transparent text-gray-500 hover:text-[#090814]'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Hero Banner & Primary Typography</span>
        </button>
      </div>

      {/* TAB 1: SECTIONS FLOW */}
      {activeTab === 'SECTIONS' && (
        <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#717188] block">
                Homepage Flow Components ({sections.length})
              </span>
              <span className="text-[11px] text-gray-400">
                Move components up/down or toggle visibility. The public homepage follows this exact order.
              </span>
            </div>
            <span className="text-xs text-[#525266] font-semibold">
              {sections.filter((s) => s.enabled).length} Enabled
            </span>
          </div>

          <div className="divide-y divide-gray-100">
            {sections.map((sec, idx) => (
              <div
                key={sec.id}
                className={`py-3.5 px-3 rounded-xl flex items-center justify-between gap-4 transition-all ${
                  sec.enabled ? 'bg-white' : 'bg-gray-50 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-gray-400 w-6">
                    #{sec.order}
                  </span>

                  <div>
                    <h4 className="font-display font-bold text-sm text-[#090814]">
                      {sec.name}
                    </h4>
                    <span className="text-[10px] font-mono text-[#717188]">
                      id: {sec.id}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Move buttons */}
                  <button
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, 'UP')}
                    className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-30 text-gray-700"
                    title="Move Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>

                  <button
                    disabled={idx === sections.length - 1}
                    onClick={() => handleMove(idx, 'DOWN')}
                    className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-30 text-gray-700"
                    title="Move Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>

                  {/* Toggle Visibility */}
                  <button
                    onClick={() => handleToggle(sec.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                      sec.enabled
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {sec.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{sec.enabled ? 'ACTIVE' : 'HIDDEN'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: HERO CONFIGURATION */}
      {activeTab === 'HERO' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-6">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="font-display font-bold text-lg text-[#090814]">
              Public Hero Banner & Identity
            </h3>
            <p className="text-xs text-gray-500">
              These values configure the first viewport of both mobile and desktop public homepages.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="block font-bold text-[#525266] mb-1">
                Hero Main Title (e.g. COLORIDO)
              </label>
              <input
                type="text"
                value={hero.title}
                onChange={(e) => setHero({ ...hero, title: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-300 font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-[#525266] mb-1">
                Hero Edition / Accent Word (e.g. 2K26)
              </label>
              <input
                type="text"
                value={hero.edition}
                onChange={(e) => setHero({ ...hero, edition: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-300 font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-[#525266] mb-1">
                Institutional Header Label
              </label>
              <input
                type="text"
                value={hero.institutionalLabel}
                onChange={(e) => setHero({ ...hero, institutionalLabel: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-300 font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-[#525266] mb-1">
                Four-Word Festival Tagline
              </label>
              <input
                type="text"
                value={hero.tagline}
                onChange={(e) => setHero({ ...hero, tagline: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-300 font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-[#525266] mb-1">
                Festival Dates Badge Text
              </label>
              <input
                type="text"
                value={hero.datesText}
                onChange={(e) => setHero({ ...hero, datesText: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-300 font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-[#525266] mb-1">
                Countdown Target Date & Time (ISO format)
              </label>
              <input
                type="text"
                value={hero.targetDate}
                onChange={(e) => setHero({ ...hero, targetDate: e.target.value })}
                placeholder="2026-12-28T09:00:00+05:30"
                className="w-full p-2.5 rounded-xl border border-gray-300 font-semibold font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-[#525266] mb-1">
                Hero Campus Background Image Path / URL
              </label>
              <input
                type="text"
                value={hero.heroImage}
                onChange={(e) => setHero({ ...hero, heroImage: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-300 font-semibold font-mono text-xs"
              />
              <span className="text-[10px] text-gray-400 mt-1 block">
                Default: /images/colorido-hero-bg.jpg (High-resolution supplied campus image)
              </span>
            </div>

            <div>
              <label className="block font-bold text-[#525266] mb-1">
                Primary CTA Button Label
              </label>
              <input
                type="text"
                value={hero.ctaPrimaryText}
                onChange={(e) => setHero({ ...hero, ctaPrimaryText: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-300 font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-[#525266] mb-1">
                Primary CTA Target Link
              </label>
              <input
                type="text"
                value={hero.ctaPrimaryLink}
                onChange={(e) => setHero({ ...hero, ctaPrimaryLink: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-300 font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-[#525266] mb-1">
                Secondary CTA Button Label
              </label>
              <input
                type="text"
                value={hero.ctaSecondaryText}
                onChange={(e) => setHero({ ...hero, ctaSecondaryText: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-300 font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-[#525266] mb-1">
                Secondary CTA Target Link
              </label>
              <input
                type="text"
                value={hero.ctaSecondaryLink}
                onChange={(e) => setHero({ ...hero, ctaSecondaryLink: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-300 font-semibold"
              />
            </div>

            <div className="sm:col-span-2 pt-2">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hero.countdownVisible}
                  onChange={(e) => setHero({ ...hero, countdownVisible: e.target.checked })}
                  className="w-4 h-4 rounded text-[#5227FF]"
                />
                <span className="font-bold text-[#090814]">
                  Enable Horizontal Live Countdown Bar in Hero
                </span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
