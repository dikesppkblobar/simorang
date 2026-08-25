import { Request, Response } from 'express';
import { supabaseService } from '../services/supabaseService';
import { dbStore } from '../services/dbStore';
import { SUPABASE_SCHEMA_SQL } from '../supabaseSchema';

export async function getSupabaseStatus(req: Request, res: Response) {
  try {
    const health = await supabaseService.checkConnection();
    return res.json({
      success: true,
      url: 'https://pjofydlrdyxttogrxaju.supabase.co',
      health,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function syncSupabaseNow(req: Request, res: Response) {
  try {
    // First attempt to merge data from Supabase into memory
    await dbStore.fetchAndMergeSupabaseData();

    // Then push local data to Supabase
    const syncRes = await supabaseService.syncBulkToSupabase({
      pegawai: dbStore.getPegawaiList(true),
      skHistory: dbStore.getAllSk(),
      keluarga: dbStore.getAllKeluarga(),
      auditLogs: dbStore.getAuditLogs(),
      units: dbStore.getAllUnits(),
      users: dbStore.getAllUsers(),
      aplikasi: dbStore.getAllAplikasi(),
    });

    return res.json({
      success: true,
      message: 'Sinkronisasi dengan Database Supabase Berhasil!',
      details: syncRes.details,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export function getSupabaseSchemaSql(req: Request, res: Response) {
  return res.json({ success: true, sql: SUPABASE_SCHEMA_SQL });
}
