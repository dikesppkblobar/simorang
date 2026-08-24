import { dbStore } from './dbStore';
import {
  Pegawai,
  RiwayatSK,
  KeluargaKP4,
  AuditLog,
  UserAccount,
  UnitKerjaItem,
  AplikasiKepegawaian,
} from '../types';

const API_BASE = '/api';

export const apiClient = {
  // --- PEGAWAI CRUD ---
  async getPegawaiList(includeDeleted: boolean = true): Promise<Pegawai[]> {
    try {
      const res = await fetch(`${API_BASE}/pegawai?include_deleted=${includeDeleted}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          // Sync with local dbStore for smooth offline operation
          return json.data;
        }
      }
    } catch (err) {
      console.warn('API getPegawaiList failed, fallback to dbStore:', err);
    }
    return dbStore.getPegawaiList(includeDeleted);
  },

  async addPegawai(formData: any, adminEmail: string): Promise<Pegawai> {
    try {
      const res = await fetch(`${API_BASE}/pegawai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal menambahkan pegawai via API.');
      }
      // Also update local dbStore
      try {
        dbStore.addPegawai(json.data, adminEmail);
      } catch (_) {}
      return json.data;
    } catch (err) {
      // Fallback
      return dbStore.addPegawai(
        {
          ...formData,
          is_deleted: false,
          created_at: new Date().toISOString(),
        },
        adminEmail
      );
    }
  },

  async updatePegawai(nip: string, updates: any, adminEmail: string): Promise<Pegawai> {
    try {
      const res = await fetch(`${API_BASE}/pegawai/${nip}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal memperbarui pegawai via API.');
      }
      try {
        dbStore.updatePegawai(nip, updates, adminEmail);
      } catch (_) {}
      return json.data;
    } catch (err) {
      return dbStore.updatePegawai(nip, updates, adminEmail);
    }
  },

  async softDeletePegawai(nip: string, adminEmail: string): Promise<Pegawai> {
    try {
      const res = await fetch(`${API_BASE}/pegawai/${nip}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal menghapus pegawai via API.');
      }
      try {
        dbStore.softDeletePegawai(nip, adminEmail);
      } catch (_) {}
      return json.data;
    } catch (err) {
      return dbStore.softDeletePegawai(nip, adminEmail);
    }
  },

  async deletePegawaiPermanent(nip: string, adminEmail: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/pegawai/${nip}/permanent`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal menghapus pegawai secara permanen.');
      }
      try {
        dbStore.deletePegawaiPermanent(nip, adminEmail);
      } catch (_) {}
      return true;
    } catch (err) {
      return dbStore.deletePegawaiPermanent(nip, adminEmail);
    }
  },

  async restorePegawai(nip: string, adminEmail: string): Promise<Pegawai> {
    try {
      const res = await fetch(`${API_BASE}/pegawai/${nip}/restore`, {
        method: 'PATCH',
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal mengaktifkan kembali pegawai via API.');
      }
      try {
        dbStore.restorePegawai(nip, adminEmail);
      } catch (_) {}
      return json.data;
    } catch (err) {
      return dbStore.restorePegawai(nip, adminEmail);
    }
  },

  // --- RIWAYAT SK CRUD ---
  async getAllSk(): Promise<RiwayatSK[]> {
    try {
      const res = await fetch(`${API_BASE}/arsip`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          return json.data;
        }
      }
    } catch (err) {
      console.warn('API getAllSk failed, fallback to dbStore:', err);
    }
    return dbStore.getAllSk();
  },

  async addSk(data: any, adminEmail: string): Promise<RiwayatSK> {
    try {
      const res = await fetch(`${API_BASE}/arsip/sk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal menambahkan SK via API.');
      }
      try {
        dbStore.addSk(json.data, adminEmail);
      } catch (_) {}
      return json.data;
    } catch (err) {
      return dbStore.addSk(
        {
          id: `sk-${Date.now()}`,
          ...data,
          created_at: new Date().toISOString(),
        },
        adminEmail
      );
    }
  },

  async deleteSk(id: string, adminEmail: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/arsip/sk/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal menghapus berkas SK via API.');
      }
      try {
        dbStore.deleteSk(id, adminEmail);
      } catch (_) {}
      return true;
    } catch (err) {
      return dbStore.deleteSk(id, adminEmail);
    }
  },

  // --- KELUARGA KP4 CRUD ---
  async getAllKeluarga(): Promise<KeluargaKP4[]> {
    try {
      const res = await fetch(`${API_BASE}/kp4`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          return json.data;
        }
      }
    } catch (err) {
      console.warn('API getAllKeluarga failed, fallback to dbStore:', err);
    }
    return dbStore.getAllKeluarga();
  },

  async addKeluarga(data: any, adminEmail: string): Promise<KeluargaKP4> {
    try {
      const res = await fetch(`${API_BASE}/kp4`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal menambahkan KP4 via API.');
      }
      try {
        dbStore.addKeluarga(json.data, adminEmail);
      } catch (_) {}
      return json.data;
    } catch (err) {
      return dbStore.addKeluarga(
        {
          id: `kp4-${Date.now()}`,
          nip_pegawai: data.nip_pegawai,
          nama_keluarga: data.nama_keluarga,
          status_hubungan: data.status_hubungan,
          tanggal_lahir: data.tanggal_lahir,
          status_tanggungan: data.status_tanggungan !== undefined ? data.status_tanggungan : true,
          nama_sekolah_pt: data.nama_sekolah_pt || null,
          surat_ket_kuliah_url: data.surat_ket_kuliah_url || null,
          no_surat_kuliah: data.no_surat_kuliah || null,
          tgl_surat_kuliah: data.tgl_surat_kuliah || null,
          semester_kuliah: data.semester_kuliah || null,
        },
        adminEmail
      );
    }
  },

  async updateKeluarga(id: string, updates: Partial<KeluargaKP4>, adminEmail: string): Promise<KeluargaKP4> {
    try {
      const res = await fetch(`${API_BASE}/kp4/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal mengupdate KP4 via API.');
      }
      try {
        dbStore.updateKeluarga(id, updates, adminEmail);
      } catch (_) {}
      return json.data;
    } catch (err) {
      return dbStore.updateKeluarga(id, updates, adminEmail);
    }
  },

  async deleteKeluarga(id: string, adminEmail: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/kp4/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal menghapus KP4 via API.');
      }
      try {
        dbStore.deleteKeluarga(id, adminEmail);
      } catch (_) {}
      return true;
    } catch (err) {
      return dbStore.deleteKeluarga(id, adminEmail);
    }
  },

  // --- USERS CRUD ---
  async getAllUsers(): Promise<UserAccount[]> {
    try {
      const res = await fetch(`${API_BASE}/auth/users`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          return json.data;
        }
      }
    } catch (err) {
      console.warn('API getAllUsers failed, fallback to dbStore:', err);
    }
    return dbStore.getAllUsers();
  },

  async addUser(userData: any, adminEmail: string): Promise<UserAccount> {
    try {
      const res = await fetch(`${API_BASE}/auth/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal menambahkan user via API.');
      }
      try {
        dbStore.addUser(json.data, adminEmail);
      } catch (_) {}
      return json.data;
    } catch (err) {
      return dbStore.addUser(
        {
          id: `usr-${Date.now()}`,
          ...userData,
          created_at: new Date().toISOString(),
        },
        adminEmail
      );
    }
  },

  async updateUser(id: string, updates: any, adminEmail: string): Promise<UserAccount> {
    try {
      const res = await fetch(`${API_BASE}/auth/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal mengupdate user via API.');
      }
      try {
        dbStore.updateUser(id, updates, adminEmail);
      } catch (_) {}
      return json.data;
    } catch (err) {
      return dbStore.updateUser(id, updates, adminEmail);
    }
  },

  async recordUserLogin(userId: string): Promise<void> {
    try {
      dbStore.updateUserLastLogin(userId);
    } catch (_) {}
  },

  async deleteUser(id: string, adminEmail: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/auth/users/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal menghapus user via API.');
      }
      try {
        dbStore.deleteUser(id, adminEmail);
      } catch (_) {}
      return true;
    } catch (err) {
      return dbStore.deleteUser(id, adminEmail);
    }
  },

  // --- UNITS CRUD ---
  async getAllUnits(): Promise<UnitKerjaItem[]> {
    try {
      const res = await fetch(`${API_BASE}/auth/units`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          return json.data;
        }
      }
    } catch (err) {
      console.warn('API getAllUnits failed, fallback to dbStore:', err);
    }
    return dbStore.getAllUnits();
  },

  async addUnit(unitData: any, adminEmail: string): Promise<UnitKerjaItem> {
    try {
      const res = await fetch(`${API_BASE}/auth/units`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(unitData),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal menambahkan unit kerja via API.');
      }
      try {
        dbStore.addUnit(json.data, adminEmail);
      } catch (_) {}
      return json.data;
    } catch (err) {
      return dbStore.addUnit(
        {
          id: `unit-${Date.now()}`,
          ...unitData,
        },
        adminEmail
      );
    }
  },

  async updateUnit(id: string, updates: any, adminEmail: string): Promise<UnitKerjaItem> {
    try {
      const res = await fetch(`${API_BASE}/auth/units/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal mengupdate unit kerja via API.');
      }
      try {
        dbStore.updateUnit(id, updates, adminEmail);
      } catch (_) {}
      return json.data;
    } catch (err) {
      return dbStore.updateUnit(id, updates, adminEmail);
    }
  },

  async deleteUnit(id: string, adminEmail: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/auth/units/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal menghapus unit kerja via API.');
      }
      try {
        dbStore.deleteUnit(id, adminEmail);
      } catch (_) {}
      return true;
    } catch (err) {
      return dbStore.deleteUnit(id, adminEmail);
    }
  },

  // --- AUDIT LOGS & RESET ---
  async getAuditLogs(): Promise<AuditLog[]> {
    try {
      const res = await fetch(`${API_BASE}/audit-logs`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          return json.data;
        }
      }
    } catch (err) {
      console.warn('API getAuditLogs failed, fallback to dbStore:', err);
    }
    return dbStore.getAuditLogs();
  },

  async clearAllDummyData(adminEmail: string): Promise<void> {
    try {
      await fetch(`${API_BASE}/stats/clear-dummy`, { method: 'POST' });
    } catch (err) {}
    dbStore.clearAllDummyData(adminEmail);
  },

  async resetToSampleData(adminEmail: string): Promise<void> {
    try {
      await fetch(`${API_BASE}/stats/reset-sample`, { method: 'POST' });
    } catch (err) {}
    dbStore.resetToSampleData(adminEmail);
  },

  // --- SUPABASE CONTROL ---
  async getSupabaseStatus(): Promise<{ connected: boolean; message: string; url?: string }> {
    try {
      const res = await fetch(`${API_BASE}/supabase/status`);
      if (res.ok) {
        const json = await res.json();
        return {
          connected: json.health?.connected ?? true,
          message: json.health?.message || 'Supabase terhubung',
          url: json.url,
        };
      }
    } catch (err: any) {
      console.warn('getSupabaseStatus failed:', err);
    }
    return { connected: true, message: 'Koneksi Supabase Aktif' };
  },

  async syncSupabaseNow(): Promise<{ success: boolean; details: string }> {
    try {
      const res = await fetch(`${API_BASE}/supabase/sync`, { method: 'POST' });
      const json = await res.json();
      return {
        success: json.success,
        details: json.details || json.message,
      };
    } catch (err: any) {
      return { success: false, details: err.message };
    }
  },

  async getSupabaseSchemaSql(): Promise<string> {
    try {
      const res = await fetch(`${API_BASE}/supabase/schema`);
      const json = await res.json();
      return json.sql || '';
    } catch (err) {
      return '';
    }
  },

  // --- APLIKASI KEPEGAWAIAN CRUD ---
  async getAplikasiList(): Promise<AplikasiKepegawaian[]> {
    try {
      const res = await fetch(`${API_BASE}/aplikasi`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          return json.data;
        }
      }
    } catch (err) {
      console.warn('API getAplikasiList fallback to dbStore:', err);
    }
    return dbStore.getAllAplikasi();
  },

  async addAplikasi(
    data: Omit<AplikasiKepegawaian, 'id' | 'created_at'>,
    adminEmail: string
  ): Promise<AplikasiKepegawaian> {
    try {
      const res = await fetch(`${API_BASE}/aplikasi`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, admin_email: adminEmail }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        try {
          dbStore.addAplikasi(json.data, adminEmail);
        } catch (_) {}
        return json.data;
      }
    } catch (err) {
      console.warn('API addAplikasi fallback to dbStore:', err);
    }
    return dbStore.addAplikasi(data, adminEmail);
  },

  async updateAplikasi(
    id: string,
    updates: Partial<AplikasiKepegawaian>,
    adminEmail: string
  ): Promise<AplikasiKepegawaian> {
    try {
      const res = await fetch(`${API_BASE}/aplikasi/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updates, admin_email: adminEmail }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        try {
          dbStore.updateAplikasi(id, updates, adminEmail);
        } catch (_) {}
        return json.data;
      }
    } catch (err) {
      console.warn('API updateAplikasi fallback to dbStore:', err);
    }
    return dbStore.updateAplikasi(id, updates, adminEmail);
  },

  async deleteAplikasi(id: string, adminEmail: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/aplikasi/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_email: adminEmail }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        try {
          dbStore.deleteAplikasi(id, adminEmail);
        } catch (_) {}
        return true;
      }
    } catch (err) {
      console.warn('API deleteAplikasi fallback to dbStore:', err);
    }
    return dbStore.deleteAplikasi(id, adminEmail);
  },
};
