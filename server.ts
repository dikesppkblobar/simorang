import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import routes from './src/routes';
import { errorHandler } from './src/middlewares/errorHandler';
import { dbStore } from './src/services/dbStore';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initial Supabase database hydration
  try {
    await dbStore.fetchAndMergeSupabaseData();
    console.log('[Supabase] Database synchronization loaded successfully.');
  } catch (err) {
    console.warn('[Supabase] Warning during initial sync:', err);
  }

  // Middleware JSON
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Register master API routes
  app.use('/api', routes);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      app: 'SAPA Pegawai Dikes PPKB Lombok Barat',
      time: new Date().toISOString(),
    });
  });

  // Global Error Handler
  app.use(errorHandler);

  // Vite Development / Production Static File Middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SAPA PEGAWAI DIKES LOBAR] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
