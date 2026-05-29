import { Queue } from 'bullmq';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createQueues(connection: any) {
  return {
    creativeGenerate:    new Queue('creative.generate',     { connection }),
    publishingPublish:   new Queue('publishing.publish',    { connection }),
    trackingIngest:      new Queue('tracking.event-ingest', { connection }),
    analyticsRecompute:  new Queue('analytics.recompute',   { connection }),
    optimizerOoda:       new Queue('optimizer.ooda-loop',   { connection }),
    optimizerAction:     new Queue('optimizer.execute-action', { connection }),
    messagingSend:       new Queue('messaging.send',        { connection }),
    bootstrapWarmup:     new Queue('bootstrap.warm-up',     { connection }),
    integrationsHealth:  new Queue('integrations.health-check', { connection }),
    integrationsRefresh: new Queue('integrations.refresh-tokens', { connection }),
    discoveryHotScore:   new Queue('discovery.recalc-hotscore',  { connection }),
  };
}

export type Queues = ReturnType<typeof createQueues>;
