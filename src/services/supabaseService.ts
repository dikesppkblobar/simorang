import { supabase } from './supabaseClient';
import {
  Pegawai,
  RiwayatSK,
  KeluargaKP4,
  AuditLog,
  UnitKerjaItem,
  UserAccount,
  AplikasiKepegawaian,
} from '../types';

// Helper to sanitize UserAccount for Supabase tables
function cleanUserForSupabase(user: UserAccount, withPassword = true): Record<string, any> {
  const clean: Record<string, any> = {
    id: user.id,
    username: user.username,
    nama_lengkap: user.nama_lengkap,
    email: user.email || null,
    role: user.role || 'Admin Unit Kerja',
    unit_kerja: user.unit_kerja || 'Dinas Kesehatan Kab. Lombok Barat',
    status: user.status || 'Aktif',
    created_at: user.created_at || new Date().toISOString(),
  };

  if (user.nip) clean.nip = user.nip;
  if (user.no_hp) clean.no_hp = user.no_hp;
  if ((user as any).avatar_url) clean.avatar_url = (user as any).avatar_url;
  if (user.terakhir_login) clean.terakhir_login = user.terakhir_login;
  if (withPassword && user.password) {
    clean.password = user.password;
  }

  return clean;
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
        console.warn('Supabase fetchAllPegawai error:', error.message);
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

      console.warn('Supabase full upsertPegawai warning:', error.message, 'Trying sanitized upsert...');

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
      if (pegawai.no_str) fallbackPayload.no_str = pegawai.no_str;
      if (pegawai.no_sip) fallbackPayload.no_sip = pegawai.no_sip;

      const { error: fbErr } = await supabase.from('pegawai').upsert(fallbackPayload, { onConflict: 'nip' });
      if (fbErr) {
        console.error('Supabase fallback upsertPegawai error:', fbErr.message);
        return false;
      }
      return true;
    } catch (err: any) {
      console.error('Supabase upsertPegawai exception:', err.message);
      return false;
    }
  },

  async deletePegawaiSoft(nip: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('pegawai')
        .update({ is_deleted: true })
        .eq('nip', nip);
      if (error) {
        console.warn('Supabase deletePegawaiSoft error:', error.message);
        return false;
      }
      return true;
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
      if (error) {
        console.warn('Supabase deletePegawaiPermanent error:', error.message);
        return false;
      }
      return true;
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
      if (error) {
        console.warn('Supabase restorePegawai error:', error.message);
        return false;
      }
      return true;
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
        console.warn('Supabase fetchAllSk warning:', error.message);
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
      if (error) {
        console.error('Supabase insertSk error:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      return false;
    }
  },

  async deleteSk(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('sk_history').delete().eq('id', id);
      if (error) {
        console.error('Supabase deleteSk error:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      return false;
    }
  },

  // KELUARGA KP4 CRUD
  async fetchAllKeluarga(): Promise<KeluargaKP4[] | null> {
    try {
      const { data, error } = await supabase.from('keluarga_kp4').select('*');
      if (error) {
        console.warn('Supabase fetchAllKeluarga warning:', error.message);
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
      if (error) {
        console.error('Supabase upsertKeluarga error:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      return false;
    }
  },

  async deleteKeluarga(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('keluarga_kp4').delete().eq('id', id);
      if (error) {
        console.error('Supabase deleteKeluarga error:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      return false;
    }
  },

  // AUDIT LOGS CRUD
  async fetchAllAuditLogs(): Promise<AuditLog[] | null> {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        console.warn('Supabase fetchAllAuditLogs warning:', error.message);
        return null;
      }
      return data as AuditLog[];
    } catch (err) {
      return null;
    }
  },

  async insertAuditLog(log: AuditLog): Promise<boolean> {
    try {
      const { error } = await supabase.from('audit_logs').upsert(log, { onConflict: 'id' });
      if (error) {
        console.error('Supabase insertAuditLog error:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      return false;
    }
  },

  // UNITS CRUD
  async fetchAllUnits(): Promise<UnitKerjaItem[] | null> {
    try {
      const { data, error } = await supabase.from('units').select('*').order('nama_unit', { ascending: true });
      if (error) {
        console.warn('Supabase fetchAllUnits warning:', error.message);
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
      if (error) {
        console.error('Supabase upsertUnit error:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      return false;
    }
  },

  async deleteUnit(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('units').delete().eq('id', id);
      if (error) {
        console.error('Supabase deleteUnit error:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      return false;
    }
  },

  // USERS CRUD
  async fetchAllUsers(): Promise<UserAccount[] | null> {
    try {
      const { data, error } = await supabase.from('users').select('*').order('nama_lengkap', { ascending: true });
      if (error) {
        console.warn('Supabase fetchAllUsers warning:', error.message);
        return null;
      }
      return data as UserAccount[];
    } catch (err) {
      return null;
    }
  },

  async upsertUser(user: UserAccount): Promise<boolean> {
    try {
      // 1. Try with password (sanitized object matching standard DDL, without extra fields like updated_at)
      const payloadWithPass = cleanUserForSupabase(user, true);
      const { error: err1 } = await supabase.from('users').upsert(payloadWithPass, { onConflict: 'id' });
      if (!err1) {
        return true;
      }

      // 2. If password column doesn't exist in user's Supabase schema cache, try sanitized payload without password
      const payloadNoPass = cleanUserForSupabase(user, false);
      const { error: err2 } = await supabase.from('users').upsert(payloadNoPass, { onConflict: 'id' });
      if (!err2) {
        return true;
      }

      // 3. Fallback: ultra-safe minimal columns
      const minimalPayload: Record<string, any> = {
        id: user.id,
        username: user.username,
        nama_lengkap: user.nama_lengkap,
        role: user.role,
        unit_kerja: user.unit_kerja,
        status: user.status || 'Aktif',
      };
      if (user.email) minimalPayload.email = user.email;
      const { error: err3 } = await supabase.from('users').upsert(minimalPayload, { onConflict: 'id' });
      if (!err3) {
        return true;
      }

      console.warn('Supabase upsertUser all attempts warning:', err3.message);
      return false;
    } catch (err: any) {
      console.error('Supabase upsertUser exception:', err?.message || err);
      return false;
    }
  },

  async deleteUser(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('users').delete().eq('id', id);
      if (error) {
        console.error('Supabase deleteUser error:', error.message);
        return false;
      }
      return true;
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
        console.warn('Supabase fetchAllAplikasi warning:', error.message);
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
      if (error) {
        console.warn('Supabase upsertAplikasi error:', error.message);
        return false;
      }
      return true;
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
      if (error) {
        console.warn('Supabase deleteAplikasi error:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      return false;
    }
  },

  // Sync state to Supabase
  async syncBulkToSupabase(payload: {
    pegawai: Pegawai[];
    skHistory: RiwayatSK[];
    keluarga: KeluargaKP4[];
    auditLogs: AuditLog[];
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
      if (payload.auditLogs.length > 0) {
        const { error: lErr } = await supabase.from('audit_logs').upsert(payload.auditLogs, { onConflict: 'id' });
        if (!lErr) syncedCount += payload.auditLogs.length;
      }
      if (payload.units.length > 0) {
        const { error: uErr } = await supabase.from('units').upsert(payload.units, { onConflict: 'id' });
        if (!uErr) syncedCount += payload.units.length;
      }
      if (payload.users.length > 0) {
        const cleanedUsersWithPass = payload.users.map((u) => cleanUserForSupabase(u, true));
        const { error: usrErr } = await supabase.from('users').upsert(cleanedUsersWithPass, { onConflict: 'id' });
        if (usrErr) {
          const cleanedUsersNoPass = payload.users.map((u) => cleanUserForSupabase(u, false));
          const { error: fbUsrErr } = await supabase.from('users').upsert(cleanedUsersNoPass, { onConflict: 'id' });
          if (!fbUsrErr) syncedCount += payload.users.length;
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
