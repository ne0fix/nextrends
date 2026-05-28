import { Worker } from 'bullmq';
import type Redis from 'ioredis';
import type { Logger } from 'pino';

type Deps = { publishToChannel: { execute(input: unknown): Promise<unknown> } };

export function startPublishingWorker(
  connection: Redis,
  logger: Logger,
  getContainer: () => Promise<Deps>,
) {
  const worker = new Worker(
    'publishing.publish',
    async (job) => {
      const { orgId, creativeId, channel, actorId, scheduledAt } = job.data as Record<string, string>;
      logger.info({ orgId, creativeId, channel, jobId: job.id }, 'publishing.publish started');
      const { publishToChannel } = await getContainer();
      const result = await publishToChannel.execute({
        orgId, actorId: actorId ?? 'worker', creativeId, channel,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      });
      logger.info({ orgId, creativeId, jobId: job.id }, 'publishing.publish done');
      return result;
    },
    { connection, concurrency: 3 },
  );
  worker.on('failed', (job, err) => logger.error({ jobId: job?.id, err }, 'publishing.publish failed'));
  return worker;
}
