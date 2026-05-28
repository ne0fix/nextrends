export interface DomainEvent {
  readonly eventId: string;
  readonly occurredAt: Date;
  readonly eventName: string;
}

export function createDomainEvent<T extends Record<string, unknown>>(
  eventName: string,
  payload: T,
): DomainEvent & T {
  return {
    eventId: crypto.randomUUID(),
    occurredAt: new Date(),
    eventName,
    ...payload,
  };
}
