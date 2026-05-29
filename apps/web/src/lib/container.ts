import { prisma } from './db';
import { encryptCredentials, decryptCredentials } from './encryption';

async function getInfrastructure() {
  const { PrismaIntegrationRepository } = await import('../infrastructure/integrations/PrismaIntegrationRepository');
  const { PrismaCreativeRepository } = await import('../infrastructure/creative/PrismaCreativeRepository');
  const { PrismaProductRepository } = await import('../infrastructure/discovery/PrismaProductRepository');
  const { PrismaAuditLogRepository } = await import('../infrastructure/governance/PrismaAuditLogRepository');
  const { PrismaPublicationRepository } = await import('../infrastructure/publishing/PrismaPublicationRepository');
  const { ClaudeAiGenerationGateway } = await import('../infrastructure/ai/ClaudeAiGenerationGateway');
  const { ClaudeWorkerProxyGateway } = await import('../infrastructure/ai/ClaudeWorkerProxyGateway');
  const { ComplianceCheckerGatewayImpl } = await import('../infrastructure/compliance/ComplianceCheckerGatewayImpl');
  const { MetaOAuthGatewayImpl } = await import('../infrastructure/integrations/MetaOAuthGatewayImpl');
  const { MetaPublishingGatewayImpl } = await import('../infrastructure/publishing/MetaPublishingGatewayImpl');
  const { PrismaMetricsRepository } = await import('../infrastructure/optimizer/PrismaMetricsRepository');
  const { PrismaOptimizerActionRepository } = await import('../infrastructure/optimizer/PrismaOptimizerActionRepository');
  const { PrismaCampaignRepository } = await import('../infrastructure/campaigns/PrismaCampaignRepository');
  const { PrismaChannelRepository } = await import('../infrastructure/channels/PrismaChannelRepository');
  const { PrismaLaunchRepository } = await import('../infrastructure/channels/PrismaLaunchRepository');
  const { PrismaMessagingFlowRepository } = await import('../infrastructure/messaging/PrismaMessagingFlowRepository');
  const { WhatsAppCloudGateway } = await import('../infrastructure/messaging/WhatsAppCloudGateway');

  const integrationRepo = new PrismaIntegrationRepository(prisma);
  const creativeRepo = new PrismaCreativeRepository(prisma);
  const productRepo = new PrismaProductRepository(prisma);
  const auditRepo = new PrismaAuditLogRepository(prisma);
  const publicationRepo = new PrismaPublicationRepository(prisma);
  const { env } = await import('./env');
  const aiGateway = env.WORKER_AI_URL
    ? new ClaudeWorkerProxyGateway(env.WORKER_AI_URL)
    : new ClaudeAiGenerationGateway();
  const complianceGateway = new ComplianceCheckerGatewayImpl(aiGateway);
  const metaOauth = new MetaOAuthGatewayImpl();
  const publishingGateway = new MetaPublishingGatewayImpl();
  const metricsRepo = new PrismaMetricsRepository(prisma);
  const optimizerActionRepo = new PrismaOptimizerActionRepository(prisma);
  const campaignRepo = new PrismaCampaignRepository(prisma);
  const channelRepo = new PrismaChannelRepository(prisma);
  const launchRepo = new PrismaLaunchRepository(prisma);
  const flowRepo = new PrismaMessagingFlowRepository(prisma);
  const whatsappGateway = new WhatsAppCloudGateway();

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
    CreateChannelUseCase,
    ScheduleEditorialUseCase,
    CreateFlowUseCase,
    SendWhatsAppMessageUseCase,
    InitiateLaunchUseCase,
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
    runOodaLoop: new RunOodaLoopUseCase(campaignRepo, metricsRepo, optimizerActionRepo, auditRepo, aiGateway),
    createChannel: new CreateChannelUseCase(channelRepo, auditRepo),
    scheduleEditorial: new ScheduleEditorialUseCase(
      { create: async (item) => { await prisma.editorialItem.create({ data: { id: item.id, channelId: item.channelId, creativeId: item.creativeId, scheduledAt: item.scheduledAt, status: item.status as never, caption: item.caption, hashtags: item.hashtags } }); return item; }, findByChannel: async (channelId, opts) => { const rows = await prisma.editorialItem.findMany({ where: { channelId, ...(opts?.from && { scheduledAt: { gte: opts.from } }) }, take: opts?.limit ?? 50, orderBy: { scheduledAt: 'asc' } }); return rows.map(r => ({ id: r.id, channelId: r.channelId, creativeId: r.creativeId ?? undefined, scheduledAt: r.scheduledAt, status: r.status, caption: r.caption ?? undefined, hashtags: r.hashtags })); }, updateStatus: async (id, status) => { await prisma.editorialItem.update({ where: { id }, data: { status: status as never } }); } },
      auditRepo,
    ),
    createFlow: new CreateFlowUseCase(flowRepo, auditRepo),
    sendWhatsApp: new SendWhatsAppMessageUseCase(integrationRepo, whatsappGateway, encryption, auditRepo),
    initiateLaunch: new InitiateLaunchUseCase(launchRepo, productRepo, auditRepo),
  };
}

let _container: Awaited<ReturnType<typeof getInfrastructure>> | null = null;

export async function getContainer() {
  if (!_container) {
    _container = await getInfrastructure();
  }
  return _container;
}
