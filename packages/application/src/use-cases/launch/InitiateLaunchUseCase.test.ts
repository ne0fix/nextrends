import { describe, it, expect, vi } from 'vitest';
import { InitiateLaunchUseCase } from './InitiateLaunchUseCase';
import { Product } from '@nextface/domain';

const dossier = { targetAudience: 'A', pains: [], benefits: [], objections: [], triggers: [], proofPoints: [] };
const product = Product.create({ id: 'prod-1', source: 'KIWIFY', externalId: 'x1', name: 'Curso', niche: 'mkt', dossier, saturation: 0 });

const mockLaunchRepo = { create: vi.fn().mockImplementation(async (l) => l), findById: vi.fn(), findByOrg: vi.fn().mockResolvedValue([]), updateStatus: vi.fn(), updateMetrics: vi.fn() };
const mockProductRepo = { findById: vi.fn().mockResolvedValue(product), findAll: vi.fn().mockResolvedValue([]), findTopByNiche: vi.fn().mockResolvedValue([]), findByExternalId: vi.fn().mockResolvedValue(null), save: vi.fn(), update: vi.fn() };
const mockAudit = { append: vi.fn(), findByOrg: vi.fn().mockResolvedValue([]) };

describe('InitiateLaunchUseCase', () => {
  it('cria launch com datas corretas para template express_7', async () => {
    const uc = new InitiateLaunchUseCase(mockLaunchRepo, mockProductRepo, mockAudit);
    const startsAt = new Date('2026-06-01');
    const result = await uc.execute({ orgId: 'org-1', actorId: 'user-1', productId: 'prod-1', templateKey: 'express_7', startsAt, budgetCap: 1000 });

    expect(result.launchId).toBeTruthy();
    const cartOpenDays = (result.cartOpenAt.getTime() - startsAt.getTime()) / (24 * 60 * 60 * 1000);
    expect(cartOpenDays).toBe(4); // 2 prepare + 2 warmup
    const cartDuration = (result.cartCloseAt.getTime() - result.cartOpenAt.getTime()) / (24 * 60 * 60 * 1000);
    expect(cartDuration).toBe(3);
  });

  it('cria launch com template standard_14 (14 dias total)', async () => {
    const uc = new InitiateLaunchUseCase(mockLaunchRepo, mockProductRepo, mockAudit);
    const startsAt = new Date('2026-06-01');
    const result = await uc.execute({ orgId: 'org-1', actorId: 'user-1', productId: 'prod-1', templateKey: 'standard_14', startsAt, budgetCap: 5000 });
    const totalDays = (result.cartCloseAt.getTime() - startsAt.getTime()) / (24 * 60 * 60 * 1000);
    expect(totalDays).toBe(14);
  });

  it('lança NotFoundError para produto inexistente', async () => {
    const repo = { ...mockProductRepo, findById: vi.fn().mockResolvedValue(null) };
    const uc = new InitiateLaunchUseCase(mockLaunchRepo, repo, mockAudit);
    await expect(uc.execute({ orgId: 'org-1', actorId: 'u1', productId: 'x', templateKey: 'express_7', startsAt: new Date(), budgetCap: 0 })).rejects.toThrow('NOT_FOUND');
  });

  it('lança erro para template inválido', async () => {
    const uc = new InitiateLaunchUseCase(mockLaunchRepo, mockProductRepo, mockAudit);
    await expect(uc.execute({ orgId: 'org-1', actorId: 'u1', productId: 'prod-1', templateKey: 'invalid_30' as never, startsAt: new Date(), budgetCap: 0 })).rejects.toThrow('Unknown template');
  });
});
