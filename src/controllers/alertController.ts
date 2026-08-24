import { Request, Response } from 'express';
import { dbStore } from '../services/dbStore';
import {
  calculateKgbAlerts,
  calculatePangkatAlerts,
  calculatePensiunAlerts,
  calculateKp4AnakAlerts,
} from '../services/dateCalculator';

export function getKgbAlerts(req: Request, res: Response) {
  try {
    const pegawaiList = dbStore.getPegawaiList(false);
    const skList = dbStore.getAllSk();
    const alerts = calculateKgbAlerts(pegawaiList, skList);
    return res.json({ success: true, count: alerts.length, data: alerts });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export function getPangkatAlerts(req: Request, res: Response) {
  try {
    const pegawaiList = dbStore.getPegawaiList(false);
    const skList = dbStore.getAllSk();
    const alerts = calculatePangkatAlerts(pegawaiList, skList);
    return res.json({ success: true, count: alerts.length, data: alerts });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export function getPensiunAlerts(req: Request, res: Response) {
  try {
    const pegawaiList = dbStore.getPegawaiList(false);
    const alerts = calculatePensiunAlerts(pegawaiList);
    return res.json({ success: true, count: alerts.length, data: alerts });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export function getKp4AnakAlerts(req: Request, res: Response) {
  try {
    const pegawaiList = dbStore.getPegawaiList(false);
    const keluargaList = dbStore.getAllKeluarga();
    const alerts = calculateKp4AnakAlerts(pegawaiList, keluargaList);
    return res.json({ success: true, count: alerts.length, data: alerts });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export function getAlertSummary(req: Request, res: Response) {
  try {
    const pegawaiList = dbStore.getPegawaiList(false);
    const skList = dbStore.getAllSk();
    const keluargaList = dbStore.getAllKeluarga();

    const kgb = calculateKgbAlerts(pegawaiList, skList);
    const pangkat = calculatePangkatAlerts(pegawaiList, skList);
    const pensiun = calculatePensiunAlerts(pegawaiList);
    const kp4 = calculateKp4AnakAlerts(pegawaiList, keluargaList);

    return res.json({
      success: true,
      summary: {
        totalKgbAlerts: kgb.length,
        totalPangkatAlerts: pangkat.length,
        totalPensiunAlerts: pensiun.length,
        totalKp4AnakAlerts: kp4.length,
        grandTotalAlerts: kgb.length + pangkat.length + pensiun.length + kp4.length,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
