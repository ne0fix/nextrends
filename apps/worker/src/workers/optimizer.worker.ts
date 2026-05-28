import { Worker } from 'bullmq';
import type Redis from 'ioredis';
import type { Logger } from 'pino';

export function startOptimizerWorker(connection: Redis, logger: Logger) {
  const worker = new Worker(
    'optimizer.ooda-loop',
    async (job) => {
      const { orgId, dryRun } = job.data as { orgId: string; dryRun?: boolean };
      logger.info({ orgId, dryRun, jobId: job.id }, 'OODA loop tick');
      // TODO Sprint 3: injetar RunOodaLoopUseCase via container
    },
    {
      connection,
      concurrency: 10,
      limiter: { max: 50, duration: 60_000 },
    },
  );

  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, err }, 'optimizer.ooda-loop job failed');
  });

  return worker;
}
