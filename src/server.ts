import app from './app';
import env from './config/env';
import logger from './utils/logger';
import prisma from './config/database';

const PORT = parseInt(env.PORT);

const server = app.listen(PORT, () => {
  logger.info(`
  ╔════════════════════════════════════════════════════════════╗
  ║                                                            ║
  ║   🚀 MediaFlow CRM API Server                              ║
  ║                                                            ║
  ║   Environment: ${env.NODE_ENV.padEnd(42)}  ║
  ║   Port:        ${PORT.toString().padEnd(42)}  ║
  ║   URL:         http://localhost:${PORT.toString().padEnd(32)}  ║
  ║                                                            ║
  ║   📚 API Docs:  http://localhost:${PORT}/api/docs${' '.repeat(14)}  ║
  ║   ❤️  Health:    http://localhost:${PORT}/api/health${' '.repeat(11)}  ║
  ║                                                            ║
  ╚════════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  // Stop accepting new connections
  server.close(async () => {
    logger.info('HTTP server closed');

    // Close database connection
    await prisma.$disconnect();
    logger.info('Database connection closed');

    logger.info('Graceful shutdown completed');
    process.exit(0);
  });

  // Force shutdown after 30 seconds
  setTimeout(() => {
    logger.error('Forcing shutdown after timeout');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any) => {
  logger.error('Unhandled Rejection:', reason);
  gracefulShutdown('unhandledRejection');
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

export default server;
