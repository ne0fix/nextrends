import { Worker } from 'bullmq';
import type Redis from 'ioredis';
import type { Logger } from 'pino';

type Deps = { generateCreative: { execute(input: unknown): Promise<{ creativeId: string }> } };

export function startCreativeWorker(
  connection: Redis,
  logger: Logger,
  getContainer: () => Promise<Deps>,
) {
  const worker = new Worker(
    'creative.generate',
    async (job) => {
      const { orgId, productId, format, framework, hookType, angle, channel, parentId, actorId } =
        job.data as Record<string, string>;
      logger.info({ orgId, productId, jobId: job.id }, 'creative.generate started');
      const { generateCreative } = await getContainer();
      const result = await generateCreative.execute({
        orgId, actorId: actorId ?? 'worker', productId,
        format: format ?? 'COPY', framework: framework ?? 'AIDA',
        hookType: hookType ?? 'COGNITIVE_DISSONANCE',
        angle: angle ?? 'transformation', channel: channel ?? 'META_FEED', parentId,
      });
      logger.info({ orgId, creativeId: result.creativeId, jobId: job.id }, 'creative.generate done');
      return result;
    },
    { connection, concurrency: 5 },
  );
  worker.on('failed', (job, err) => logger.error({ jobId: job?.id, err }, 'creative.generate failed'));
  return worker;
}
