export interface AuditLogEntry {
  orgId: string;
  actorType: 'user' | 'ai';
  actorId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  before?: unknown;
  after?: unknown;
  reason?: string;
}

export interface AuditLogRepository {
  append(entry: AuditLogEntry): Promise<void>;
  findByOrg(orgId: string, opts?: { limit?: number; cursor?: string }): Promise<AuditLogEntry[]>;
}
