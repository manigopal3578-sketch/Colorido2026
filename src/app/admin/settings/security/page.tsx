'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  KeyRound,
  Shield,
  Lock,
  AlertCircle,
  CheckCircle2,
  LogOut,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

export default function AdminSecurityPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    if (newPassword.length < 8) {
      setStatusMsg({ type: 'error', text: 'New password must contain at least 8 characters.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatusMsg({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const json = await res.json();

      if (!json.success) {
        setStatusMsg({ type: 'error', text: json.message || 'Password update failed.' });
      } else {
        setStatusMsg({
          type: 'success',
          text: 'Organizer password successfully changed! All previous sessions have been invalidated. Redirecting to login...',
        });
        setTimeout(() => {
          router.push('/admin/login');
        }, 2000);
      }
    } catch (e: any) {
      setStatusMsg({ type: 'error', text: 'Server communication error.' });
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeAllSessions = async () => {
    if (!confirm('Force sign out all active sessions across all devices?')) return;
    setLoading(true);

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'REVOKE_ALL' }),
      });
      const json = await res.json();
      if (json.success) {
        router.push('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-light text-[#5227FF] text-xs font-black uppercase tracking-widest mb-2">
          <KeyRound className="w-3.5 h-3.5" />
          <span>ACCESS SECURITY & ROTATION</span>
        </div>
        <h1 className="font-display font-black text-3xl text-[#090814]">
          SECURITY & CREDENTIAL ROTATION
        </h1>
        <p className="text-xs sm:text-sm text-[#525266]">
          Manage festival organizer passwords, enforce credential rotation, and terminate unauthorized active sessions.
        </p>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-xs sm:text-sm font-bold ${
            statusMsg.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-900'
              : 'bg-red-50 border border-red-200 text-red-900'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Password Change Form */}
      <div className="p-8 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-6">
        <div>
          <h2 className="font-display font-bold text-xl text-[#090814]">
            Rotate Organizer Secret Password
          </h2>
          <p className="text-xs text-[#525266] mt-0.5">
            Updating the master password automatically invalidates all existing admin sessions server-side.
          </p>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-bold text-[#525266] mb-1">
              Current Password *
            </label>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-300 text-xs sm:text-sm focus:border-[#5227FF]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#525266] mb-1">
              New Password (min 8 characters) *
            </label>
            <input
              type="password"
              required
              minLength={8}
              placeholder="••••••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-300 text-xs sm:text-sm focus:border-[#5227FF]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#525266] mb-1">
              Confirm New Password *
            </label>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-300 text-xs sm:text-sm focus:border-[#5227FF]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-xl bg-[#5227FF] hover:bg-primary-hover text-white text-xs sm:text-sm font-bold shadow-md transition-all disabled:opacity-50"
          >
            {loading ? 'Rotating Credentials...' : 'Confirm Password Rotation'}
          </button>
        </form>
      </div>

      {/* Force Sign Out All Sessions */}
      <div className="p-8 rounded-3xl bg-white border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h3 className="font-display font-bold text-lg text-[#090814]">
            Force Sign Out All Active Sessions
          </h3>
          <p className="text-xs text-[#525266] mt-0.5 max-w-lg">
            If you suspect credential leakage or wish to revoke active browser sessions from other festival devices, invoke a server-side session wipe.
          </p>
        </div>

        <button
          onClick={handleRevokeAllSessions}
          disabled={loading}
          className="px-6 py-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold border border-red-200 transition-colors shrink-0 flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Revoke All Sessions</span>
        </button>
      </div>
    </div>
  );
}
