// Ports
export type { MetricsRepository, AdMetricsResult } from './ports/MetricsRepository';
export type { OptimizerActionRepository } from './ports/OptimizerActionRepository';
export type { CampaignRepository } from './ports/CampaignRepository';
export type { IntegrationRepository } from './ports/IntegrationRepository';
export type { CreativeRepository } from './ports/CreativeRepository';
export type { ProductRepository } from './ports/ProductRepository';
export type { PublicationRepository, PublicationProps } from './ports/PublicationRepository';
export type { AiGenerationGateway, GenerateCreativeParams } from './ports/AiGenerationGateway';
export type { ComplianceCheckerGateway, ComplianceResult } from './ports/ComplianceCheckerGateway';
export type { PublishingGateway } from './ports/PublishingGateway';
export type { AuditLogRepository, AuditLogEntry } from './ports/AuditLogRepository';

// Use Cases — Integrations
export { ConnectMetaIntegrationUseCase } from './use-cases/integrations/ConnectMetaIntegrationUseCase';
export type { ConnectMetaInput, ConnectMetaOutput, MetaOAuthGateway, EncryptionService as MetaEncryptionService } from './use-cases/integrations/ConnectMetaIntegrationUseCase';
export { HealthCheckIntegrationsUseCase } from './use-cases/integrations/HealthCheckIntegrationsUseCase';

// Use Cases — Discovery
export { IndexProductUseCase } from './use-cases/discovery/IndexProductUseCase';
export type { IndexProductInput, IndexProductOutput } from './use-cases/discovery/IndexProductUseCase';
export { ComputeHotScoreUseCase } from './use-cases/discovery/ComputeHotScoreUseCase';
export type { ComputeHotScoreInput, ComputeHotScoreOutput } from './use-cases/discovery/ComputeHotScoreUseCase';

// Use Cases — Creative
export { GenerateCreativeUseCase } from './use-cases/creative/GenerateCreativeUseCase';
export { MutateCreativeUseCase } from './use-cases/creative/MutateCreativeUseCase';
export type { MutateCreativeInput, MutateCreativeOutput } from './use-cases/creative/MutateCreativeUseCase';
export { ApproveCreativeUseCase } from './use-cases/creative/ApproveCreativeUseCase';
export type { ApproveCreativeInput, ApproveCreativeOutput } from './use-cases/creative/ApproveCreativeUseCase';

// Use Cases — Publishing
export { PublishToChannelUseCase } from './use-cases/publishing/PublishToChannelUseCase';
export type { PublishToChannelInput, PublishToChannelOutput } from './use-cases/publishing/PublishToChannelUseCase';

// Use Cases — Channels
export { CreateChannelUseCase } from './use-cases/channels/CreateChannelUseCase';
export type { CreateChannelInput, ChannelRepository, ChannelData } from './use-cases/channels/CreateChannelUseCase';
export { ScheduleEditorialUseCase } from './use-cases/channels/ScheduleEditorialUseCase';
export type { ScheduleEditorialInput, EditorialRepository, EditorialItemData } from './use-cases/channels/ScheduleEditorialUseCase';

// Use Cases — Messaging
export { CreateFlowUseCase } from './use-cases/messaging/CreateFlowUseCase';
export type { CreateFlowInput, MessagingFlowRepository, FlowData, FlowStep } from './use-cases/messaging/CreateFlowUseCase';
export { SendWhatsAppMessageUseCase } from './use-cases/messaging/SendWhatsAppMessageUseCase';
export type { SendWhatsAppInput, WhatsAppGateway } from './use-cases/messaging/SendWhatsAppMessageUseCase';

// Use Cases — Launch
export { InitiateLaunchUseCase } from './use-cases/launch/InitiateLaunchUseCase';
export type { InitiateLaunchInput, InitiateLaunchOutput, LaunchRepository, LaunchData } from './use-cases/launch/InitiateLaunchUseCase';

// Use Cases — Optimizer
export { RunOodaLoopUseCase } from './use-cases/optimizer/RunOodaLoopUseCase';
