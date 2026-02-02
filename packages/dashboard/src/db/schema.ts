// Drizzle schema for Better Auth
// Cloudflare D1 (SQLite) compatible

import { sqliteTable, text, integer, unique, primaryKey } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).default(false),
  name: text("name"),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" }).defaultNow(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).defaultNow(),
});

export const sessions = sqliteTable("sessions_auth", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: integer("created_at", { mode: "timestamp" }).defaultNow(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).defaultNow(),
});

export const accounts = sqliteTable("accounts", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp" }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp" }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).defaultNow(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).defaultNow(),
}, (table) => ({
  uniqueProviderAccount: unique().on(table.userId, table.providerId, table.accountId),
}));

export const verifications = sqliteTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).defaultNow(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).defaultNow(),
}, (table) => ({
  uniqueIdentifierValue: unique().on(table.identifier, table.value),
}));

export const sites = sqliteTable("sites", {
  id: text("id").primaryKey(),
  domain: text("domain").notNull(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name"),
  plan: text("plan").default("free"),
  planStatus: text("plan_status").default("active"),
  settings: text("settings").default("{}"),
  domainKey: text("domain_key"),
  
  // Domain Verification
  verificationToken: text("verification_token"), // e.g. "ls-verify-123abc456"
  verifiedAt: integer("verified_at", { mode: "timestamp" }),
  
  createdAt: integer("created_at", { mode: "timestamp" }).defaultNow(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).defaultNow(),
}, (table) => ({
  // Removed unique constraint on domain to allow multiple unverified claims
  uniqueDomainKey: unique().on(table.domainKey),
}));

 export const analyticsSessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  siteId: text("site_id").notNull().references(() => sites.id, { onDelete: "cascade" }),
  visitorId: text("visitor_id").notNull(),
  firstVisitAt: text("first_visit_at").notNull(),
  lastVisitAt: text("last_visit_at").notNull(),
  visitCount: integer("visit_count").default(1),
  browser: text("browser"),
  browserVersion: text("browser_version"),
  os: text("os"),
  osVersion: text("os_version"),
  device: text("device"),
  screen: text("screen"),
  country: text("country"),
  countryName: text("country_name"),
  region: text("region"),
  city: text("city"),
  language: text("language"),
  timezone: text("timezone"),
  totalPageviews: integer("total_pageviews").default(0),
  totalEvents: integer("total_events").default(0),
  totalEngagementTime: integer("total_engagement_time").default(0),
  identifiedUserId: text("identified_user_id"),
  createdAt: integer("created_at", { mode: "timestamp" }).defaultNow(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).defaultNow(),
 });

export const funnels = sqliteTable("funnels", {
  id: text("id").primaryKey(),
  siteId: text("site_id").notNull(),
  name: text("name").notNull(),
  type: text("type").default("session"), // 'session' or 'user'
  steps: text("steps").notNull(), // JSON array of steps
  createdAt: integer("created_at", { mode: "timestamp" }).defaultNow(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).defaultNow(),
});

// Analytics events table
export const events = sqliteTable("events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  siteId: text("site_id").notNull().references(() => sites.id, { onDelete: "cascade" }),
  sessionId: text("session_id").notNull().references(() => analyticsSessions.id, { onDelete: "cascade" }),
  visitId: text("visit_id").notNull(),
  eventType: integer("event_type").notNull(),
  urlPath: text("url_path").notNull(),
  urlQuery: text("url_query"),
  urlHash: text("url_hash"),
  referrerDomain: text("referrer_domain"),
  referrerPath: text("referrer_path"),
  pageTitle: text("page_title"),
  eventName: text("event_name"),
  eventData: text("event_data"),
  browser: text("browser"),
  browserVersion: text("browser_version"),
  os: text("os"),
  osVersion: text("os_version"),
  device: text("device"),
  screen: text("screen"),
  country: text("country"),
  region: text("region"),
  city: text("city"),
  language: text("language"),
  timezone: text("timezone"),
  engagementTime: integer("engagement_time"),
  campaignBucket: text("campaign_bucket"),
  createdAt: text("created_at"),
});

// Hourly aggregated stats
export const hourlyStats = sqliteTable("hourly_stats", {
  siteId: text("site_id").notNull().references(() => sites.id, { onDelete: "cascade" }),
  hour: text("hour").notNull(),
  views: integer("views").default(0),
  visits: integer("visits").default(0),
  visitors: integer("visitors").default(0),
  bounceCount: integer("bounce_count").default(0),
  totalDuration: integer("total_duration").default(0),
  customEvents: integer("custom_events").default(0),
}, (table) => ({
  pk: primaryKey({ columns: [table.siteId, table.hour] }),
}));

// Custom event registry for goal dropdowns
export const customEventRegistry = sqliteTable("custom_event_registry", {
  siteId: text("site_id").notNull().references(() => sites.id, { onDelete: "cascade" }),
  eventName: text("event_name").notNull(),
  firstSeenAt: text("first_seen_at"),
  lastSeenAt: text("last_seen_at"),
  totalCount24h: integer("total_count_24h").default(0),
  totalCount7d: integer("total_count_7d").default(0),
  totalCount30d: integer("total_count_30d").default(0),
}, (table) => ({
  pk: primaryKey({ columns: [table.siteId, table.eventName] }),
}));

// Feedback table for customer feedback
export const feedbacks = sqliteTable("feedbacks", {
  id: text("id").primaryKey(),
  siteId: text("site_id").notNull().references(() => sites.id, { onDelete: "cascade" }),
  visitorId: text("visitor_id"), // Links to analytics visitor
  sessionId: text("session_id"), // Links to analytics session
  content: text("content").notNull(), // Feedback message
  rating: integer("rating"), // 1-5 star rating
  category: text("category"), // bug, feature, general, etc.
  email: text("email"), // Optional contact email
  url: text("url"), // Page URL where feedback was submitted
  browser: text("browser"), // Browser info
  os: text("os"), // OS info
  device: text("device"), // Device type
  screen: text("screen"), // Screen resolution
  country: text("country"), // Country code
  status: text("status").default("new"), // new, reviewed, resolved, archived
  metadata: text("metadata"), // JSON string for additional data
  createdAt: integer("created_at", { mode: "timestamp" }).defaultNow(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).defaultNow(),
});

// Subscriptions table for Dodo Payments and other providers
export const subscriptions = sqliteTable("subscriptions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(), // 'dodo', 'polar', 'lemonsqueezy', 'stripe'
  providerSubscriptionId: text("provider_subscription_id").notNull(),
  providerCustomerId: text("provider_customer_id"), // Dodo customer ID for portal
  planId: text("plan_id"),
  planName: text("plan_name"),
  status: text("status").notNull().default("active"), // 'active', 'cancelled', 'expired', 'past_due'
  currentPeriodStart: integer("current_period_start", { mode: "timestamp" }),
  currentPeriodEnd: integer("current_period_end", { mode: "timestamp" }),
  cancelAtPeriodEnd: integer("cancel_at_period_end", { mode: "boolean" }).default(false),
  metadata: text("metadata"), // JSON string
  createdAt: integer("created_at", { mode: "timestamp" }).defaultNow(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).defaultNow(),
});
