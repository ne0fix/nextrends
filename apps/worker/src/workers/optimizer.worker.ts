import { Worker } from 'bullmq';
import type Redis from 'ioredis';
import type { Logger } from 'pino';

type Deps = { runOodaLoop: { execute(input: { orgId: string; campaignId?: string; dryRun?: boolean }): Promise<void> } };

export function startOptimizerWorker(
  connection: Redis,
  logger: Logger,
  getContainer: () => Promise<Deps>,
) {
  const worker = new Worker(
    'optimizer.ooda-loop',
    async (job) => {
      const { orgId, campaignId, dryRun } = job.data as { orgId: string; campaignId?: string; dryRun?: boolean };
      logger.info({ orgId, campaignId, dryRun, jobId: job.id }, 'OODA loop tick');
      const { runOodaLoop } = await getContainer();
      await runOodaLoop.execute({ orgId, campaignId, dryRun });
      logger.info({ orgId, jobId: job.id }, 'OODA loop done');
    },
    { connection, concurrency: 10, limiter: { max: 50, duration: 60_000 } },
  );
  worker.on('failed', (job, err) => logger.error({ jobId: job?.id, err }, 'optimizer.ooda-loop failed'));
  return worker;
}
