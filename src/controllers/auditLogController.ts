import { Request, Response } from 'express';
import { dbStore } from '../services/dbStore';

export function getAuditLogs(req: Request, res: Response) {
  try {
    const logs = dbStore.getAuditLogs();
    return res.json({ success: true, count: logs.length, data: logs });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
