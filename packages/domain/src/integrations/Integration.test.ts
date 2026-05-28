import { describe, it, expect } from 'vitest';
import { Integration } from './Integration';

const base = {
  id: 'int-1', orgId: 'org-1', provider: 'META' as const,
  externalAccountIds: ['acc-1'], scopes: ['public_profile'],
  lastHealthOk: true, createdAt: new Date(),
};

describe('Integration', () => {
  it('create requer orgId', () => {
    expect(() => Integration.create({ ...base, orgId: '' })).toThrow();
  });

  it('markHealthy atualiza status para CONNECTED', () => {
    const i = Integration.reconstitute({ ...base, status: 'DEGRADED' });
    const updated = i.markHealthy(new Date());
    expect(updated.status).toBe('CONNECTED');
    expect(updated.lastHealthOk).toBe(true);
  });

  it('markDegraded atualiza status', () => {
    const i = Integration.reconstitute({ ...base, status: 'CONNECTED' });
    const updated = i.markDegraded(new Date());
    expect(updated.status).toBe('DEGRADED');
    expect(updated.lastHealthOk).toBe(false);
  });

  it('isUsable retorna true para CONNECTED e DEGRADED', () => {
    expect(Integration.reconstitute({ ...base, status: 'CONNECTED' }).isUsable()).toBe(true);
    expect(Integration.reconstitute({ ...base, status: 'DEGRADED' }).isUsable()).toBe(true);
    expect(Integration.reconstitute({ ...base, status: 'REVOKED' }).isUsable()).toBe(false);
    expect(Integration.reconstitute({ ...base, status: 'EXPIRED' }).isUsable()).toBe(false);
  });

  it('markExpired define status EXPIRED', () => {
    const i = Integration.reconstitute({ ...base, status: 'CONNECTED' });
    expect(i.markExpired().status).toBe('EXPIRED');
  });
});
