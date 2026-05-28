export interface CampaignRepository {
  findActiveByOrg(orgId: string): Promise<Array<{ id: string; ads: Array<{ id: string; creativeId: string }> }>>;
}
