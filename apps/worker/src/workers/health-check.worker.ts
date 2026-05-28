import { Worker } from 'bullmq';
import type Redis from 'ioredis';
import type { Logger } from 'pino';

export function startHealthCheckWorker(connection: Redis, logger: Logger) {
  const worker = new Worker(
    'integrations.health-check',
    async (job) => {
      const { orgId } = job.data as { orgId?: string };
      logger.info({ orgId, jobId: job.id }, 'Running integration health check');
      // TODO: inject HealthCheckIntegrationsUseCase
    },
    { connection, concurrency: 20 },
  );

  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, err }, 'health-check job failed');
  });

  return worker;
}
