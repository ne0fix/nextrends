export interface OptimizerActionRepository {
  create(action: {
    orgId: string;
    type: string;
    targetType: string;
    targetId: string;
    payloadBefore: unknown;
    payloadAfter: unknown;
    reason: string;
    reversible: boolean;
  }): Promise<string>;
  execute(actionId: string): Promise<void>;
}
