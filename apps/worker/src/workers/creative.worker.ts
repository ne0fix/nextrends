import { Worker } from 'bullmq';
import type Redis from 'ioredis';
import type { Logger } from 'pino';

export function startCreativeWorker(connection: Redis, logger: Logger) {
  const worker = new Worker(
    'creative.generate',
    async (job) => {
      const { orgId, creativeId } = job.data as { orgId: string; creativeId: string };
      logger.info({ orgId, creativeId, jobId: job.id }, 'Generating creative assets');
      // TODO Sprint 1: inject GenerateCreativeUseCase
    },
    {
      connection,
      concurrency: 5,
    },
  );

  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, err }, 'creative.generate job failed');
  });

  return worker;
}
