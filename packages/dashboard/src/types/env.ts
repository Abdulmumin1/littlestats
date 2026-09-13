// Environment types

interface PipelineBinding {
  send(records: Record<string, unknown>[]): Promise<void>;
}

export interface Env {
  // D1 Database
  DB: D1Database;

  // Email Routing
  SEND_EMAIL?: {
    send(message: unknown): Promise<void>;
  };

  // Durable Objects
  ANALYTICS_DO: DurableObjectNamespace;

  // Cloudflare Data Platform analytics plane
  ANALYTICS_STREAM?: PipelineBinding;
  ANALYTICS_WRITE_MODE?: "d1" | "dual" | "pipeline";
  ANALYTICS_READ_MODE?: "d1" | "shadow" | "r2";
  CLOUDFLARE_ACCOUNT_ID?: string;
  R2_ANALYTICS_BUCKET?: string;
  R2_ANALYTICS_NAMESPACE?: string;
  R2_ANALYTICS_TABLE?: string;
  R2_SQL_API_TOKEN?: string;
  MIGRATION_ADMIN_TOKEN?: string;

  // Environment variables
  APP_NAME: string;
  APP_URL: string;
  ANALYTICS_DOMAIN: string;

  // Better Auth configuration
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  TRUSTED_ORIGINS?: string; // Comma-separated list of trusted origins
  COOKIE_DOMAIN?: string; // Optional cookie domain

  // OAuth credentials
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;

  // Legacy bindings for compatibility
  CH_HOST?: string;
  CH_USER?: string;
  CH_PASSWORD?: string;
  EVENTS?: D1Database;
  PB_PROD_URL?: string;
  PB_PROD_ADMIN?: string;
  PB_PROD_PASSWORD?: string;

  // Dodo Payments configuration
  DODO_PAYMENTS_API_KEY: string;
  DODO_PAYMENTS_ENV?: "test" | "live";
  DODO_WEBHOOK_SECRET?: string;

  // Environment
  ENVIRONMENT?: "development" | "production";
}
