import React, { useState } from 'react';
import { ShieldAlert, Search, History, Filter } from 'lucide-react';
import { AuditLog } from '../types';
import { formatDateIndonesian } from '../services/dateCalculator';

interface AuditLogsViewProps {
  logs: AuditLog[];
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAksi, setFilterAksi] = useState('Semua');

  const filteredLogs = logs.filter((log) => {
    if (filterAksi !== 'Semua' && log.aksi !== filterAksi) return false;
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      return (
        log.admin_email.toLowerCase().includes(q) ||
        log.deskripsi.toLowerCase().includes(q) ||
        log.tabel_terdampak.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">Audit Trail System BPK & BKN</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Mencatat setiap perubahaan data pegawai, upload SK, dan modifikasi KP4 secara real-time untuk kepatuhan audit.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Cari deskripsi, email admin, atau tabel..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={filterAksi}
            onChange={(e) => setFilterAksi(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs text-slate-700 px-3 py-2 rounded-xl outline-none font-medium w-full sm:w-auto"
          >
            <option value="Semua">Semua Aksi</option>
            <option value="Create">Create</option>
            <option value="Update">Update</option>
            <option value="Soft Delete">Soft Delete</option>
            <option value="Restore">Restore</option>
            <option value="Upload SK">Upload SK</option>
            <option value="KP4 Update">KP4 Update</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            RIWAYAT AKTIVITAS ADMIN ({filteredLogs.length} LOG)
          </span>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <p className="font-medium text-sm text-slate-700">Tidak ada log aktivitas terdeteksi.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-slate-200 text-[#64748B] uppercase tracking-wider font-semibold">
                  <th className="p-3.5">Waktu / Timestamp</th>
                  <th className="p-3.5">Admin Executor</th>
                  <th className="p-3.5">Jenis Aksi</th>
                  <th className="p-3.5">Tabel</th>
                  <th className="p-3.5">Deskripsi Aktivitas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString('id-ID')}
                    </td>
                    <td className="p-3.5 font-semibold text-slate-800">{log.admin_email}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          log.aksi === 'Create'
                            ? 'bg-emerald-100 text-emerald-800'
                            : log.aksi === 'Soft Delete'
                            ? 'bg-red-100 text-red-800'
                            : log.aksi === 'Upload SK'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {log.aksi}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-600">{log.tabel_terdampak}</td>
                    <td className="p-3.5 text-slate-800">{log.deskripsi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
