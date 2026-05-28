import { NotFoundError } from '@nextface/domain';
import type { ProductRepository } from '../../ports/ProductRepository';
import type { AuditLogRepository } from '../../ports/AuditLogRepository';

export interface LaunchRepository {
  create(launch: LaunchData): Promise<LaunchData>;
  findById(id: string): Promise<LaunchData | null>;
  findByOrg(orgId: string): Promise<LaunchData[]>;
  updateStatus(id: string, status: string): Promise<void>;
  updateMetrics(id: string, metrics: Record<string, unknown>): Promise<void>;
}

export interface LaunchData {
  id: string;
  orgId: string;
  productId: string;
  templateKey: string;
  startsAt: Date;
  cartOpenAt: Date;
  cartCloseAt: Date;
  budgetCap: number;
  status: string;
  metrics: Record<string, unknown>;
}

const TEMPLATES = {
  express_7: { prepareDays: 2, warmupDays: 2, cartDays: 3 },
  standard_14: { prepareDays: 4, warmupDays: 5, cartDays: 5 },
  long_21: { prepareDays: 7, warmupDays: 7, cartDays: 7 },
};

export interface InitiateLaunchInput {
  orgId: string;
  actorId: string;
  productId: string;
  templateKey: 'express_7' | 'standard_14' | 'long_21';
  startsAt: Date;
  budgetCap: number;
}

export interface InitiateLaunchOutput {
  launchId: string;
  startsAt: Date;
  cartOpenAt: Date;
  cartCloseAt: Date;
}

export class InitiateLaunchUseCase {
  constructor(
    private readonly launches: LaunchRepository,
    private readonly products: ProductRepository,
    private readonly audit: AuditLogRepository,
  ) {}

  async execute(input: InitiateLaunchInput): Promise<InitiateLaunchOutput> {
    const product = await this.products.findById(input.productId);
    if (!product) throw new NotFoundError('Product', input.productId);

    const template = TEMPLATES[input.templateKey];
    if (!template) throw new Error(`Unknown template: ${input.templateKey}`);

    const DAY = 24 * 60 * 60 * 1000;
    const cartOpenAt = new Date(input.startsAt.getTime() + (template.prepareDays + template.warmupDays) * DAY);
    const cartCloseAt = new Date(cartOpenAt.getTime() + template.cartDays * DAY);

    const id = crypto.randomUUID();
    await this.launches.create({
      id,
      orgId: input.orgId,
      productId: input.productId,
      templateKey: input.templateKey,
      startsAt: input.startsAt,
      cartOpenAt,
      cartCloseAt,
      budgetCap: input.budgetCap,
      status: 'PLANNED',
      metrics: {},
    });

    await this.audit.append({
      orgId: input.orgId,
      actorType: 'user',
      actorId: input.actorId,
      action: 'launch.initiated',
      resourceType: 'Launch',
      resourceId: id,
      after: { productId: input.productId, templateKey: input.templateKey, startsAt: input.startsAt },
    });

    return { launchId: id, startsAt: input.startsAt, cartOpenAt, cartCloseAt };
  }
}
