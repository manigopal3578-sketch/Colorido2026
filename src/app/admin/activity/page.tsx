'use client';

import React, { useState, useEffect } from 'react';
import {
  Activity,
  Search,
  Filter,
  Download,
  Clock,
  Shield,
  User,
  CheckCircle,
} from 'lucide-react';
import { generateCsvContent, downloadFile } from '@/lib/utils';

export default function ActivityLogsAdminPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

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

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 rounded-full border-2 border-[#5227FF] border-t-transparent animate-spin" />
      </div>
    );
  }

  const logs = data.auditLogs || [];

  const filtered = logs.filter((log: any) => {
    const matchesSearch =
      search === '' ||
      log.actor.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase()) ||
      log.record.toLowerCase().includes(search.toLowerCase());

    const matchesAction = actionFilter === 'ALL' || log.action.includes(actionFilter);
    return matchesSearch && matchesAction;
  });

  const exportCsv = () => {
    const headers = ['Log ID', 'Timestamp', 'Actor', 'Role', 'Action', 'Target Record', 'Details'];
    const rows = filtered.map((l: any) => [
      l.id,
      l.timestamp,
      l.actor,
      l.actorRole,
      l.action,
      l.record,
      l.details,
    ]);
    const csv = generateCsvContent(headers, rows);
    downloadFile(csv, `colorido_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#5227FF] text-xs font-bold uppercase tracking-wider mb-1">
            <Activity className="w-4 h-4" />
            <span>Compliance & Operations Audit</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-[#090814] tracking-tight">
            System Activity Logs ({logs.length})
          </h1>
          <p className="text-[#525266] text-xs sm:text-sm mt-0.5 font-medium">
            Cryptographically timestamped trail of all administrative actions, settings changes, and admissions.
          </p>
        </div>

        <button
          onClick={exportCsv}
          className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-[#090814] rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs self-start md:self-center"
        >
          <Download className="w-4 h-4 text-[#5227FF]" />
          <span>Export Audit Log</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by actor, action name, or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs text-[#090814] placeholder-gray-400 focus:outline-none focus:border-[#5227FF] shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          {['ALL', 'EVENT', 'SETTINGS', 'CHECK_IN', 'VERSION'].map((act) => (
            <button
              key={act}
              onClick={() => setActionFilter(act)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                actionFilter === act
                  ? 'bg-[#5227FF] text-white shadow-xs'
                  : 'text-[#525266] hover:text-[#090814] bg-white border border-gray-200'
              }`}
            >
              {act}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-100 text-[#717188] uppercase tracking-wider text-[10px] font-black">
              <tr>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Operator</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Target Record</th>
                <th className="py-3.5 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[#525266]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400 font-semibold">
                    No activity logs found matching the filter.
                  </td>
                </tr>
              ) : (
                filtered.map((log: any) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#717188] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-purple-50 flex items-center justify-center text-[10px] font-bold text-[#5227FF] border border-purple-200">
                          {log.actor.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-[#090814] leading-tight">{log.actor}</p>
                          <span className="text-[9px] font-mono text-[#717188]">{log.actorRole}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-50 text-[#5227FF] border border-purple-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#090814] font-semibold">
                      {log.record}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#525266] max-w-md">
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
