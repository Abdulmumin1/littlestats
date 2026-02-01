// Site types

export interface Site {
  id: string;
  domain: string;
  userId: string;
  name: string | null;
  plan: 'free' | 'pro' | 'enterprise';
  planStatus: 'active' | 'cancelled' | 'expired';
  settings: SiteSettings;
  domainKey: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SiteSettings {
  retentionDays?: number;
  publicDashboard?: boolean;
  allowedDomains?: string[];
  [key: string]: any;
}

// Legacy domain record type for compatibility
export interface DomainRecord {
  name: string;
  [key: string]: any;
}
