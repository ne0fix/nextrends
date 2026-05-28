import type { Integration, IntegrationProps } from '@nextface/domain';
import type { Provider } from '@nextface/domain';

export interface IntegrationRepository {
  findById(id: string): Promise<Integration | null>;
  findByOrgAndProvider(orgId: string, provider: Provider): Promise<Integration | null>;
  findAllByOrg(orgId: string): Promise<Integration[]>;
  findExpiringSoon(): Promise<Integration[]>;
  save(integration: Integration, encryptedCredentials: Buffer): Promise<void>;
  updateStatus(id: string, props: Partial<IntegrationProps>): Promise<void>;
  getEncryptedCredentials(id: string): Promise<Buffer | null>;
  delete(id: string): Promise<void>;
}
