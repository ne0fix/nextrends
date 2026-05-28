import { prisma } from './db';
import { encryptCredentials, decryptCredentials } from './encryption';

async function getInfrastructure() {
  const { PrismaIntegrationRepository } = await import('../infrastructure/integrations/PrismaIntegrationRepository');
  const { PrismaCreativeRepository } = await import('../infrastructure/creative/PrismaCreativeRepository');
  const { PrismaProductRepository } = await import('../infrastructure/discovery/PrismaProductRepository');
  const { PrismaAuditLogRepository } = await import('../infrastructure/governance/PrismaAuditLogRepository');
  const { PrismaPublicationRepository } = await import('../infrastructure/publishing/PrismaPublicationRepository');
  const { ClaudeAiGenerationGateway } = await import('../infrastructure/ai/ClaudeAiGenerationGateway');
  const { ComplianceCheckerGatewayImpl } = await import('../infrastructure/compliance/ComplianceCheckerGatewayImpl');
  const { MetaOAuthGatewayImpl } = await import('../infrastructure/integrations/MetaOAuthGatewayImpl');
  const { MetaPublishingGatewayImpl } = await import('../infrastructure/publishing/MetaPublishingGatewayImpl');
  const { PrismaMetricsRepository } = await import('../infrastructure/optimizer/PrismaMetricsRepository');
  const { PrismaOptimizerActionRepository } = await import('../infrastructure/optimizer/PrismaOptimizerActionRepository');
  const { PrismaCampaignRepository } = await import('../infrastructure/campaigns/PrismaCampaignRepository');

  const integrationRepo = new PrismaIntegrationRepository(prisma);
  const creativeRepo = new PrismaCreativeRepository(prisma);
  const productRepo = new PrismaProductRepository(prisma);
  const auditRepo = new PrismaAuditLogRepository(prisma);
  const publicationRepo = new PrismaPublicationRepository(prisma);
  const aiGateway = new ClaudeAiGenerationGateway();
  const complianceGateway = new ComplianceCheckerGatewayImpl(aiGateway);
  const metaOauth = new MetaOAuthGatewayImpl();
  const publishingGateway = new MetaPublishingGatewayImpl();
  const metricsRepo = new PrismaMetricsRepository(prisma);
  const optimizerActionRepo = new PrismaOptimizerActionRepository(prisma);
  const campaignRepo = new PrismaCampaignRepository(prisma);

  const encryption = {
    encrypt: encryptCredentials,
    decrypt: decryptCredentials,
  };

  const {
    ConnectMetaIntegrationUseCase,
    HealthCheckIntegrationsUseCase,
    GenerateCreativeUseCase,
    MutateCreativeUseCase,
    ApproveCreativeUseCase,
    IndexProductUseCase,
    ComputeHotScoreUseCase,
    PublishToChannelUseCase,
    RunOodaLoopUseCase,
  } = await import('@nextface/application');

  return {
    connectMeta: new ConnectMetaIntegrationUseCase(integrationRepo, metaOauth, encryption, auditRepo),
    healthCheckIntegrations: new HealthCheckIntegrationsUseCase(
      integrationRepo,
      { check: async () => ({ ok: true }) },
      encryption,
      auditRepo,
    ),
    generateCreative: new GenerateCreativeUseCase(creativeRepo, productRepo, aiGateway, complianceGateway, auditRepo),
    mutateCreative: new MutateCreativeUseCase(creativeRepo, aiGateway, complianceGateway, auditRepo),
    approveCreative: new ApproveCreativeUseCase(creativeRepo, auditRepo),
    indexProduct: new IndexProductUseCase(productRepo, aiGateway, auditRepo),
    computeHotScore: new ComputeHotScoreUseCase(productRepo, aiGateway),
    publishToChannel: new PublishToChannelUseCase(
      creativeRepo,
      integrationRepo,
      publishingGateway,
      publicationRepo,
      encryption,
      auditRepo,
    ),
    runOodaLoop: new RunOodaLoopUseCase(campaignRepo, metricsRepo, optimizerActionRepo, auditRepo),
  };
}

let _container: Awaited<ReturnType<typeof getInfrastructure>> | null = null;

export async function getContainer() {
  if (!_container) {
    _container = await getInfrastructure();
  }
  return _container;
}
