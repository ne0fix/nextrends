import { describe, it, expect } from 'vitest';
import { Product } from './Product';

const dossier = {
  targetAudience: 'empreendedores', pains: ['falta de tempo'],
  benefits: ['automatização'], objections: [], triggers: [], proofPoints: [],
};

describe('Product', () => {
  it('create com saturation inválida lança erro', () => {
    expect(() => Product.create({ id: 'p1', source: 'KIWIFY', externalId: 'x1', name: 'Curso', niche: 'marketing', dossier, saturation: 101 })).toThrow();
    expect(() => Product.create({ id: 'p1', source: 'KIWIFY', externalId: 'x1', name: 'Curso', niche: 'marketing', dossier, saturation: -1 })).toThrow();
  });

  it('create retorna produto com hotScore=0 e blocked=false', () => {
    const p = Product.create({ id: 'p1', source: 'KIWIFY', externalId: 'x1', name: 'Curso', niche: 'marketing', dossier, saturation: 50 });
    expect(p.hotScore).toBe(0);
    expect(p.blocked).toBe(false);
    expect(p.id).toBe('p1');
  });

  it('updateHotScore valida range 0–100', () => {
    const p = Product.create({ id: 'p1', source: 'KIWIFY', externalId: 'x1', name: 'Curso', niche: 'marketing', dossier, saturation: 0 });
    expect(() => p.updateHotScore(101)).toThrow();
    const updated = p.updateHotScore(85);
    expect(updated.hotScore).toBe(85);
  });

  it('isSaturated retorna true acima de 80', () => {
    const p = Product.create({ id: 'p1', source: 'KIWIFY', externalId: 'x1', name: 'Curso', niche: 'marketing', dossier, saturation: 81 });
    expect(p.isSaturated()).toBe(true);
    const p2 = Product.create({ id: 'p2', source: 'KIWIFY', externalId: 'x2', name: 'Curso', niche: 'marketing', dossier, saturation: 80 });
    expect(p2.isSaturated()).toBe(false);
  });

  it('block define blocked=true', () => {
    const p = Product.create({ id: 'p1', source: 'KIWIFY', externalId: 'x1', name: 'Curso', niche: 'marketing', dossier, saturation: 0 });
    expect(p.block().blocked).toBe(true);
  });
});
