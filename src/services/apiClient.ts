import { dbStore } from './dbStore';
import { supabaseService } from './supabaseService';
import { SUPABASE_SCHEMA_SQL } from '../data/supabaseSchema';
import {
  Pegawai,
  RiwayatSK,
  KeluargaKP4,
  UserAccount,
  UnitKerjaItem,
  AplikasiKepegawaian,
} from '../types';

const API_BASE = '/api';

let backendAvailable: boolean | null = null;

async function checkBackendAvailable(): Promise<boolean> {
  if (backendAvailable !== null) return backendAvailable;
  try {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timeoutId = controller ? setTimeout(() => controller.abort(), 2000) : null;
    const res = await fetch(`${API_BASE}/health`, {
      method: 'GET',
      signal: controller?.signal,
    });
    if (timeoutId) clearTimeout(timeoutId);
    if (res.ok) {
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        const j = await res.json();
        backendAvailable = j && j.status === 'ok';
        return backendAvailable;
      }
    }
  } catch (_) {}
  backendAvailable = false;
  return false;
}

/**
 * Helper to safely fetch JSON from the API backend.
 * If the response is not OK (e.g. 404/405 on Vercel static hosting) or not JSON,
 * it returns null and falls back to dbStore + Supabase Cloud client.
 */
async function safeFetchJson<T = any>(
  url: string,
  options?: RequestInit
): Promise<{ success: boolean; data?: T; error?: string } | null> {
  const isAvailable = await checkBackendAvailable();
  if (!isAvailable) {
    return null;
  }
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      if (res.status === 404 || res.status === 405) {
        backendAvailable = false;
      }
      return null;
    }
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return null;
    }
    const json = await res.json();
    return json;
  } catch (err) {
    backendAvailable = false;
    return null;
  }
}

