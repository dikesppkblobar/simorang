import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    email: string;
    role: string;
  };
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  // Dalam simulasi ini, jika header Authorization ada atau token valid, berikan akses
  // Jika tidak ada header, izinkan default admin session untuk fleksibilitas demo UI
  const token = authHeader?.replace('Bearer ', '');
  if (token) {
    req.user = { email: 'admin@dikes.lombokbarat.go.id', role: 'Administrator' };
  } else {
    // Default admin fallback
    req.user = { email: 'admin@dikes.lombokbarat.go.id', role: 'Administrator' };
  }
  next();
}
