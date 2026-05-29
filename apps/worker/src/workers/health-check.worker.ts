import { Worker } from 'bullmq';

import type { Logger } from 'pino';

type Deps = {
  healthCheck: { execute(orgId: string): Promise<void> };
  getAllOrgIds(): Promise<string[]>;
};

export function startHealthCheckWorker(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  connection: any,
  logger: Logger,
  getContainer: () => Promise<Deps>,
) {
  const worker = new Worker(
    'integrations.health-check',
    async (job) => {
      const { orgId } = job.data as { orgId?: string };
      const { healthCheck, getAllOrgIds } = await getContainer();
      const orgIds = orgId ? [orgId] : await getAllOrgIds();
      logger.info({ orgIds: orgIds.length, jobId: job.id }, 'health-check started');
      await Promise.allSettled(orgIds.map(id => healthCheck.execute(id)));
      logger.info({ jobId: job.id }, 'health-check done');
    },
    { connection, concurrency: 10 },
  );
  worker.on('failed', (job, err) => logger.error({ jobId: job?.id, err }, 'health-check failed'));
  return worker;
}
