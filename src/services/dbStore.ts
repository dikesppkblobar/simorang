import fs from 'fs';
import path from 'path';
import { Pegawai, RiwayatSK, KeluargaKP4, AuditLog, UnitKerjaItem, UserAccount, AplikasiKepegawaian } from '../types';
import { supabaseService } from './supabaseService';
import {
  INITIAL_PEGAWAI,
  INITIAL_SK_HISTORY,
  INITIAL_KELUARGA,
  INITIAL_AUDIT_LOGS,
  INITIAL_UNITS,
  INITIAL_USERS,
  INITIAL_APLIKASI_KEPEGAWAIAN,
} from './database';

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

class DBStore {
  private pegawai: Pegawai[] = [];
  private skHistory: RiwayatSK[] = [];
  private keluarga: KeluargaKP4[] = [];
  private auditLogs: AuditLog[] = [];
  private units: UnitKerjaItem[] = [];
  private users: UserAccount[] = [];
  private aplikasiList: AplikasiKepegawaian[] = [];

  constructor() {
    this.initData();
    this.fetchAndMergeSupabaseData().catch((err) => {
      console.warn('Initial Supabase fetch failed:', err);
    });
  }

  private initData() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const isInit = window.localStorage.getItem('sipatuh_db_initialized');
        if (isInit === 'true') {
          const p = window.localStorage.getItem('sipatuh_pegawai');
          const sk = window.localStorage.getItem('sipatuh_sk_history');
          const k = window.localStorage.getItem('sipatuh_keluarga');
          const log = window.localStorage.getItem('sipatuh_audit_logs');
          const u = window.localStorage.getItem('sipatuh_units');
          const usr = window.localStorage.getItem('sipatuh_users');
          const app = window.localStorage.getItem('sipatuh_aplikasi');

          this.pegawai = p !== null ? JSON.parse(p) : [];
          this.skHistory = sk !== null ? JSON.parse(sk) : [];
          this.keluarga = k !== null ? JSON.parse(k) : [];
          this.auditLogs = log !== null ? JSON.parse(log) : [];
          this.units = u !== null ? JSON.parse(u) : [];
          this.users = usr !== null ? JSON.parse(usr) : [];
          this.aplikasiList = app !== null ? JSON.parse(app) : [];
          return;
        }
      } catch (err) {
        console.error('Error loading dbStore from localStorage:', err);
      }
    } else if (typeof window === 'undefined') {
      try {
        // Node.js Express server persistence
        const filePath = path.join(process.cwd(), 'data', 'sipatuh_db.json');
        if (fs && fs.existsSync && fs.existsSync(filePath)) {
          const raw = fs.readFileSync(filePath, 'utf-8');
          const parsed = JSON.parse(raw);
          this.pegawai = parsed.pegawai || [];
          this.skHistory = parsed.skHistory || [];
          this.keluarga = parsed.keluarga || [];
          this.auditLogs = parsed.auditLogs || [];
          this.units = parsed.units || [];
          this.users = parsed.users || [];
          this.aplikasiList = parsed.aplikasiList || [];
          return;
        }
      } catch (err) {
        console.error('Error loading dbStore from server file:', err);
      }
    }

    // Default Fallback (Kosong, mengacu ke database riil)
    this.pegawai = [];
    this.skHistory = [];
    this.keluarga = [];
    this.auditLogs = [];
    this.units = [];
    this.users = [];
    this.aplikasiList = [];
    this.saveToStorage();
  }

  private saveToStorage(triggerSupabaseSync: boolean = true) {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem('sipatuh_pegawai', JSON.stringify(this.pegawai));
        window.localStorage.setItem('sipatuh_sk_history', JSON.stringify(this.skHistory));
        window.localStorage.setItem('sipatuh_keluarga', JSON.stringify(this.keluarga));
        window.localStorage.setItem('sipatuh_audit_logs', JSON.stringify(this.auditLogs));
        window.localStorage.setItem('sipatuh_units', JSON.stringify(this.units));
        window.localStorage.setItem('sipatuh_users', JSON.stringify(this.users));
        window.localStorage.setItem('sipatuh_aplikasi', JSON.stringify(this.aplikasiList));
        window.localStorage.setItem('sipatuh_db_initialized', 'true');
      } catch (err) {
        console.error('Error saving dbStore to storage:', err);
      }
    } else if (typeof window === 'undefined') {
      try {
        if (fs && fs.mkdirSync && fs.writeFileSync) {
          const dataDir = path.join(process.cwd(), 'data');
          if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
          }
          const filePath = path.join(dataDir, 'sipatuh_db.json');
          const payload = {
            pegawai: this.pegawai,
            skHistory: this.skHistory,
            keluarga: this.keluarga,
            auditLogs: this.auditLogs,
            units: this.units,
            users: this.users,
            aplikasiList: this.aplikasiList,
          };
          fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf-8');
        }
      } catch (err) {
        console.error('Error saving dbStore to server file:', err);
      }
    }

    if (triggerSupabaseSync) {
      // Sync to Supabase Cloud Database in background
      supabaseService.syncBulkToSupabase({
        pegawai: this.pegawai,
        skHistory: this.skHistory,
        keluarga: this.keluarga,
        auditLogs: this.auditLogs,
        units: this.units,
        users: this.users,
        aplikasi: this.aplikasiList,
      }).catch(() => {});
    }
  }

  async fetchAndMergeSupabaseData() {
    try {
      const [p, sk, k, log, u, usr, app] = await Promise.all([
        supabaseService.fetchAllPegawai(),
        supabaseService.fetchAllSk(),
        supabaseService.fetchAllKeluarga(),
        supabaseService.fetchAllAuditLogs(),
        supabaseService.fetchAllUnits(),
        supabaseService.fetchAllUsers(),
        supabaseService.fetchAllAplikasi(),
      ]);
      if (p !== null && Array.isArray(p)) this.pegawai = p;
      if (sk !== null && Array.isArray(sk)) this.skHistory = sk;
      if (k !== null && Array.isArray(k)) this.keluarga = k;
      if (log !== null && Array.isArray(log)) this.auditLogs = log;
      if (u !== null && Array.isArray(u)) this.units = u;

      if (usr !== null && Array.isArray(usr)) {
        if (usr.length === 0) {
          this.users = [];
        } else {
          // Smart merge users to ensure password and any local modifications are NEVER lost
          const mergedUsers = [...usr];
          for (let i = 0; i < mergedUsers.length; i++) {
            const remoteUser = mergedUsers[i];
            const localMatch = this.users.find(
              (uItem) =>
                uItem.id === remoteUser.id ||
                (uItem.username && remoteUser.username && uItem.username.toLowerCase() === remoteUser.username.toLowerCase())
            );
            if (localMatch) {
              mergedUsers[i] = {
                ...localMatch,
                ...remoteUser,
                password: remoteUser.password || localMatch.password || 'admin',
                nip: remoteUser.nip !== undefined ? remoteUser.nip : localMatch.nip,
                no_hp: remoteUser.no_hp !== undefined ? remoteUser.no_hp : localMatch.no_hp,
              };
            } else {
              mergedUsers[i] = {
                ...remoteUser,
                password: remoteUser.password || 'admin',
              };
            }
          }
          this.users = mergedUsers;
        }
      }

      if (app !== null && Array.isArray(app)) {
        this.aplikasiList = app;
      }

      this.saveToStorage(false);
      return true;
    } catch (err) {
      console.warn('Failed to fetch/merge Supabase data:', err);
      return false;
    }
  }

  // Clear All Dummy Data
  clearAllDummyData(adminEmail: string) {
    this.pegawai = [];
    this.skHistory = [];
    this.keluarga = [];
    this.auditLogs = [
      {
        id: `log-${Date.now()}`,
        admin_email: adminEmail,
        aksi: 'Database Reset',
        tabel_terdampak: 'master_database',
        deskripsi: 'Seluruh data dummy / sampel berhasil dibersihkan. Database SIMORANG DINKES-PPKB Lombok Barat siap digunakan untuk data real.',
        created_at: new Date().toISOString(),
      },
    ];
    this.saveToStorage();
  }

  // Reset to Initial Sample Data
  resetToSampleData(adminEmail: string) {
    this.pegawai = [...INITIAL_PEGAWAI];
    this.skHistory = [...INITIAL_SK_HISTORY];
    this.keluarga = [...INITIAL_KELUARGA];
    this.auditLogs = [...INITIAL_AUDIT_LOGS];
    this.units = [...INITIAL_UNITS];
    this.users = [...INITIAL_USERS];
    this.addAuditLog({
      admin_email: adminEmail,
      aksi: 'Restore Sample Data',
      tabel_terdampak: 'master_database',
      deskripsi: 'Memuat ulang data sampel awal ke dalam database.',
    });
    this.saveToStorage();
  }

  // Unit Kerja Operations
  getAllUnits() {
    return this.units;
  }

  addUnit(unit: UnitKerjaItem, adminEmail: string) {
    const existing = this.units.find((u) => u.nama_unit.toLowerCase() === unit.nama_unit.toLowerCase());
    if (existing) {
      throw new Error(`Unit kerja "${unit.nama_unit}" sudah terdaftar.`);
    }
    this.units.push(unit);
    this.addAuditLog({
      admin_email: adminEmail,
      aksi: 'Create',
      tabel_terdampak: 'unit_kerja',
      deskripsi: `Menambahkan Unit Kerja baru: ${unit.nama_unit} (${unit.kategori})`,
    });
    this.saveToStorage();
    supabaseService.upsertUnit(unit).catch((err) => {
      console.error('Supabase direct upsert on addUnit error:', err);
    });
    return unit;
  }

  updateUnit(id: string, updates: Partial<UnitKerjaItem>, adminEmail: string) {
    const idx = this.units.findIndex((u) => u.id === id);
    if (idx === -1) throw new Error('Unit kerja tidak ditemukan.');
    this.units[idx] = { ...this.units[idx], ...updates };
    this.addAuditLog({
      admin_email: adminEmail,
      aksi: 'Update',
      tabel_terdampak: 'unit_kerja',
      deskripsi: `Memperbarui data Unit Kerja: ${this.units[idx].nama_unit}`,
    });
    this.saveToStorage();
    supabaseService.upsertUnit(this.units[idx]).catch((err) => {
      console.error('Supabase direct upsert on updateUnit error:', err);
    });
    return this.units[idx];
  }

  deleteUnit(id: string, adminEmail: string) {
    const idx = this.units.findIndex((u) => u.id === id);
    if (idx === -1) throw new Error('Unit kerja tidak ditemukan.');
    const deletedName = this.units[idx].nama_unit;
    this.units.splice(idx, 1);
    this.addAuditLog({
      admin_email: adminEmail,
      aksi: 'Delete',
      tabel_terdampak: 'unit_kerja',
      deskripsi: `Menghapus Unit Kerja: ${deletedName}`,
    });
    this.saveToStorage();
    supabaseService.deleteUnit(id).catch((err) => {
      console.error('Supabase direct delete on deleteUnit error:', err);
    });
    return true;
  }

  // User Accounts Operations
  getAllUsers() {
    return this.users;
  }

  addUser(user: UserAccount, adminEmail: string) {
    const existingUsername = this.users.find((u) => u.username.toLowerCase() === user.username.toLowerCase());
    if (existingUsername) {
      throw new Error(`Username "${user.username}" sudah digunakan.`);
    }
    this.users.unshift(user);
    this.addAuditLog({
      admin_email: adminEmail,
      aksi: 'Create',
      tabel_terdampak: 'user_account',
      deskripsi: `Menambahkan Pengguna Baru: ${user.nama_lengkap} (${user.role} - ${user.unit_kerja})`,
    });
    this.saveToStorage();
    supabaseService.upsertUser(user).catch((err) => {
      console.error('Supabase direct upsert on addUser error:', err);
    });
    return user;
  }

  updateUser(id: string, updates: Partial<UserAccount>, adminEmail: string) {
    let idx = this.users.findIndex((u) => u.id === id);
    if (idx === -1) {
      idx = this.users.findIndex(
        (u) =>
          (updates.username && u.username?.toLowerCase() === updates.username.toLowerCase()) ||
          (updates.nip && u.nip === updates.nip) ||
          (updates.email && u.email?.toLowerCase() === updates.email.toLowerCase())
      );
    }
    if (idx === -1) throw new Error('Pengguna tidak ditemukan.');
    this.users[idx] = { 
      ...this.users[idx], 
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.addAuditLog({
      admin_email: adminEmail,
      aksi: 'Update',
      tabel_terdampak: 'user_account',
      deskripsi: `Memperbarui data akun pengguna: ${this.users[idx].nama_lengkap} (${this.users[idx].username}) - Role: ${this.users[idx].role}, Unit: ${this.users[idx].unit_kerja}`,
    });
    this.saveToStorage();
    supabaseService.upsertUser(this.users[idx]).catch((err) => {
      console.error('Supabase direct upsert on updateUser error:', err);
    });
    return this.users[idx];
  }

  updateUserLastLogin(userId: string) {
    const idx = this.users.findIndex((u) => u.id === userId);
    if (idx !== -1) {
      const now = new Date();
      const dateFormatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      this.users[idx].terakhir_login = dateFormatted;
      this.saveToStorage(false);
      supabaseService.upsertUser(this.users[idx]).catch(() => {});
    }
  }

  deleteUser(id: string, adminEmail: string) {
    const idx = this.users.findIndex((u) => u.id === id);
    if (idx === -1) throw new Error('Pengguna tidak ditemukan.');
    const deletedName = this.users[idx].nama_lengkap;
    this.users.splice(idx, 1);
    this.addAuditLog({
      admin_email: adminEmail,
      aksi: 'Delete',
      tabel_terdampak: 'user_account',
      deskripsi: `Menghapus akun pengguna: ${deletedName}`,
    });
    this.saveToStorage();
    supabaseService.deleteUser(id).catch((err) => {
      console.error('Supabase direct delete on deleteUser error:', err);
    });
    return true;
  }

  // Pegawai Operations
  getPegawaiList(includeDeleted: boolean = false, search?: string, jenisJabatan?: string) {
    let result = this.pegawai;
    if (!includeDeleted) {
      result = result.filter((p) => !p.is_deleted);
    }
    if (jenisJabatan && jenisJabatan !== 'Semua') {
      result = result.filter((p) => p.jenis_jabatan === jenisJabatan);
    }
    if (search && search.trim() !== '') {
      const query = search.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.nip.includes(query) ||
          p.nama_lengkap.toLowerCase().includes(query) ||
          p.unit_kerja.toLowerCase().includes(query) ||
          p.jabatan_spesifik.toLowerCase().includes(query)
      );
    }
    return result;
  }

  getPegawaiByNip(nip: string) {
    return this.pegawai.find((p) => p.nip === nip);
  }

  addPegawai(p: Pegawai, adminEmail: string) {
    const existing = this.getPegawaiByNip(p.nip);
    if (existing) {
      throw new Error(`Pegawai dengan NIP ${p.nip} sudah terdaftar.`);
    }
    this.pegawai.unshift(p);
    this.addAuditLog({
      admin_email: adminEmail,
      aksi: 'Create',
      tabel_terdampak: 'pegawai',
      deskripsi: `Menambahkan pegawai baru: ${p.nama_lengkap} (NIP: ${p.nip})`,
    });
    this.saveToStorage();
    supabaseService.upsertPegawai(p).catch((err) => {
      console.error('Supabase direct upsert on addPegawai error:', err);
    });
    return p;
  }

  updatePegawai(nip: string, updates: Partial<Pegawai>, adminEmail: string) {
    const idx = this.pegawai.findIndex((p) => p.nip === nip);
    if (idx === -1) throw new Error(`Pegawai NIP ${nip} tidak ditemukan.`);
    
    this.pegawai[idx] = { ...this.pegawai[idx], ...updates };
    this.addAuditLog({
      admin_email: adminEmail,
      aksi: 'Update',
      tabel_terdampak: 'pegawai',
      deskripsi: `Memperbarui biodata pegawai NIP ${nip} (${this.pegawai[idx].nama_lengkap})`,
    });
    this.saveToStorage();
    supabaseService.upsertPegawai(this.pegawai[idx]).catch((err) => {
      console.error('Supabase direct upsert on updatePegawai error:', err);
    });
    return this.pegawai[idx];
  }

  softDeletePegawai(nip: string, adminEmail: string) {
    const p = this.getPegawaiByNip(nip);
    if (!p) throw new Error(`Pegawai NIP ${nip} tidak ditemukan.`);
    p.is_deleted = true;
    this.addAuditLog({
      admin_email: adminEmail,
      aksi: 'Soft Delete',
      tabel_terdampak: 'pegawai',
      deskripsi: `Melakukan soft-delete pegawai ${p.nama_lengkap} (NIP: ${nip})`,
    });
    this.saveToStorage();
    supabaseService.deletePegawaiSoft(nip).catch((err) => {
      console.error('Supabase direct delete on softDeletePegawai error:', err);
    });
    return p;
  }

  deletePegawaiPermanent(nip: string, adminEmail: string) {
    const idx = this.pegawai.findIndex((p) => p.nip === nip);
    if (idx === -1) throw new Error(`Pegawai NIP ${nip} tidak ditemukan.`);
    const deletedName = this.pegawai[idx].nama_lengkap;
    this.pegawai.splice(idx, 1);
    this.addAuditLog({
      admin_email: adminEmail,
      aksi: 'Delete',
      tabel_terdampak: 'pegawai',
      deskripsi: `Menghapus permanen data pegawai: ${deletedName} (NIP: ${nip})`,
    });
    this.saveToStorage();
    supabaseService.deletePegawaiPermanent(nip).catch((err) => {
      console.error('Supabase direct permanent delete error:', err);
    });
    return true;
  }

  restorePegawai(nip: string, adminEmail: string) {
    const p = this.getPegawaiByNip(nip);
    if (!p) throw new Error(`Pegawai NIP ${nip} tidak ditemukan.`);
    p.is_deleted = false;
    this.addAuditLog({
      admin_email: adminEmail,
      aksi: 'Restore',
      tabel_terdampak: 'pegawai',
      deskripsi: `Mengaktifkan kembali pegawai ${p.nama_lengkap} (NIP: ${nip})`,
    });
    this.saveToStorage();
    supabaseService.restorePegawai(nip).catch((err) => {
      console.error('Supabase direct restore error:', err);
    });
    return p;
  }

  // Riwayat SK Operations
  getSkListByNip(nip: string) {
    return this.skHistory
      .filter((s) => s.nip_pegawai === nip)
      .sort((a, b) => new Date(b.tmt_berlaku).getTime() - new Date(a.tmt_berlaku).getTime());
  }

  getAllSk() {
    return this.skHistory;
  }

  addSk(sk: RiwayatSK, adminEmail: string) {
    this.skHistory.unshift(sk);
    const p = this.getPegawaiByNip(sk.nip_pegawai);
    if (p) {
      p.updated_at = new Date().toISOString();
      if (sk.jenis_sk === 'Pangkat') {
        p.tmt_golongan = sk.tmt_berlaku;
        p.tmt_pangkat_terakhir = sk.tmt_berlaku;
        p.no_sk_pangkat = sk.nomor_sk;
        p.tgl_sk_pangkat = sk.tmt_berlaku;
        if ((sk as any).golongan_pangkat) {
          p.golongan_pangkat = (sk as any).golongan_pangkat;
        }
        if ((sk as any).nama_pangkat) {
          p.nama_pangkat = (sk as any).nama_pangkat;
        }
      } else if (sk.jenis_sk === 'KGB') {
        p.tmt_kgb_terakhir = sk.tmt_berlaku;
        p.no_sk_kgb = sk.nomor_sk;
      } else if (sk.jenis_sk === 'UKOM') {
        p.status_ukkj = 'Lulus UKKJ';
        p.status_ukom = true;
        p.no_sertifikat_ukkj = sk.nomor_sk;
        p.tgl_lulus_ukkj = sk.tmt_berlaku;
      } else if (sk.jenis_sk === 'STLUD') {
        p.status_ujian_dinas = 'Lulus STLUD';
        p.no_stlud = sk.nomor_sk;
      } else if (sk.jenis_sk === 'Izin Belajar') {
        p.status_izin_belajar = true;
      } else if (sk.jenis_sk === 'Pencantuman_Gelar') {
        p.status_pencantuman_gelar = 'Terverifikasi BKN';
      }
      supabaseService.upsertPegawai(p).catch((err) => {
        console.error('Supabase direct upsert on addSk (pegawai update) error:', err);
      });
    }
    this.addAuditLog({
      admin_email: adminEmail,
      aksi: 'Upload SK',
      tabel_terdampak: 'riwayat_sk',
      deskripsi: `Menambahkan Berkas Digital ${sk.jenis_sk} (${sk.nomor_sk}) untuk ${p?.nama_lengkap || sk.nip_pegawai}. Dokumen terdahulu tetap diarsipkan.`,
    });
    this.saveToStorage();
    supabaseService.insertSk(sk).catch((err) => {
      console.error('Supabase direct insert on addSk error:', err);
    });
    return sk;
  }

  deleteSk(id: string, adminEmail: string) {
    const idx = this.skHistory.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error('Berkas SK tidak ditemukan.');
    const deletedSk = this.skHistory[idx];
    this.skHistory.splice(idx, 1);
    this.addAuditLog({
      admin_email: adminEmail,
      aksi: 'Delete',
      tabel_terdampak: 'riwayat_sk',
      deskripsi: `Menghapus Berkas Digital ${deletedSk.jenis_sk} (${deletedSk.nomor_sk})`,
    });
    this.saveToStorage();
    supabaseService.deleteSk(id).catch((err) => {
      console.error('Supabase direct delete on deleteSk error:', err);
    });
    return true;
  }

  // Keluarga KP4 Operations
  getKeluargaByNip(nip: string) {
    return this.keluarga.filter((k) => k.nip_pegawai === nip);
  }

  getAllKeluarga() {
    return this.keluarga;
  }

  addKeluarga(k: KeluargaKP4, adminEmail: string) {
    this.keluarga.push(k);
    this.addAuditLog({
      admin_email: adminEmail,
      aksi: 'KP4 Update',
      tabel_terdampak: 'keluarga_kp4',
      deskripsi: `Menambahkan anggota keluarga KP4: ${k.nama_keluarga} (${k.status_hubungan})`,
    });
    this.saveToStorage();
    supabaseService.upsertKeluarga(k).catch((err) => {
      console.error('Supabase direct upsert on addKeluarga error:', err);
    });
    return k;
  }

  updateKeluarga(id: string, updates: Partial<KeluargaKP4>, adminEmail: string) {
    const idx = this.keluarga.findIndex((k) => k.id === id);
    if (idx === -1) throw new Error('Data keluarga KP4 tidak ditemukan.');
    this.keluarga[idx] = { ...this.keluarga[idx], ...updates };
    this.addAuditLog({
      admin_email: adminEmail,
      aksi: 'KP4 Update',
      tabel_terdampak: 'keluarga_kp4',
      deskripsi: `Memperbarui data KP4 a.n ${this.keluarga[idx].nama_keluarga}`,
    });
    this.saveToStorage();
    supabaseService.upsertKeluarga(this.keluarga[idx]).catch((err) => {
      console.error('Supabase direct upsert on updateKeluarga error:', err);
    });
    return this.keluarga[idx];
  }

  deleteKeluarga(id: string, adminEmail: string) {
    const idx = this.keluarga.findIndex((k) => k.id === id);
    if (idx === -1) throw new Error('Data keluarga KP4 tidak ditemukan.');
    const deletedName = this.keluarga[idx].nama_keluarga;
    this.keluarga.splice(idx, 1);
    this.addAuditLog({
      admin_email: adminEmail,
      aksi: 'Delete',
      tabel_terdampak: 'keluarga_kp4',
      deskripsi: `Menghapus anggota keluarga KP4: ${deletedName}`,
    });
    this.saveToStorage();
    supabaseService.deleteKeluarga(id).catch((err) => {
      console.error('Supabase direct delete on deleteKeluarga error:', err);
    });
    return true;
  }

  // Aplikasi Kepegawaian Operations
  getAllAplikasi(): AplikasiKepegawaian[] {
    return [...this.aplikasiList].sort((a, b) => {
      return (a.nama_aplikasi || '').localeCompare(b.nama_aplikasi || '');
    });
  }

  getAplikasiById(id: string): AplikasiKepegawaian | undefined {
    return this.aplikasiList.find((a) => a.id === id);
  }

  addAplikasi(
    data: Omit<AplikasiKepegawaian, 'id' | 'created_at'>,
    adminEmail: string
  ): AplikasiKepegawaian {
    const newApp: AplikasiKepegawaian = {
      id: generateUUID(),
      ...data,
      created_at: new Date().toISOString(),
    };
    this.aplikasiList.push(newApp);
    this.addAuditLog({
      admin_email: adminEmail,
      aksi: 'Create',
      tabel_terdampak: 'aplikasi_kepegawaian',
      deskripsi: `Menambahkan portal aplikasi kepegawaian: ${newApp.nama_aplikasi} (${newApp.kategori})`,
    });
    this.saveToStorage();
    supabaseService.upsertAplikasi(newApp).catch((err) => {
      console.error('Supabase direct upsert on addAplikasi error:', err);
    });
    return newApp;
  }

  updateAplikasi(
    id: string,
    updates: Partial<AplikasiKepegawaian>,
    adminEmail: string
  ): AplikasiKepegawaian {
    const idx = this.aplikasiList.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error('Aplikasi kepegawaian tidak ditemukan.');
    this.aplikasiList[idx] = {
      ...this.aplikasiList[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.addAuditLog({
      admin_email: adminEmail,
      aksi: 'Update',
      tabel_terdampak: 'aplikasi_kepegawaian',
      deskripsi: `Memperbarui info portal aplikasi kepegawaian: ${this.aplikasiList[idx].nama_aplikasi}`,
    });
    this.saveToStorage();
    supabaseService.upsertAplikasi(this.aplikasiList[idx]).catch((err) => {
      console.error('Supabase direct upsert on updateAplikasi error:', err);
    });
    return this.aplikasiList[idx];
  }

  deleteAplikasi(id: string, adminEmail: string): boolean {
    const idx = this.aplikasiList.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error('Aplikasi kepegawaian tidak ditemukan.');
    const deletedName = this.aplikasiList[idx].nama_aplikasi;
    this.aplikasiList.splice(idx, 1);
    this.addAuditLog({
      admin_email: adminEmail,
      aksi: 'Delete',
      tabel_terdampak: 'aplikasi_kepegawaian',
      deskripsi: `Menghapus portal aplikasi kepegawaian: ${deletedName}`,
    });
    this.saveToStorage();
    supabaseService.deleteAplikasi(id).catch((err) => {
      console.error('Supabase direct delete on deleteAplikasi error:', err);
    });
    return true;
  }

  // Audit Logs Operations
  getAuditLogs() {
    return this.auditLogs.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  addAuditLog(log: Omit<AuditLog, 'id' | 'created_at'>) {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ...log,
      created_at: new Date().toISOString(),
    };
    this.auditLogs.unshift(newLog);
    this.saveToStorage();
    supabaseService.insertAuditLog(newLog).catch((err) => {
      console.error('Supabase direct insert on addAuditLog error:', err);
    });
    return newLog;
  }
}

export const dbStore = new DBStore();
