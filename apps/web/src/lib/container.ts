import { prisma } from './db.js';
import { encryptCredentials, decryptCredentials } from './encryption.js';

// Infrastructure adapters (lazy imports to avoid circular deps in edge)
async function getInfrastructure() {
  const { PrismaIntegrationRepository } = await import('../infrastructure/integrations/PrismaIntegrationRepository.js');
  const { PrismaCreativeRepository } = await import('../infrastructure/creative/PrismaCreativeRepository.js');
  const { PrismaProductRepository } = await import('../infrastructure/discovery/PrismaProductRepository.js');
  const { PrismaAuditLogRepository } = await import('../infrastructure/governance/PrismaAuditLogRepository.js');
  const { ClaudeAiGenerationGateway } = await import('../infrastructure/ai/ClaudeAiGenerationGateway.js');
  const { ComplianceCheckerGatewayImpl } = await import('../infrastructure/compliance/ComplianceCheckerGatewayImpl.js');
  const { MetaOAuthGatewayImpl } = await import('../infrastructure/integrations/MetaOAuthGatewayImpl.js');

  const integrationRepo = new PrismaIntegrationRepository(prisma);
  const creativeRepo = new PrismaCreativeRepository(prisma);
  const productRepo = new PrismaProductRepository(prisma);
  const auditRepo = new PrismaAuditLogRepository(prisma);
  const aiGateway = new ClaudeAiGenerationGateway();
  const complianceGateway = new ComplianceCheckerGatewayImpl(aiGateway);
  const metaOauth = new MetaOAuthGatewayImpl();

  const encryption = {
    encrypt: encryptCredentials,
    decrypt: decryptCredentials,
  };

  const { ConnectMetaIntegrationUseCase } = await import('@nextface/application');
  const { HealthCheckIntegrationsUseCase } = await import('@nextface/application');
  const { GenerateCreativeUseCase } = await import('@nextface/application');

  return {
    connectMeta: new ConnectMetaIntegrationUseCase(integrationRepo, metaOauth, encryption, auditRepo),
    healthCheckIntegrations: new HealthCheckIntegrationsUseCase(integrationRepo, { check: async () => ({ ok: true }) }, encryption, auditRepo),
    generateCreative: new GenerateCreativeUseCase(creativeRepo, productRepo, aiGateway, complianceGateway, auditRepo),
  };
}

let _container: Awaited<ReturnType<typeof getInfrastructure>> | null = null;

export async function getContainer() {
  if (!_container) {
    _container = await getInfrastructure();
  }
  return _container;
}
