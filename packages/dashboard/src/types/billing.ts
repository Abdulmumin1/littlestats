// Billing and subscription types

export interface Subscription {
  id: string;
  userId: string;
  provider: 'polar' | 'lemonsqueezy' | 'stripe' | 'dodo';
  providerSubscriptionId: string;
  planId: string;
  planName: string;
  status: 'active' | 'cancelled' | 'expired' | 'past_due';
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Dodo Payments specific types
export interface DodoCheckoutRequest {
  productId: string;
  quantity?: number;
  email: string;
  name?: string;
  userId: string;
  metadata?: Record<string, any>;
}

export interface DodoCheckoutResponse {
  checkoutUrl: string;
  sessionId: string;
}

export interface DodoWebhookEvent {
  id: string;
  type: string;
  data: {
    id: string;
    customer_id?: string;
    subscription_id?: string;
    status?: string;
    metadata?: Record<string, any>;
    [key: string]: any;
  };
}

export interface WebhookEvent {
  id: number;
  provider: string;
  eventType: string;
  payload: string;
  processed: boolean;
  error: string | null;
  createdAt: Date;
}

export interface FunnelStep {
  type: 'url' | 'event';
  value: string;
  name?: string;
}

export interface FunnelAnalysis {
  siteId: string;
  steps: FunnelStep[];
  timeWindow: string;
  results: Array<{
    step: number;
    stepName: string;
    visitors: number;
    dropOff: number;
    conversionRate: number;
  }>;
  totalConversionRate: number;
}

// Legacy funnel data types for compatibility
export interface FunnelData {
  type: 'user' | 'session';
  funnel: FunnelStep[];
}

export interface LemonSqueezyWebhookData {
  id: string;
  type: string;
  data: {
    id: string;
    attributes: {
      status: string;
      variant_id: number;
      recurring_interval: string;
      renews_at: string;
      metadata?: {
        userId?: string;
      };
      [key: string]: any;
    };
  };
}
