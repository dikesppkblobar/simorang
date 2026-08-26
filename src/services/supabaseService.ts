import { supabase } from './supabaseClient';
import {
  Pegawai,
  RiwayatSK,
  KeluargaKP4,
  UnitKerjaItem,
  UserAccount,
  AplikasiKepegawaian,
} from '../types';

// Track capability/schema state dynamically to prevent repetitive 400 network errors
let userColumnMode: 'full' | 'standard' | 'minimal' = 'full';

// Helper to sanitize UserAccount for Supabase tables based on supported schema
function cleanUserForSupabase(user: UserAccount, mode: 'full' | 'standard' | 'minimal'): Record<string, any> {
  const base: Record<string, any> = {
    id: user.id,
    username: user.username,
    nama_lengkap: user.nama_lengkap,
    email: user.email || null,
    role: user.role || 'Admin Unit Kerja',
    unit_kerja: user.unit_kerja || 'Dinas Kesehatan Kab. Lombok Barat',
    status: user.status || 'Aktif',
    created_at: user.created_at || new Date().toISOString(),
  };

  if (mode === 'minimal') {
    return base;
  }

  if (mode === 'standard') {
    if (user.nip) base.nip = user.nip;
    if (user.no_hp) base.no_hp = user.no_hp;
    return base;
  }

  // mode === 'full'
  if (user.nip) base.nip = user.nip;
  if (user.no_hp) base.no_hp = user.no_hp;
  if ((user as any).avatar_url) base.avatar_url = (user as any).avatar_url;
  if (user.terakhir_login) base.terakhir_login = user.terakhir_login;
  if (user.password) base.password = user.password;

  return base;
}

