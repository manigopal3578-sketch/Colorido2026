'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Shield,
  KeyRound,
  CheckCircle,
  Clock,
  Edit2,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';

export default function UsersAdminPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    organizerId: '',
    name: '',
    role: 'COORDINATOR',
    password: '',
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/data/state');
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.organizerId || !newUser.password) return;

    setSaving(true);
    try {
      const res = await fetch('/api/admin/mutate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADD',
          collection: 'adminUsers',
          item: {
            organizerId: newUser.organizerId,
            name: newUser.name || newUser.organizerId,
            role: newUser.role,
            createdAt: new Date().toISOString(),
            tokenVersion: 1,
          },
        }),
      });
      const resJson = await res.json();
      if (resJson.success) {
        showToast('Admin user created successfully');
        setModalOpen(false);
        setNewUser({ organizerId: '', name: '', role: 'COORDINATOR', password: '' });
        fetchData();
      } else {
        showToast(resJson.message || 'Error creating user', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 rounded-full border-2 border-[#5227FF] border-t-transparent animate-spin" />
      </div>
    );
  }

  // Pre-configured staff credentials
  const adminUsers = [
    {
      id: 'usr-admin-01',
      organizerId: 'CLR26-ADMIN',
      name: 'R.V.R. & J.C. Festival Convener',
      role: 'ADMIN',
      permissions: 'Full Root Privileges, Settings, Database Override',
      status: 'ACTIVE',
    },
    {
      id: 'usr-manager-01',
      organizerId: 'CLR26-MGR',
      name: 'Festival Operations Manager',
      role: 'EVENT_MANAGER',
      permissions: 'Schedule, Events, Coordinators, Emergency Broadcast',
      status: 'ACTIVE',
    },
    {
      id: 'usr-staff-01',
      organizerId: 'CLR26-STAFF',
      name: 'Admissions & Check-In Desk Lead',
      role: 'CHECK_IN_STAFF',
      permissions: 'QR Ticket Scanning, Manual Admission, Turnout Audit',
      status: 'ACTIVE',
    },
  ];

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl text-white text-xs font-bold shadow-2xl flex items-center gap-2 ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
          <CheckCircle className="w-4 h-4" />
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#5227FF] text-xs font-bold uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>Role-Based Access Control</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-[#090814] tracking-tight">
            Administrative Users & Roles
          </h1>
          <p className="text-[#525266] text-xs sm:text-sm mt-0.5 font-medium">
            Operators, check-in desk crew, event managers, and festival executive committee members.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/settings/security"
            className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-[#090814] rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs"
          >
            <KeyRound className="w-4 h-4 text-amber-500" />
            <span>Rotate Password</span>
          </Link>

          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 bg-[#5227FF] hover:bg-primary-hover text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Staff Account</span>
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-100 text-[#717188] uppercase tracking-wider text-[10px] font-black">
              <tr>
                <th className="py-3.5 px-4">Operator / Lead</th>
                <th className="py-3.5 px-4">Organizer ID</th>
                <th className="py-3.5 px-4">Access Role</th>
                <th className="py-3.5 px-4">Scope & Permissions</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[#525266]">
              {adminUsers.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-[#090814]">{u.name}</p>
                    <p className="text-[10px] text-[#717188] font-mono">{u.id}</p>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-[#5227FF]">
                    {u.organizerId}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                        u.role === 'ADMIN'
                          ? 'bg-purple-50 text-[#5227FF] border border-purple-200'
                          : u.role === 'EVENT_MANAGER'
                          ? 'bg-orange-50 text-[#FF5E3A] border border-orange-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[#525266] text-xs">
                    {u.permissions}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {u.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="text-lg font-black text-[#090814] font-display">Create Staff Login</h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-black">✕</button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#525266] block mb-1">Staff Member Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Stage Desk Coordinator"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#090814] focus:outline-none focus:border-[#5227FF]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#525266] block mb-1">Organizer ID</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CLR26-STAGE-01"
                  value={newUser.organizerId}
                  onChange={(e) => setNewUser({ ...newUser, organizerId: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#090814] focus:outline-none focus:border-[#5227FF]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#525266] block mb-1">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#090814] focus:outline-none focus:border-[#5227FF]"
                >
                  <option value="COORDINATOR">COORDINATOR</option>
                  <option value="CHECK_IN_STAFF">CHECK_IN_STAFF</option>
                  <option value="EVENT_MANAGER">EVENT_MANAGER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#525266] block mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="Set initial password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#090814] focus:outline-none focus:border-[#5227FF]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#525266] hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-[#5227FF] hover:bg-primary-hover text-white text-xs font-bold shadow-xs"
                >
                  {saving ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
