import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import pinoHttp from 'pino-http';
import { env } from './config/environment.js';
import { connectDB } from './utils/db.js';
import { logger } from './utils/logger.js';
import { initFirebaseAdmin } from './utils/firebase.js';
import { authRouter } from './routes/auth.js';
import { predictionsRouter } from './routes/predictions.js';
import { studentsRouter } from './routes/students.js';

const app = express();

initFirebaseAdmin();

app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_ORIGIN,
    credentials: true,
  }),
);
app.use(express.json());
app.use(pinoHttp({ logger }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRouter);
app.use('/api/predictions', predictionsRouter);
app.use('/api/students', studentsRouter);

const start = async () => {
  try {
    await connectDB();
    app.listen(env.PORT, () => {
      logger.info(`🚀 API ready on port ${env.PORT}`);
    });
  } catch (error) {
    logger.error({ error }, 'Failed to start API');
    process.exit(1);
  }
};

start();

process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down gracefully');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down gracefully');
  process.exit(0);
});
