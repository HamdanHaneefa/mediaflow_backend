import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';
import { errorHandler, notFound } from './middleware/error.middleware';
import { apiLimiter } from './middleware/rateLimit.middleware';
import env from './config/env';
import logger from './utils/logger';

// Import routes
import authRoutes from './routes/auth.routes';
import healthRoutes from './routes/health.routes';
import contactsRoutes from './routes/contacts.routes';
import projectsRoutes from './routes/projects.routes';
import tasksRoutes from './routes/tasks.routes';
import teamRoutes from './routes/team.routes';
import uploadRoutes from './routes/upload.routes';
import docsRoutes from './routes/docs.routes';
import accountingRoutes from './routes/accounting.routes';
import proposalsRoutes from './routes/proposals.routes';
import analyticsRoutes from './routes/analytics.routes';
import reportsRoutes from './routes/reports.routes';
import exportsRoutes from './routes/exports.routes';
// Client Portal routes
import clientAuthRoutes from './routes/client-auth.routes';
import clientPortalRoutes from './routes/client-portal.routes';
import clientNotificationsRoutes from './routes/client-notifications.routes';
import clientMessagingRoutes from './routes/client-messaging.routes';
import clientDocumentsRoutes from './routes/client-documents.routes';

const app: Application = express();

// Trust proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: env.CORS_ORIGIN.split(',').map((origin) => origin.trim()),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message: string) => logger.info(message.trim()),
    },
  }));
}

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API routes
app.use('/api/health', healthRoutes);
app.use('/api/docs', docsRoutes);
app.use('/api/auth', apiLimiter, authRoutes);
app.use('/api/contacts', contactsRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/accounting', accountingRoutes);
app.use('/api/proposals', proposalsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/exports', exportsRoutes);
// Client Portal routes
app.use('/api/client/auth', apiLimiter, clientAuthRoutes);
app.use('/api/client/portal', clientPortalRoutes);
app.use('/api/client/notifications', clientNotificationsRoutes);
app.use('/api/client/messaging', clientMessagingRoutes);
app.use('/api/client/documents', clientDocumentsRoutes);

// Root route
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'MediaFlow CRM API',
    version: '1.0.0',
    status: 'running',
    environment: env.NODE_ENV,
    documentation: '/api/docs',
  });
});

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

export default app;
