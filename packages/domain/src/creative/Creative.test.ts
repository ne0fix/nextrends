import { describe, it, expect } from 'vitest';
import { Creative } from './Creative';

const base = {
  id: 'c1', orgId: 'org-1', productId: 'prod-1', version: '1.0',
  format: 'COPY' as const, framework: 'AIDA' as const,
  hookType: 'QUESTION' as const, angle: 'transformation',
  assets: { copies: { primary: 'Texto', headline: 'Título', cta: 'Compre' } },
  seed: 'seed-1', metadata: {},
};

describe('Creative', () => {
  it('create requer orgId', () => {
    expect(() => Creative.create({ ...base, orgId: '' })).toThrow();
  });

  it('create requer productId', () => {
    expect(() => Creative.create({ ...base, productId: '' })).toThrow();
  });

  it('create requer angle não vazio', () => {
    expect(() => Creative.create({ ...base, angle: '  ' })).toThrow();
  });

  it('status inicial é DRAFT', () => {
    const c = Creative.create(base);
    expect(c.status).toBe('DRAFT');
  });

  it('approve falha se não PENDING_REVIEW', () => {
    const c = Creative.create(base);
    expect(() => c.approve()).toThrow();
  });

  it('withRiskScore valida 0–100', () => {
    const c = Creative.create(base);
    expect(() => c.withRiskScore(101)).toThrow();
    expect(c.withRiskScore(50).riskScore).toBe(50);
  });

  it('isHighRisk retorna true acima de 70', () => {
    const c = Creative.create(base).withRiskScore(75);
    expect(c.isHighRisk()).toBe(true);
    expect(Creative.create(base).withRiskScore(70).isHighRisk()).toBe(false);
  });
});
