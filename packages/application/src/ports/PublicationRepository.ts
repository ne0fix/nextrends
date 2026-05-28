export interface PublicationProps {
  id: string;
  orgId: string;
  creativeId: string;
  channel: string;
  externalId?: string;
  status: string;
  scheduledAt?: Date;
  publishedAt?: Date;
  url?: string;
  metadata: Record<string, unknown>;
}

export interface PublicationRepository {
  save(pub: PublicationProps): Promise<void>;
  findById(id: string): Promise<PublicationProps | null>;
  updateStatus(id: string, status: string, externalId?: string): Promise<void>;
}
