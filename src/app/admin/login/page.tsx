'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Shield, User, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [organizerName, setOrganizerName] = useState('');
  const [organizerId, setOrganizerId] = useState('CLR26-ADMIN');
  const [password, setPassword] = useState('Colorido@2026');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizerId: organizerId.trim(),
          organizerName: organizerName.trim(),
          password,
        }),
      });

      const json = await res.json();

      if (!json.success) {
        setErrorMsg(json.message || 'Authentication rejected. Verify credentials.');
        setLoading(false);
        return;
      }

      // Route into COLORIDO OS Dashboard
      router.push('/admin/dashboard');
    } catch (err: any) {
      setErrorMsg('Server connection failure. Please retry.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#090814] text-white p-4 relative overflow-hidden select-none">
      {/* Background Ambient Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#5227FF]/20 blur-[130px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-[#FF2E93]/20 blur-[130px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md p-8 sm:p-10 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-2xl shadow-2xl space-y-8">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#5227FF] via-[#FF2E93] to-[#FF5E3A] flex items-center justify-center text-white font-black font-display text-xl mx-auto shadow-lg">
            C
          </div>

          <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#00DCEB] block pt-2">
            R.V.R. & J.C. FESTIVAL COMMAND CENTER
          </span>

          <h1 className="font-display font-black text-3xl tracking-tight text-white">
            COLORIDO <span className="text-[#5227FF]">OS</span>
          </h1>

          <p className="text-xs text-gray-400">
            Secure organizer access for festival operations, check-in desks, and real-time administration.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 flex items-start gap-2.5 text-red-300 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Quick Demo Organizer Credentials */}
        <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 text-xs space-y-2">
          <div className="flex items-center justify-between text-gray-400">
            <span className="font-extrabold uppercase tracking-wider text-[10px] text-[#00DCEB] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#00DCEB]" />
              Organizer Quick Credentials
            </span>
            <span className="text-[10px] text-gray-400">Pass: <strong className="text-white">Colorido@2026</strong></span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => {
                setOrganizerId('CLR26-ADMIN');
                setPassword('Colorido@2026');
                setOrganizerName('Prof. Festival Convener');
              }}
              className="py-1.5 px-2 rounded-lg bg-white/5 hover:bg-[#5227FF]/25 border border-white/10 text-[10px] font-bold text-gray-300 hover:text-white transition-all text-center"
            >
              👑 Convener
            </button>
            <button
              type="button"
              onClick={() => {
                setOrganizerId('CLR26-MGR');
                setPassword('Colorido@2026');
                setOrganizerName('Festival Manager');
              }}
              className="py-1.5 px-2 rounded-lg bg-white/5 hover:bg-[#FF2E93]/25 border border-white/10 text-[10px] font-bold text-gray-300 hover:text-white transition-all text-center"
            >
              🎯 Manager
            </button>
            <button
              type="button"
              onClick={() => {
                setOrganizerId('CLR26-STAFF');
                setPassword('Colorido@2026');
                setOrganizerName('Check-In Desk Lead');
              }}
              className="py-1.5 px-2 rounded-lg bg-white/5 hover:bg-[#00DCEB]/25 border border-white/10 text-[10px] font-bold text-gray-300 hover:text-white transition-all text-center"
            >
              🎟️ Staff
            </button>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-gray-300 mb-1">
              Organizer Name / Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Convener / Staff Name"
                value={organizerName}
                onChange={(e) => setOrganizerName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs sm:text-sm text-white focus:border-[#5227FF] focus:bg-white/10 transition-all placeholder:text-gray-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-gray-300 mb-1">
              Organizer ID *
            </label>
            <div className="relative">
              <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                required
                placeholder="e.g. CLR26-ADMIN or CLR26-MGR"
                value={organizerId}
                onChange={(e) => setOrganizerId(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs sm:text-sm text-white focus:border-[#5227FF] focus:bg-white/10 transition-all placeholder:text-gray-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-gray-300 mb-1">
              Secret Security Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                required
                placeholder="••••••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs sm:text-sm text-white focus:border-[#5227FF] focus:bg-white/10 transition-all placeholder:text-gray-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#5227FF] via-[#FF2E93] to-[#FF5E3A] hover:opacity-95 text-white text-xs sm:text-sm font-bold shadow-lg transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
          >
            <span>{loading ? 'AUTHENTICATING...' : 'AUTHENTICATE & ENTER COLORIDO OS'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-white/10 text-center">
          <a
            href="/"
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            ← Return to Public COLORIDO 2K26 Website
          </a>
        </div>
      </div>
    </div>
  );
}
