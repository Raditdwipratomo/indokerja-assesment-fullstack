import express from 'express';
import cors from 'cors';
import authRoutes from './modules/auth/auth.routes';
import jobsRoutes from './modules/jobs/jobs.routes';
import applicationsRoutes from './modules/applications/applications.routes';
import { errorHandler } from './middleware/errorHandler';
import { ApplicationsController } from './modules/applications/applications.controller';
import { auth } from './middleware/auth';
import { authorize } from './middleware/authorize';
import { Role } from '@prisma/client';

export const app = express();

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.options('*', cors());
app.use(express.json());

// Root welcome & health check endpoints
app.get('/', (_req, res) => {
  res.json({ message: 'IndoKerja API is running successfully', docs: '/api/health' });
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/health/db', async (_req, res) => {
  try {
    const { prisma } = await import('./utils/prisma');
    const hasUrl = !!process.env.DATABASE_URL;
    const urlHost = hasUrl && process.env.DATABASE_URL?.includes('@') 
      ? process.env.DATABASE_URL.split('@')[1].split('/')[0] 
      : 'unparsed';
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected', host: urlHost });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      database: 'failed',
      message: error?.message || 'Database connection error',
      hasDbUrl: !!process.env.DATABASE_URL,
    });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/applications', applicationsRoutes);

// View applicants for a specific job (Company only)
app.get('/api/jobs/:jobId/applications', auth, authorize(Role.COMPANY), ApplicationsController.getJobApplicants);

// Global error handler
app.use(errorHandler);

export default app;

