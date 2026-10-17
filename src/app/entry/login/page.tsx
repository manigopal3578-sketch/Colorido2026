'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  QrCode,
  ShieldCheck,
  KeyRound,
  User,
  ArrowRight,
  AlertCircle,
  Sparkles,
  Lock,
} from 'lucide-react';

export default function EntryLoginPage() {
  const router = useRouter();
  const [organizerId, setOrganizerId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organizerId.trim() || !password.trim()) {
      setError('Please enter your Staff / Organizer ID and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizerId: organizerId.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || 'Authentication failed. Please verify credentials.');
        return;
      }

      // Check-in staff and admins go straight to /entry
      router.push('/entry');
    } catch (err: any) {
      setError('Connection failure. Check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  const fillStaffCreds = () => {
    setOrganizerId('CLR26-STAFF');
    setPassword('colorido2k26rvrjcce');
    setError(null);
  };

  const fillAdminCreds = () => {
    setOrganizerId('CLR26-ADMIN');
    setPassword('colorido2k26rvrjcce');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-cyan-600/20 via-purple-600/20 to-pink-600/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 via-indigo-600 to-pink-500 p-[2px] shadow-xl shadow-cyan-500/20 mb-4">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
              <QrCode className="w-8 h-8 text-cyan-400" />
            </div>
          </div>
          <div className="inline-block px-3 py-1 bg-cyan-950/80 border border-cyan-800/80 rounded-full text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
            Checkpoint Access
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Entry Gate Authentication
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            COLORIDO 2K26 • R.V.R. & J.C. College of Engineering
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/60 border border-red-800/80 text-red-300 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-200">Access Denied</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Staff / Organizer ID
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={organizerId}
                  onChange={(e) => setOrganizerId(e.target.value)}
                  placeholder="e.g. CLR26-STAFF"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Security Password
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-cyan-500 via-indigo-600 to-pink-500 hover:from-cyan-400 hover:via-indigo-500 hover:to-pink-400 text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {loading ? (
                <span>Authorizing Credentials...</span>
              ) : (
                <>
                  <span>Open Entry Gate Station</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Credential Helpers */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <p className="text-xs text-slate-400 text-center mb-3">
              Authorized Test Credentials:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={fillStaffCreds}
                className="py-2 px-3 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-medium text-slate-200 transition text-left"
              >
                <div className="font-semibold text-cyan-400">Check-In Staff</div>
                <div className="text-[11px] text-slate-400">CLR26-STAFF</div>
              </button>
              <button
                type="button"
                onClick={fillAdminCreds}
                className="py-2 px-3 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-medium text-slate-200 transition text-left"
              >
                <div className="font-semibold text-pink-400">Festival Admin</div>
                <div className="text-[11px] text-slate-400">CLR26-ADMIN</div>
              </button>
            </div>
          </div>
        </div>

        {/* Security Footer Notice */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Role-restricted gate terminal • 256-bit encrypted token</span>
        </div>
      </div>
    </div>
  );
}
