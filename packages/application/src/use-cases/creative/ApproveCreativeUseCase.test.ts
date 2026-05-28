import { describe, it, expect, vi } from 'vitest';
import { ApproveCreativeUseCase } from './ApproveCreativeUseCase';
import { Creative } from '@nextface/domain';

const base = {
  id: 'c1', orgId: 'org-1', productId: 'prod-1', version: '1.0',
  format: 'COPY' as const, framework: 'AIDA' as const,
  hookType: 'QUESTION' as const, angle: 'transformation',
  assets: { copies: { primary: 'Texto', headline: 'Título', cta: 'Compre' } },
  seed: 'seed-1', metadata: {}, status: 'PENDING_REVIEW' as const, createdAt: new Date(),
};

const pendingCreative = Creative.reconstitute(base);

function makeCreativeRepo(creative: Creative | null = pendingCreative) {
  return {
    findById: vi.fn().mockResolvedValue(creative),
    findByOrg: vi.fn().mockResolvedValue([]),
    findLineage: vi.fn().mockResolvedValue([]),
    save: vi.fn(),
    update: vi.fn(),
  };
}

const mockAudit = { append: vi.fn(), findByOrg: vi.fn().mockResolvedValue([]) };

describe('ApproveCreativeUseCase', () => {
  it('aprova criativo PENDING_REVIEW com status APPROVED', async () => {
    const repo = makeCreativeRepo();
    const uc = new ApproveCreativeUseCase(repo, mockAudit);
    const result = await uc.execute({ orgId: 'org-1', actorId: 'user-1', creativeId: 'c1', approved: true });
    expect(result.status).toBe('APPROVED');
    expect(repo.update).toHaveBeenCalled();
  });

  it('rejeita criativo com status REJECTED', async () => {
    const repo = makeCreativeRepo();
    const uc = new ApproveCreativeUseCase(repo, mockAudit);
    const result = await uc.execute({ orgId: 'org-1', actorId: 'user-1', creativeId: 'c1', approved: false });
    expect(result.status).toBe('REJECTED');
  });

  it('lança NotFoundError se criativo não existe', async () => {
    const uc = new ApproveCreativeUseCase(makeCreativeRepo(null), mockAudit);
    await expect(uc.execute({ orgId: 'org-1', actorId: 'u1', creativeId: 'x', approved: true })).rejects.toThrow('NOT_FOUND');
  });

  it('lança ForbiddenError se orgId diferente', async () => {
    const uc = new ApproveCreativeUseCase(makeCreativeRepo(), mockAudit);
    await expect(uc.execute({ orgId: 'org-ERRADA', actorId: 'u1', creativeId: 'c1', approved: true })).rejects.toThrow('FORBIDDEN');
  });
});