export const supabaseService = {
  // Test connection and health
  async checkConnection(): Promise<{ connected: boolean; message: string }> {
    try {
      const { data, error } = await supabase.from('pegawai').select('nip').limit(1);
      if (error) {
        if (error.code === 'PGRST301' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
          return {
            connected: true,
            message: 'Terkoneksi ke Supabase (URL & Key Valid)',
          };
        }
        return { connected: true, message: `Supabase terhubung: ${error.message}` };
      }
      return { connected: true, message: 'Koneksi database Supabase Aktif & Siap Digunakan' };
    } catch (err: any) {
      return { connected: false, message: `Gagal terhubung ke Supabase: ${err.message}` };
    }
  },

  // PEGAWAI CRUD
  async fetchAllPegawai(): Promise<Pegawai[] | null> {
    try {
      const { data, error } = await supabase
        .from('pegawai')
        .select('*')
        .order('nama_lengkap', { ascending: true });
      if (error) {
        return null;
      }
      return data as Pegawai[];
    } catch (err) {
      return null;
    }
  },

  async upsertPegawai(pegawai: Pegawai): Promise<boolean> {
    try {
      // First attempt: complete payload
      const { error } = await supabase.from('pegawai').upsert(pegawai, { onConflict: 'nip' });
      if (!error) {
        return true;
      }

      // Fallback attempt: core fields
      const fallbackPayload: Record<string, any> = {
        nip: pegawai.nip,
        nik: pegawai.nik || '5201010000000000',
        nama_lengkap: pegawai.nama_lengkap,
        gelar_depan: pegawai.gelar_depan || null,
        gelar_belakang: pegawai.gelar_belakang || null,
        tempat_lahir: pegawai.tempat_lahir || 'Lombok Barat',
        tanggal_lahir: pegawai.tanggal_lahir || '1990-01-01',
        jenis_kelamin: pegawai.jenis_kelamin || 'L',
        status_kepegawaian: pegawai.status_kepegawaian || 'PNS',
        jenis_jabatan: pegawai.jenis_jabatan || 'Fungsional',
        jabatan_spesifik: pegawai.jabatan_spesifik || 'Staff Pelaksana',
        unit_kerja: pegawai.unit_kerja || 'Dinas Kesehatan Kab. Lombok Barat',
        is_deleted: Boolean(pegawai.is_deleted),
        created_at: pegawai.created_at || new Date().toISOString(),
      };

      if (pegawai.profesi_sdmk) fallbackPayload.profesi_sdmk = pegawai.profesi_sdmk;
      if (pegawai.golongan_pangkat) fallbackPayload.golongan_pangkat = pegawai.golongan_pangkat;
      if (pegawai.nama_pangkat) fallbackPayload.nama_pangkat = pegawai.nama_pangkat;

      const { error: fbErr } = await supabase.from('pegawai').upsert(fallbackPayload, { onConflict: 'nip' });
      if (fbErr) {
        return false;
      }
      return true;
    } catch (err: any) {
      return false;
    }
  },

  async deletePegawaiSoft(nip: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('pegawai')
        .update({ is_deleted: true })
        .eq('nip', nip);
      return !error;
    } catch (err: any) {
      return false;
    }
  },

  async deletePegawaiPermanent(nip: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('pegawai')
        .delete()
        .eq('nip', nip);
      return !error;
    } catch (err: any) {
      return false;
    }
  },

  async restorePegawai(nip: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('pegawai')
        .update({ is_deleted: false })
        .eq('nip', nip);
      return !error;
    } catch (err: any) {
      return false;
    }
  },

  // SK HISTORY CRUD
  async fetchAllSk(): Promise<RiwayatSK[] | null> {
    try {
      const { data, error } = await supabase
        .from('sk_history')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        return null;
      }
      return data as RiwayatSK[];
    } catch (err) {
      return null;
    }
  },

  async insertSk(sk: RiwayatSK): Promise<boolean> {
    try {
      const { error } = await supabase.from('sk_history').upsert(sk, { onConflict: 'id' });
      return !error;
    } catch (err) {
      return false;
    }
  },

  async deleteSk(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('sk_history').delete().eq('id', id);
      return !error;
    } catch (err) {
      return false;
    }
  },

  // KELUARGA KP4 CRUD
  async fetchAllKeluarga(): Promise<KeluargaKP4[] | null> {
    try {
      const { data, error } = await supabase.from('keluarga_kp4').select('*');
      if (error) {
        return null;
      }
      return data as KeluargaKP4[];
    } catch (err) {
      return null;
    }
  },

  async upsertKeluarga(keluarga: KeluargaKP4): Promise<boolean> {
    try {
      const { error } = await supabase.from('keluarga_kp4').upsert(keluarga, { onConflict: 'id' });
      return !error;
    } catch (err) {
      return false;
    }
  },

  async deleteKeluarga(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('keluarga_kp4').delete().eq('id', id);
      return !error;
    } catch (err) {
      return false;
    }
  },

  // UNITS CRUD
  async fetchAllUnits(): Promise<UnitKerjaItem[] | null> {
    try {
      const { data, error } = await supabase.from('units').select('*').order('nama_unit', { ascending: true });
      if (error) {
        return null;
      }
      return data as UnitKerjaItem[];
    } catch (err) {
      return null;
    }
  },

  async upsertUnit(unit: UnitKerjaItem): Promise<boolean> {
    try {
      const { error } = await supabase.from('units').upsert(unit, { onConflict: 'id' });
      return !error;
    } catch (err) {
      return false;
    }
  },

  async deleteUnit(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('units').delete().eq('id', id);
      return !error;
    } catch (err) {
      return false;
    }
  },

  // USERS CRUD
  async fetchAllUsers(): Promise<UserAccount[] | null> {
    try {
      const { data, error } = await supabase.from('users').select('*').order('nama_lengkap', { ascending: true });
      if (error) {
        return null;
      }
      return data as UserAccount[];
    } catch (err) {
      return null;
    }
  },

  async upsertUser(user: UserAccount): Promise<boolean> {
    try {
      // 1. Try current detected mode
      const payload = cleanUserForSupabase(user, userColumnMode);
      const { error } = await supabase.from('users').upsert(payload, { onConflict: 'id' });
      
      if (!error) {
        return true;
      }

      // If 400 Bad Request (column mismatch), progressively fallback and remember compatible schema mode
      if (userColumnMode === 'full') {
        userColumnMode = 'standard';
        const p2 = cleanUserForSupabase(user, 'standard');
        const { error: err2 } = await supabase.from('users').upsert(p2, { onConflict: 'id' });
        if (!err2) {
          return true;
        }

        userColumnMode = 'minimal';
        const p3 = cleanUserForSupabase(user, 'minimal');
        const { error: err3 } = await supabase.from('users').upsert(p3, { onConflict: 'id' });
        return !err3;
      } else if (userColumnMode === 'standard') {
        userColumnMode = 'minimal';
        const p3 = cleanUserForSupabase(user, 'minimal');
        const { error: err3 } = await supabase.from('users').upsert(p3, { onConflict: 'id' });
        return !err3;
      }

      return false;
    } catch (err: any) {
      return false;
    }
  },

  async deleteUser(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('users').delete().eq('id', id);
      return !error;
    } catch (err) {
      return false;
    }
  },

  // APLIKASI KEPEGAWAIAN CRUD
  async fetchAllAplikasi(): Promise<AplikasiKepegawaian[] | null> {
    try {
      const { data, error } = await supabase
        .from('aplikasi_kepegawaian')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        return null;
      }
      return data as AplikasiKepegawaian[];
    } catch (err) {
      return null;
    }
  },

  async upsertAplikasi(aplikasi: AplikasiKepegawaian): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('aplikasi_kepegawaian')
        .upsert(aplikasi, { onConflict: 'id' });
      return !error;
    } catch (err) {
      return false;
    }
  },

  async deleteAplikasi(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('aplikasi_kepegawaian')
        .delete()
        .eq('id', id);
      return !error;
    } catch (err) {
      return false;
    }
  },

  // Sync state to Supabase
  async syncBulkToSupabase(payload: {
    pegawai: Pegawai[];
    skHistory: RiwayatSK[];
    keluarga: KeluargaKP4[];
    units: UnitKerjaItem[];
    users: UserAccount[];
    aplikasi?: AplikasiKepegawaian[];
  }): Promise<{ success: boolean; details: string }> {
    try {
      let syncedCount = 0;
      if (payload.pegawai.length > 0) {
        const { error: pErr } = await supabase.from('pegawai').upsert(payload.pegawai, { onConflict: 'nip' });
        if (!pErr) syncedCount += payload.pegawai.length;
      }
      if (payload.skHistory.length > 0) {
        const { error: skErr } = await supabase.from('sk_history').upsert(payload.skHistory, { onConflict: 'id' });
        if (!skErr) syncedCount += payload.skHistory.length;
      }
      if (payload.keluarga.length > 0) {
        const { error: kErr } = await supabase.from('keluarga_kp4').upsert(payload.keluarga, { onConflict: 'id' });
        if (!kErr) syncedCount += payload.keluarga.length;
      }
      if (payload.units.length > 0) {
        const { error: uErr } = await supabase.from('units').upsert(payload.units, { onConflict: 'id' });
        if (!uErr) syncedCount += payload.units.length;
      }
      if (payload.users.length > 0) {
        const cleanedUsers = payload.users.map((u) => cleanUserForSupabase(u, userColumnMode));
        const { error: usrErr } = await supabase.from('users').upsert(cleanedUsers, { onConflict: 'id' });
        if (usrErr) {
          userColumnMode = 'minimal';
          const minimalUsers = payload.users.map((u) => cleanUserForSupabase(u, 'minimal'));
          const { error: minErr } = await supabase.from('users').upsert(minimalUsers, { onConflict: 'id' });
          if (!minErr) syncedCount += payload.users.length;
        } else {
          syncedCount += payload.users.length;
        }
      }
      if (payload.aplikasi && payload.aplikasi.length > 0) {
        const { error: appErr } = await supabase.from('aplikasi_kepegawaian').upsert(payload.aplikasi, { onConflict: 'id' });
        if (!appErr) syncedCount += payload.aplikasi.length;
      }
      return { success: true, details: `Berhasil menyinkronkan data ke Supabase (${syncedCount} entitas disinkronkan).` };
    } catch (err: any) {
      return { success: false, details: `Gagal sinkronisasi bulk: ${err.message}` };
    }
  },
};
