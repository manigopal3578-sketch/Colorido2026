'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, RefreshCw, ArrowRight, Eye, ShieldCheck } from 'lucide-react';
import { EventItem } from '@/lib/types';

export default function AdminAiStudioPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [category, setCategory] = useState<'cultural' | 'sports'>('cultural');
  const [mood, setMood] = useState('High Energy');
  const [style, setStyle] = useState('Cinematic Editorial');
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [candidate, setCandidate] = useState<any>(null);
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    fetch('/api/data/state')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.events) {
          setEvents(json.events);
          if (json.events.length > 0) {
            setSelectedEventId(json.events[0].id);
            setCategory(json.events[0].category === 'cultural' ? 'cultural' : 'sports');
          }
        }
      });
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setStatusMsg('');

    try {
      const res = await fetch('/api/admin/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: selectedEventId,
          category,
          mood,
          style,
          prompt,
        }),
      });
      const json = await res.json();
      if (json.success && json.candidate) {
        setCandidate(json.candidate);
        setStatusMsg('Candidate visual synthesized in DRAFT mode. Review below before approving.');
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleApprove = async () => {
    if (!candidate || !selectedEventId) return;

    try {
      const res = await fetch('/api/admin/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'APPROVE_COVER',
          eventId: selectedEventId,
          imageUrl: candidate.imageUrl,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setStatusMsg('Visual officially approved and published to event cover!');
        setCandidate(null);
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-light text-[#5227FF] text-xs font-black uppercase tracking-widest mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>INTELLIGENT CREATIVE SUITE</span>
        </div>
        <h1 className="font-display font-black text-3xl text-[#090814]">
          EVENT VISUAL GENERATOR
        </h1>
        <p className="text-xs sm:text-sm text-[#525266]">
          Synthesize high-fidelity festival imagery with a strict draft-and-approval gate. Never accidentally overwrites live covers.
        </p>
      </div>

      {statusMsg && (
        <div className="p-3.5 rounded-xl bg-green-50 border border-green-200 text-green-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Generator Form */}
      <div className="p-8 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-6">
        <form onSubmit={handleGenerate} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-[#090814] mb-1">Target Event *</label>
              <select
                value={selectedEventId}
                onChange={(e) => {
                  setSelectedEventId(e.target.value);
                  const evt = events.find((ev) => ev.id === e.target.value);
                  if (evt) setCategory(evt.category === 'cultural' ? 'cultural' : 'sports');
                }}
                className="w-full p-3 rounded-xl border border-gray-200 bg-[#FBFBFD] font-semibold text-[#090814]"
              >
                {events.map((evt) => (
                  <option key={evt.id} value={evt.id}>
                    [{evt.category.toUpperCase()}] {evt.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-[#090814] mb-1">Visual Style *</label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-200 bg-[#FBFBFD]"
              >
                <option value="Cinematic Editorial">Cinematic Editorial & Stage Lighting</option>
                <option value="Dynamic Arena Action">Dynamic Sports Arena Action & Motion</option>
                <option value="Dramatic Classical">Classical Indian Performing Arts</option>
                <option value="Floodlit Stadium">Floodlit Collegiate Stadium Night</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-[#090814] mb-1">Mood & Atmosphere *</label>
              <select
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-200 bg-[#FBFBFD]"
              >
                <option value="High Energy">High Energy & Festival Electric</option>
                <option value="Prestigious & Solemn">Prestigious & Classical</option>
                <option value="Fierce Championship">Fierce Athletic Rivalry</option>
                <option value="Youth Celebration">Collegiate Crowd Passion</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-[#090814] mb-1">Custom Prompt Details (Optional)</label>
              <input
                type="text"
                placeholder="e.g. dancers with vibrant pink silk trails on stage..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-200"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={generating}
            className="w-full py-3.5 px-6 rounded-xl bg-[#5227FF] hover:bg-primary-hover text-white text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{generating ? 'Synthesizing Visual Candidate...' : 'Generate Visual Candidate'}</span>
          </button>
        </form>
      </div>

      {/* Candidate Preview Stage */}
      {candidate && (
        <div className="p-8 rounded-3xl bg-[#FBFBFD] border-2 border-[#5227FF]/40 shadow-xl space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#5227FF] bg-primary-light px-3 py-1 rounded-full">
                CANDIDATE DRAFT — REVIEW REQUIRED
              </span>
              <h3 className="font-display font-bold text-xl text-[#090814] mt-2">
                Candidate Visual for Review
              </h3>
            </div>
          </div>

          <div className="relative h-72 sm:h-96 w-full rounded-2xl overflow-hidden border border-gray-300 shadow-md">
            <img
              src={candidate.imageUrl}
              alt="Generated Visual Candidate"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-4 rounded-xl bg-white border border-gray-200 text-xs text-[#525266] space-y-1">
            <p><strong>Style:</strong> {candidate.style} • <strong>Mood:</strong> {candidate.mood}</p>
            <p><strong>Prompt:</strong> {candidate.prompt}</p>
          </div>

          {/* Action Approval Workflow */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => setCandidate(null)}
              className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-[#090814]"
            >
              Reject & Discard
            </button>

            <button
              onClick={handleApprove}
              className="px-6 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold shadow-md flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Approve & Set as Event Cover</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
