import type { Queues } from './queues.js';
import type { Logger } from 'pino';

export async function registerSchedulers(queues: Queues, logger: Logger) {
  // OODA loop — every 15 min
  await queues.optimizerOoda.upsertJobScheduler('ooda-global', { every: 15 * 60 * 1000 }, {
    name: 'ooda-global-tick',
    data: { scope: 'all' },
  });

  // Integration health check — every 6h
  await queues.integrationsHealth.upsertJobScheduler('health-check-all', { every: 6 * 60 * 60 * 1000 }, {
    name: 'health-check-all',
    data: { scope: 'all' },
  });

  // Discovery hot score — every 6h
  await queues.discoveryHotScore.upsertJobScheduler('hotscore-recalc', { every: 6 * 60 * 60 * 1000 }, {
    name: 'hotscore-recalc',
    data: {},
  });

  // Token refresh — every 1h
  await queues.integrationsRefresh.upsertJobScheduler('token-refresh', { every: 60 * 60 * 1000 }, {
    name: 'token-refresh',
    data: {},
  });

  logger.info('Schedulers registered');
}
