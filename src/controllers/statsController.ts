import { Request, Response } from 'express';
import { dbStore } from '../services/dbStore';
import {
  calculateKgbAlerts,
  calculatePangkatAlerts,
  calculatePensiunAlerts,
  calculateKp4AnakAlerts,
} from '../services/dateCalculator';

export function getDashboardStats(req: Request, res: Response) {
  try {
    const activePegawai = dbStore.getPegawaiList(false);
    const deletedPegawai = dbStore.getPegawaiList(true).filter((p) => p.is_deleted);
    const skList = dbStore.getAllSk();
    const keluargaList = dbStore.getAllKeluarga();

    const kgbAlerts = calculateKgbAlerts(activePegawai, skList);
    const pangkatAlerts = calculatePangkatAlerts(activePegawai, skList);
    const pensiunAlerts = calculatePensiunAlerts(activePegawai);
    const kp4Alerts = calculateKp4AnakAlerts(activePegawai, keluargaList);

    const kgbNips = new Set(kgbAlerts.map((a) => a.nip));
    const pangkatNips = new Set(pangkatAlerts.map((a) => a.nip));
    const now = new Date();

    const fungsionalJatuhTempoCount = activePegawai.filter((p) => {
      if (p.jenis_jabatan !== 'Fungsional') return false;
      if (kgbNips.has(p.nip) || pangkatNips.has(p.nip)) return true;
      if (p.status_ukkj === 'Belum UKKJ' || p.status_ukkj === 'Dalam Proses' || p.status_ukom === false) {
        return true;
      }
      return false;
    }).length;

    const izinBelajarCount = activePegawai.filter((p) => p.status_izin_belajar).length;

    // Jabatan Distribution
    const jabatanCounts: Record<string, number> = {
      Fungsional: 0,
      Pelaksana: 0,
      Struktural: 0,
    };
    activePegawai.forEach((p) => {
      jabatanCounts[p.jenis_jabatan] = (jabatanCounts[p.jenis_jabatan] || 0) + 1;
    });

    const jabatanDistribution = Object.keys(jabatanCounts).map((key) => ({
      name: key,
      count: jabatanCounts[key],
    }));

    // Unit Kerja Distribution
    const unitCounts: Record<string, number> = {};
    activePegawai.forEach((p) => {
      const u = p.unit_kerja || 'Lainnya';
      unitCounts[u] = (unitCounts[u] || 0) + 1;
    });

    const unitKerjaDistribution = Object.keys(unitCounts).map((key) => ({
      name: key,
      count: unitCounts[key],
    }));


    return res.json({
      success: true,
      data: {
        totalPegawaiAktif: activePegawai.length,
        totalPegawaiNonAktif: deletedPegawai.length,
        pensiunTahunIni: pensiunAlerts.length,
        alertKgbBulanIni: kgbAlerts.length,
        alertPangkatBulanIni: pangkatAlerts.length,
        alertKp4BulanIni: kp4Alerts.length,
        izinBelajarAktif: izinBelajarCount,
        fungsionalJatuhTempo: fungsionalJatuhTempoCount,
        jabatanDistribution,
        unitKerjaDistribution,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export function clearDummyData(req: Request, res: Response) {
  try {
    const adminEmail = (req as any).user?.email || 'admin@dikes.lombokbarat.go.id';
    dbStore.clearAllDummyData(adminEmail);
    return res.json({ success: true, message: 'Seluruh data dummy berhasil dibersihkan dari database.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export function resetSampleData(req: Request, res: Response) {
  try {
    const adminEmail = (req as any).user?.email || 'admin@dikes.lombokbarat.go.id';
    dbStore.resetToSampleData(adminEmail);
    return res.json({ success: true, message: 'Data sampel awal berhasil dimuat kembali ke database.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

