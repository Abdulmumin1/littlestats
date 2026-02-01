// Environment types

export interface Env {
  // D1 Database
  DB: D1Database;

  // Durable Objects
  ANALYTICS_DO: DurableObjectNamespace;

  // Environment variables
  APP_NAME: string;
  APP_URL: string;
  ANALYTICS_DOMAIN: string;

  // Better Auth configuration
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;

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
  DODO_PAYMENTS_ENV?: 'test' | 'live';
  DODO_WEBHOOK_SECRET?: string;

  // Environment
  ENVIRONMENT?: 'development' | 'production';
}
