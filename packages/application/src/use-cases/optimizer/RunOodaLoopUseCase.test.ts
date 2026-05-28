import { describe, it, expect, vi } from 'vitest';
import { RunOodaLoopUseCase } from './RunOodaLoopUseCase';
import type { MetricsRepository, CampaignRepository, OptimizerActionRepository } from '../../ports';

const mockCampaigns: CampaignRepository = {
  findActiveByOrg: vi.fn().mockResolvedValue([
    { id: 'camp-1', ads: [{ id: 'ad-1', creativeId: 'c-1' }, { id: 'ad-2', creativeId: 'c-2' }] },
  ]),
};

const mockActions: OptimizerActionRepository = {
  create: vi.fn().mockResolvedValue('action-1'),
  execute: vi.fn(),
};

const mockAudit = { append: vi.fn(), findByOrg: vi.fn().mockResolvedValue([]) };

describe('RunOodaLoopUseCase', () => {
  it('não gera ações quando métricas são boas', async () => {
    const metrics: MetricsRepository = {
      getAdMetrics: vi.fn().mockResolvedValue({ ctr: 2.0, roas: 3.0, frequency: 2.0, spend: 100, conversions: 10 }),
    };
    const uc = new RunOodaLoopUseCase(mockCampaigns, metrics, mockActions, mockAudit);
    const result = await uc.execute({ orgId: 'org-1' });
    expect(result.actionsGenerated).toBe(0);
    expect(mockActions.create).not.toHaveBeenCalled();
  });

  it('gera KILL quando CTR baixo e gasto alto', async () => {
    const actions = { create: vi.fn().mockResolvedValue('a1'), execute: vi.fn() };
    const metrics: MetricsRepository = {
      getAdMetrics: vi.fn().mockResolvedValue({ ctr: 0.3, roas: 0.5, frequency: 2.0, spend: 100, conversions: 1 }),
    };
    const uc = new RunOodaLoopUseCase(mockCampaigns, metrics, actions, mockAudit);
    const result = await uc.execute({ orgId: 'org-1' });
    expect(result.actionsGenerated).toBeGreaterThan(0);
    expect(actions.create).toHaveBeenCalledWith(expect.objectContaining({ type: 'KILL' }));
    expect(actions.execute).toHaveBeenCalled();
  });

  it('gera SCALE quando métricas excelentes', async () => {
    const actions = { create: vi.fn().mockResolvedValue('a1'), execute: vi.fn() };
    const metrics: MetricsRepository = {
      getAdMetrics: vi.fn().mockResolvedValue({ ctr: 2.0, roas: 3.5, frequency: 2.0, spend: 100, conversions: 20 }),
    };
    const uc = new RunOodaLoopUseCase(mockCampaigns, metrics, actions, mockAudit);
    const result = await uc.execute({ orgId: 'org-1' });
    expect(result.actionsGenerated).toBeGreaterThan(0);
    expect(actions.create).toHaveBeenCalledWith(expect.objectContaining({ type: 'SCALE' }));
  });

  it('dryRun não executa ações', async () => {
    const actions = { create: vi.fn().mockResolvedValue('a1'), execute: vi.fn() };
    const metrics: MetricsRepository = {
      getAdMetrics: vi.fn().mockResolvedValue({ ctr: 0.3, roas: 0.5, frequency: 2.0, spend: 100, conversions: 1 }),
    };
    const uc = new RunOodaLoopUseCase(mockCampaigns, metrics, actions, mockAudit);
    await uc.execute({ orgId: 'org-1', dryRun: true });
    expect(actions.create).toHaveBeenCalled();
    expect(actions.execute).not.toHaveBeenCalled();
  });
});
