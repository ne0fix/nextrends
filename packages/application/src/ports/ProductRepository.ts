import type { Product } from '@nextface/domain';

export interface ProductRepository {
  findById(id: string): Promise<Product | null>;
  findByExternalId(source: string, externalId: string): Promise<Product | null>;
  findTopByNiche(niche: string, limit?: number): Promise<Product[]>;
  findAll(opts?: { cursor?: string; limit?: number }): Promise<Product[]>;
  save(product: Product): Promise<void>;
  update(product: Product): Promise<void>;
}
