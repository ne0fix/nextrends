import Redis from 'ioredis';
import pino from 'pino';
import { PrismaClient } from '@prisma/client';
import { createQueues } from './queues.js';
import { registerSchedulers } from './schedulers.js';
import { startOptimizerWorker } from './workers/optimizer.worker.js';
import { startCreativeWorker } from './workers/creative.worker.js';
import { startHealthCheckWorker } from './workers/health-check.worker.js';
import { startPublishingWorker } from './workers/publishing.worker.js';
import { startAiServer } from './ai-server.js';

const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  ...(process.env.NODE_ENV === 'development' && {
    transport: { target: 'pino-pretty', options: { colorize: true } },
  }),
});

const REDIS_URL = process.env.REDIS_URL ?? 'redis://localhost:6379';
const WEB_API_URL = process.env.WEB_API_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
const WORKER_SECRET = process.env.WORKER_SECRET ?? '';

const connection = new Redis(REDIS_URL, { maxRetriesPerRequest: null });
const prisma = new PrismaClient();

connection.on('connect', () => logger.info('Redis connected'));
connection.on('error', (err) => logger.error({ err }, 'Redis error'));

async function callWebApi(path: string, body: unknown): Promise<unknown> {
  const res = await fetch(`${WEB_API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-worker-secret': WORKER_SECRET },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${path} failed: ${await res.text()}`);
  return res.json();
}

async function getAllOrgIds(): Promise<string[]> {
  const orgs = await prisma.organization.findMany({ select: { id: true } });
  return orgs.map(o => o.id);
}

async function getContainer() {
  return {
    generateCreative: { execute: (input: unknown) => callWebApi('/api/v1/creatives', input) as Promise<{ creativeId: string }> },
    publishToChannel: { execute: (input: unknown) => callWebApi('/api/v1/publishing/publish', input) as Promise<void> },
    healthCheck: { execute: (orgId: string) => callWebApi('/api/v1/integrations/health-check', { orgId }) as Promise<void> },
    runOodaLoop: { execute: (input: unknown) => callWebApi('/api/v1/optimizer', input) as Promise<void> },
    getAllOrgIds,
  };
}

const AI_SERVER_PORT = Number(process.env.AI_SERVER_PORT ?? 9000);
const aiServer = process.env.ENABLE_AI_SERVER !== 'false'
  ? startAiServer(AI_SERVER_PORT, logger)
  : null;

const queues = createQueues(connection);
await registerSchedulers(queues, logger);

const workers = [
  startOptimizerWorker(connection, logger, getContainer),
  startCreativeWorker(connection, logger, getContainer),
  startHealthCheckWorker(connection, logger, getContainer),
  startPublishingWorker(connection, logger, getContainer),
];

logger.info({ workerCount: workers.length }, 'NextFace Worker started');

async function shutdown() {
  logger.info('Graceful shutdown...');
  await Promise.all(workers.map(w => w.close()));
  aiServer?.close();
  await prisma.$disconnect();
  await connection.quit();
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
