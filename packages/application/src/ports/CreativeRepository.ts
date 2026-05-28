import type { Creative } from '@nextface/domain';

export interface CreativeRepository {
  findById(id: string): Promise<Creative | null>;
  findByOrg(orgId: string, opts?: { status?: string; limit?: number; cursor?: string }): Promise<Creative[]>;
  findLineage(parentId: string): Promise<Creative[]>;
  save(creative: Creative): Promise<void>;
  update(creative: Creative): Promise<void>;
}
