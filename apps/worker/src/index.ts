import Redis from 'ioredis';
import pino from 'pino';
import { createQueues } from './queues.js';
import { registerSchedulers } from './schedulers.js';
import { startOptimizerWorker } from './workers/optimizer.worker.js';
import { startCreativeWorker } from './workers/creative.worker.js';
import { startHealthCheckWorker } from './workers/health-check.worker.js';

const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  ...(process.env.NODE_ENV === 'development' && {
    transport: { target: 'pino-pretty', options: { colorize: true } },
  }),
});

const REDIS_URL = process.env.REDIS_URL ?? 'redis://localhost:6379';
const connection = new Redis(REDIS_URL, { maxRetriesPerRequest: null });

connection.on('connect', () => logger.info('Redis connected'));
connection.on('error', (err) => logger.error({ err }, 'Redis error'));

const queues = createQueues(connection);
await registerSchedulers(queues, logger);

const workers = [
  startOptimizerWorker(connection, logger),
  startCreativeWorker(connection, logger),
  startHealthCheckWorker(connection, logger),
];

logger.info({ workerCount: workers.length }, 'NextFace Worker started');

async function shutdown() {
  logger.info('Graceful shutdown...');
  await Promise.all(workers.map(w => w.close()));
  await connection.quit();
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