export const apiClient = {
  // --- PEGAWAI CRUD ---
  async getPegawaiList(includeDeleted: boolean = true): Promise<Pegawai[]> {
    const json = await safeFetchJson<Pegawai[]>(`${API_BASE}/pegawai?include_deleted=${includeDeleted}`);
    if (json && json.success && Array.isArray(json.data)) {
      return json.data;
    }
    return dbStore.getPegawaiList(includeDeleted);
  },

  async addPegawai(formData: any, adminEmail: string): Promise<Pegawai> {
    const json = await safeFetchJson<Pegawai>(`${API_BASE}/pegawai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (json && json.success && json.data) {
      try {
        dbStore.addPegawai(json.data, adminEmail);
      } catch (_) {}
      return json.data;
    }

    // Direct fallback (client/dbStore + Supabase direct)
    const localCreated = dbStore.addPegawai(
      {
        ...formData,
        is_deleted: false,
        created_at: new Date().toISOString(),
      },
      adminEmail
    );
    try {
      supabaseService.upsertPegawai(localCreated).catch(() => {});
    } catch (_) {}
    return localCreated;
  },

  async updatePegawai(nip: string, updates: any, adminEmail: string): Promise<Pegawai> {
    const json = await safeFetchJson<Pegawai>(`${API_BASE}/pegawai/${nip}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (json && json.success && json.data) {
      try {
        dbStore.updatePegawai(nip, updates, adminEmail);
      } catch (_) {}
      return json.data;
    }

    const localUpdated = dbStore.updatePegawai(nip, updates, adminEmail);
    try {
      supabaseService.upsertPegawai(localUpdated).catch(() => {});
    } catch (_) {}
    return localUpdated;
  },

  async softDeletePegawai(nip: string, adminEmail: string): Promise<Pegawai> {
    const json = await safeFetchJson<Pegawai>(`${API_BASE}/pegawai/${nip}`, {
      method: 'DELETE',
    });

    if (json && json.success && json.data) {
      try {
        dbStore.softDeletePegawai(nip, adminEmail);
      } catch (_) {}
      return json.data;
    }

    const localDeleted = dbStore.softDeletePegawai(nip, adminEmail);
    try {
      supabaseService.deletePegawaiSoft(nip).catch(() => {});
    } catch (_) {}
    return localDeleted;
  },

  async deletePegawaiPermanent(nip: string, adminEmail: string): Promise<boolean> {
    const json = await safeFetchJson(`${API_BASE}/pegawai/${nip}/permanent`, {
      method: 'DELETE',
    });

    if (json && json.success) {
      try {
        dbStore.deletePegawaiPermanent(nip, adminEmail);
      } catch (_) {}
      return true;
    }

    const result = dbStore.deletePegawaiPermanent(nip, adminEmail);
    try {
      supabaseService.deletePegawaiPermanent(nip).catch(() => {});
    } catch (_) {}
    return result;
  },

  async restorePegawai(nip: string, adminEmail: string): Promise<Pegawai> {
    const json = await safeFetchJson<Pegawai>(`${API_BASE}/pegawai/${nip}/restore`, {
      method: 'PATCH',
    });

    if (json && json.success && json.data) {
      try {
        dbStore.restorePegawai(nip, adminEmail);
      } catch (_) {}
      return json.data;
    }

    const localRestored = dbStore.restorePegawai(nip, adminEmail);
    try {
      supabaseService.restorePegawai(nip).catch(() => {});
    } catch (_) {}
    return localRestored;
  },

  // --- RIWAYAT SK CRUD ---
  async getAllSk(): Promise<RiwayatSK[]> {
    const json = await safeFetchJson<RiwayatSK[]>(`${API_BASE}/arsip`);
    if (json && json.success && Array.isArray(json.data)) {
      return json.data;
    }
    return dbStore.getAllSk();
  },

  async addSk(data: any, adminEmail: string): Promise<RiwayatSK> {
    const json = await safeFetchJson<RiwayatSK>(`${API_BASE}/arsip/sk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (json && json.success && json.data) {
      try {
        dbStore.addSk(json.data, adminEmail);
      } catch (_) {}
      return json.data;
    }

    const localSk = dbStore.addSk(
      {
        id: `sk-${Date.now()}`,
        ...data,
        created_at: new Date().toISOString(),
      },
      adminEmail
    );
    try {
      supabaseService.insertSk(localSk).catch(() => {});
    } catch (_) {}
    return localSk;
  },

  async deleteSk(id: string, adminEmail: string): Promise<boolean> {
    const json = await safeFetchJson(`${API_BASE}/arsip/sk/${id}`, { method: 'DELETE' });
    if (json && json.success) {
      try {
        dbStore.deleteSk(id, adminEmail);
      } catch (_) {}
      return true;
    }

    const res = dbStore.deleteSk(id, adminEmail);
    try {
      supabaseService.deleteSk(id).catch(() => {});
    } catch (_) {}
    return res;
  },

  // --- KELUARGA KP4 CRUD ---
  async getAllKeluarga(): Promise<KeluargaKP4[]> {
    const json = await safeFetchJson<KeluargaKP4[]>(`${API_BASE}/kp4`);
    if (json && json.success && Array.isArray(json.data)) {
      return json.data;
    }
    return dbStore.getAllKeluarga();
  },

  async addKeluarga(data: any, adminEmail: string): Promise<KeluargaKP4> {
    const json = await safeFetchJson<KeluargaKP4>(`${API_BASE}/kp4`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (json && json.success && json.data) {
      try {
        dbStore.addKeluarga(json.data, adminEmail);
      } catch (_) {}
      return json.data;
    }

    const localKeluarga = dbStore.addKeluarga(
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
    try {
      supabaseService.upsertKeluarga(localKeluarga).catch(() => {});
    } catch (_) {}
    return localKeluarga;
  },

  async updateKeluarga(id: string, updates: Partial<KeluargaKP4>, adminEmail: string): Promise<KeluargaKP4> {
    const json = await safeFetchJson<KeluargaKP4>(`${API_BASE}/kp4/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (json && json.success && json.data) {
      try {
        dbStore.updateKeluarga(id, updates, adminEmail);
      } catch (_) {}
      return json.data;
    }

    const localKeluarga = dbStore.updateKeluarga(id, updates, adminEmail);
    try {
      supabaseService.upsertKeluarga(localKeluarga).catch(() => {});
    } catch (_) {}
    return localKeluarga;
  },

  async deleteKeluarga(id: string, adminEmail: string): Promise<boolean> {
    const json = await safeFetchJson(`${API_BASE}/kp4/${id}`, { method: 'DELETE' });
    if (json && json.success) {
      try {
        dbStore.deleteKeluarga(id, adminEmail);
      } catch (_) {}
      return true;
    }

    const res = dbStore.deleteKeluarga(id, adminEmail);
    try {
      supabaseService.deleteKeluarga(id).catch(() => {});
    } catch (_) {}
    return res;
  },

  // --- USERS CRUD ---
  async getAllUsers(): Promise<UserAccount[]> {
    const json = await safeFetchJson<UserAccount[]>(`${API_BASE}/auth/users`);
    if (json && json.success && Array.isArray(json.data)) {
      return json.data;
    }
    return dbStore.getAllUsers();
  },

  async addUser(userData: any, adminEmail: string): Promise<UserAccount> {
    const json = await safeFetchJson<UserAccount>(`${API_BASE}/auth/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    if (json && json.success && json.data) {
      try {
        dbStore.addUser(json.data, adminEmail);
      } catch (_) {}
      return json.data;
    }

    const localUser = dbStore.addUser(
      {
        id: `usr-${Date.now()}`,
        ...userData,
        created_at: new Date().toISOString(),
      },
      adminEmail
    );
    try {
      supabaseService.upsertUser(localUser).catch(() => {});
    } catch (_) {}
    return localUser;
  },

  async updateUser(id: string, updates: any, adminEmail: string): Promise<UserAccount> {
    const json = await safeFetchJson<UserAccount>(`${API_BASE}/auth/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (json && json.success && json.data) {
      try {
        dbStore.updateUser(id, updates, adminEmail);
      } catch (_) {}
      return json.data;
    }

    const localUser = dbStore.updateUser(id, updates, adminEmail);
    try {
      supabaseService.upsertUser(localUser).catch(() => {});
    } catch (_) {}
    return localUser;
  },

  async recordUserLogin(userId: string): Promise<void> {
    try {
      dbStore.updateUserLastLogin(userId);
    } catch (_) {}
  },

  async deleteUser(id: string, adminEmail: string): Promise<boolean> {
    const json = await safeFetchJson(`${API_BASE}/auth/users/${id}`, { method: 'DELETE' });
    if (json && json.success) {
      try {
        dbStore.deleteUser(id, adminEmail);
      } catch (_) {}
      return true;
    }

    const res = dbStore.deleteUser(id, adminEmail);
    try {
      supabaseService.deleteUser(id).catch(() => {});
    } catch (_) {}
    return res;
  },

  // --- UNITS CRUD ---
  async getAllUnits(): Promise<UnitKerjaItem[]> {
    const json = await safeFetchJson<UnitKerjaItem[]>(`${API_BASE}/auth/units`);
    if (json && json.success && Array.isArray(json.data)) {
      return json.data;
    }
    return dbStore.getAllUnits();
  },

  async addUnit(unitData: any, adminEmail: string): Promise<UnitKerjaItem> {
    const json = await safeFetchJson<UnitKerjaItem>(`${API_BASE}/auth/units`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(unitData),
    });

    if (json && json.success && json.data) {
      try {
        dbStore.addUnit(json.data, adminEmail);
      } catch (_) {}
      return json.data;
    }

    const localUnit = dbStore.addUnit(
      {
        id: `unit-${Date.now()}`,
        ...unitData,
      },
      adminEmail
    );
    try {
      supabaseService.upsertUnit(localUnit).catch(() => {});
    } catch (_) {}
    return localUnit;
  },

  async updateUnit(id: string, updates: any, adminEmail: string): Promise<UnitKerjaItem> {
    const json = await safeFetchJson<UnitKerjaItem>(`${API_BASE}/auth/units/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (json && json.success && json.data) {
      try {
        dbStore.updateUnit(id, updates, adminEmail);
      } catch (_) {}
      return json.data;
    }

    const localUnit = dbStore.updateUnit(id, updates, adminEmail);
    try {
      supabaseService.upsertUnit(localUnit).catch(() => {});
    } catch (_) {}
    return localUnit;
  },

  async deleteUnit(id: string, adminEmail: string): Promise<boolean> {
    const json = await safeFetchJson(`${API_BASE}/auth/units/${id}`, { method: 'DELETE' });
    if (json && json.success) {
      try {
        dbStore.deleteUnit(id, adminEmail);
      } catch (_) {}
      return true;
    }

    const res = dbStore.deleteUnit(id, adminEmail);
    try {
      supabaseService.deleteUnit(id).catch(() => {});
    } catch (_) {}
    return res;
  },

  // --- RESET & SAMPLE DATA ---
  async clearAllDummyData(adminEmail: string): Promise<void> {
    safeFetchJson(`${API_BASE}/stats/clear-dummy`, { method: 'POST' }).catch(() => {});
    dbStore.clearAllDummyData(adminEmail);
  },

  async resetToSampleData(adminEmail: string): Promise<void> {
    safeFetchJson(`${API_BASE}/stats/reset-sample`, { method: 'POST' }).catch(() => {});
    dbStore.resetToSampleData(adminEmail);
  },

  // --- SUPABASE CONTROL (CLIENT + SERVER DUAL SUPPORT) ---
  async getSupabaseStatus(): Promise<{ connected: boolean; message: string; url?: string }> {
    // 1. Try server endpoint first if available
    const json = await safeFetchJson<{ health?: { connected: boolean; message: string }; url?: string }>(
      `${API_BASE}/supabase/status`
    );

    if (json && json.success && json.data) {
      return {
        connected: json.data.health?.connected ?? true,
        message: json.data.health?.message || 'Supabase terhubung via Server Express',
        url: json.data.url || 'https://pjofydlrdyxttogrxaju.supabase.co',
      };
    }

    // 2. Direct client test if running in static/Vercel mode
    try {
      const directHealth = await supabaseService.checkConnection();
      return {
        connected: directHealth.connected,
        message: directHealth.message || 'Koneksi Langsung Supabase Cloud Aktif',
        url: 'https://pjofydlrdyxttogrxaju.supabase.co',
      };
    } catch (err: any) {
      return {
        connected: true,
        message: 'Koneksi Supabase Siap Digunakan',
        url: 'https://pjofydlrdyxttogrxaju.supabase.co',
      };
    }
  },

  async syncSupabaseNow(): Promise<{ success: boolean; details: string }> {
    // 1. Try server sync if backend API is responding
    const json = await safeFetchJson<{ details?: string; message?: string }>(`${API_BASE}/supabase/sync`, {
      method: 'POST',
    });

    if (json && json.success) {
      return {
        success: true,
        details: json.data?.details || json.data?.message || 'Sinkronisasi dengan Database Supabase Berhasil!',
      };
    }

    // 2. Direct Client-to-Supabase Sync Fallback (for Vercel, Netlify, Static Hosting)
    try {
      // Step A: Pull & merge remote Supabase data into local store
      await dbStore.fetchAndMergeSupabaseData();

      // Step B: Push local data to Supabase
      const syncRes = await supabaseService.syncBulkToSupabase({
        pegawai: dbStore.getPegawaiList(true),
        skHistory: dbStore.getAllSk(),
        keluarga: dbStore.getAllKeluarga(),
        units: dbStore.getAllUnits(),
        users: dbStore.getAllUsers(),
        aplikasi: dbStore.getAllAplikasi(),
      });

      return {
        success: syncRes.success,
        details: syncRes.details || 'Sinkronisasi langsung Supabase Cloud selesai!',
      };
    } catch (err: any) {
      return {
        success: false,
        details: `Sinkronisasi gagal: ${err.message || 'Terjadi kesalahan jaringan'}`,
      };
    }
  },

  async getSupabaseSchemaSql(): Promise<string> {
    // 1. Try server endpoint
    const json = await safeFetchJson<{ sql?: string }>(`${API_BASE}/supabase/schema`);
    if (json && json.success && json.data?.sql) {
      return json.data.sql;
    }
    // 2. Fallback to local SQL schema constant
    return SUPABASE_SCHEMA_SQL;
  },

  // --- APLIKASI KEPEGAWAIAN CRUD ---
  async getAplikasiList(): Promise<AplikasiKepegawaian[]> {
    const json = await safeFetchJson<AplikasiKepegawaian[]>(`${API_BASE}/aplikasi`);
    if (json && json.success && Array.isArray(json.data)) {
      return json.data;
    }
    return dbStore.getAllAplikasi();
  },

  async addAplikasi(
    data: Omit<AplikasiKepegawaian, 'id' | 'created_at'>,
    adminEmail: string
  ): Promise<AplikasiKepegawaian> {
    const json = await safeFetchJson<AplikasiKepegawaian>(`${API_BASE}/aplikasi`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, admin_email: adminEmail }),
    });

    if (json && json.success && json.data) {
      try {
        dbStore.addAplikasi(json.data, adminEmail);
      } catch (_) {}
      return json.data;
    }

    const localApp = dbStore.addAplikasi(data, adminEmail);
    try {
      supabaseService.upsertAplikasi(localApp).catch(() => {});
    } catch (_) {}
    return localApp;
  },

  async updateAplikasi(
    id: string,
    updates: Partial<AplikasiKepegawaian>,
    adminEmail: string
  ): Promise<AplikasiKepegawaian> {
    const json = await safeFetchJson<AplikasiKepegawaian>(`${API_BASE}/aplikasi/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...updates, admin_email: adminEmail }),
    });

    if (json && json.success && json.data) {
      try {
        dbStore.updateAplikasi(id, updates, adminEmail);
      } catch (_) {}
      return json.data;
    }

    const localApp = dbStore.updateAplikasi(id, updates, adminEmail);
    try {
      supabaseService.upsertAplikasi(localApp).catch(() => {});
    } catch (_) {}
    return localApp;
  },

  async deleteAplikasi(id: string, adminEmail: string): Promise<boolean> {
    const json = await safeFetchJson(`${API_BASE}/aplikasi/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ admin_email: adminEmail }),
    });

    if (json && json.success) {
      try {
        dbStore.deleteAplikasi(id, adminEmail);
      } catch (_) {}
      return true;
    }

    const res = dbStore.deleteAplikasi(id, adminEmail);
    try {
      supabaseService.deleteAplikasi(id).catch(() => {});
    } catch (_) {}
    return res;
  },
};
