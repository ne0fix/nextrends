export interface AdMetricsResult {
  ctr: number;
  roas: number;
  frequency: number;
  spend: number;
  conversions: number;
  retention3s?: number;
  sends?: number;
}

export interface MetricsRepository {
  getAdMetrics(orgId: string, adId: string, days: number): Promise<AdMetricsResult>;
}
