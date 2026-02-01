-- LittleStats Analytics v2.0 - Database Schema
-- Cloudflare D1 (SQLite)
-- This schema implements the new architecture with proper session tracking

-- Enable foreign key support
PRAGMA foreign_keys = ON;

-- ============================================
-- AUTH TABLES (better-auth)
-- ============================================

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  email_verified INTEGER DEFAULT 0,
  name TEXT,
  image TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_id TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  id_token TEXT,
  access_token_expires_at DATETIME,
  refresh_token_expires_at DATETIME,
  scope TEXT,
  password TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, provider_id, account_id)
);

CREATE INDEX IF NOT EXISTS idx_accounts_user ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_provider ON accounts(provider_id, account_id);

CREATE TABLE IF NOT EXISTS sessions_auth (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at DATETIME NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sessions_auth_user ON sessions_auth(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_auth_token ON sessions_auth(token);
CREATE INDEX IF NOT EXISTS idx_sessions_auth_expires ON sessions_auth(expires_at);

CREATE TABLE IF NOT EXISTS verifications (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,
  value TEXT NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(identifier, value)
);

CREATE INDEX IF NOT EXISTS idx_verifications_identifier ON verifications(identifier);

-- ============================================
-- ANALYTICS TABLES
-- ============================================

-- Sites/domains (replaces PocketBase domains collection)
CREATE TABLE IF NOT EXISTS sites (
  id TEXT PRIMARY KEY,                    -- UUID
  domain TEXT UNIQUE NOT NULL,            -- Domain name (e.g., "example.com")
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT,                              -- Display name
  
  -- Plan and limits
  plan TEXT DEFAULT 'free',               -- free, pro, enterprise
  plan_status TEXT DEFAULT 'active',      -- active, cancelled, expired
  
  -- Settings (JSON blob)
  settings TEXT DEFAULT '{}',             -- {retention_days, public_dashboard, etc.}
  
  -- Tracking configuration
  domain_key TEXT UNIQUE,                 -- Public key for tracking script
  
  -- Timestamps
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sites_user ON sites(user_id);
CREATE INDEX IF NOT EXISTS idx_sites_domain ON sites(domain);
CREATE INDEX IF NOT EXISTS idx_sites_domain_key ON sites(domain_key);
CREATE INDEX IF NOT EXISTS idx_sites_plan ON sites(plan);

-- Sessions (visitor sessions - 6 month retention)
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,                    -- Deterministic session UUID
  site_id TEXT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  visitor_id TEXT NOT NULL,               -- Fingerprint or identified ID
  
  -- Visit tracking
  first_visit_at DATETIME NOT NULL,
  last_visit_at DATETIME NOT NULL,
  visit_count INTEGER DEFAULT 1,
  
  -- Device info (first seen)
  browser TEXT,
  browser_version TEXT,
  os TEXT,
  os_version TEXT,
  device TEXT,                            -- desktop, mobile, tablet, unknown
  screen TEXT,                            -- "1920x1080"
  
  -- Geo info (first seen)
  country TEXT,
  country_name TEXT,
  region TEXT,
  city TEXT,
  
  -- Other
  language TEXT,
  timezone TEXT,
  
  -- Engagement totals
  total_pageviews INTEGER DEFAULT 0,
  total_events INTEGER DEFAULT 0,
  total_engagement_time INTEGER DEFAULT 0,  -- Seconds
  
  -- Identification
  identified_user_id TEXT,                -- From identify() call
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Critical indexes for session queries
CREATE INDEX IF NOT EXISTS idx_sessions_site_time ON sessions(site_id, last_visit_at);
CREATE INDEX IF NOT EXISTS idx_sessions_visitor ON sessions(site_id, visitor_id);
CREATE INDEX IF NOT EXISTS idx_sessions_identified ON sessions(site_id, identified_user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_country ON sessions(site_id, country);
CREATE INDEX IF NOT EXISTS idx_sessions_device ON sessions(site_id, device);
CREATE INDEX IF NOT EXISTS idx_sessions_browser ON sessions(site_id, browser);

-- Events (pageviews and custom events - 90 day retention)
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  site_id TEXT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  visit_id TEXT NOT NULL,                 -- Changes every 30 min
  
  -- Event classification
  event_type INTEGER NOT NULL CHECK (event_type IN (1, 2, 3, 4)),
  -- 1 = pageview, 2 = custom_event, 3 = page_exit, 4 = heartbeat
  
  -- URL info
  url_path TEXT NOT NULL,
  url_query TEXT,
  url_hash TEXT,
  referrer_domain TEXT,
  referrer_path TEXT,
  page_title TEXT,
  
  -- For custom events
  event_name TEXT,                        -- NULL for pageviews
  event_data TEXT,                        -- JSON blob for custom event data
  
  -- Device/Environment (denormalized for query performance)
  browser TEXT,
  browser_version TEXT,
  os TEXT,
  os_version TEXT,
  device TEXT,
  screen TEXT,
  
  -- Geo (from CF headers)
  country TEXT,
  region TEXT,
  city TEXT,
  
  -- Other
  language TEXT,
  timezone TEXT,
  
  -- Engagement
  engagement_time INTEGER,                -- Seconds of active time (for page_exit)
  
  -- Timestamps
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Critical indexes for events table (query performance)
CREATE INDEX IF NOT EXISTS idx_events_site_time ON events(site_id, created_at);
CREATE INDEX IF NOT EXISTS idx_events_site_session ON events(site_id, session_id);
CREATE INDEX IF NOT EXISTS idx_events_site_visit ON events(site_id, visit_id);
CREATE INDEX IF NOT EXISTS idx_events_site_type ON events(site_id, event_type);
CREATE INDEX IF NOT EXISTS idx_events_site_event_name ON events(site_id, event_name);
CREATE INDEX IF NOT EXISTS idx_events_url_path ON events(site_id, url_path);
CREATE INDEX IF NOT EXISTS idx_events_referrer ON events(site_id, referrer_domain);
CREATE INDEX IF NOT EXISTS idx_events_country ON events(site_id, country);
CREATE INDEX IF NOT EXISTS idx_events_device ON events(site_id, device);
CREATE INDEX IF NOT EXISTS idx_events_browser ON events(site_id, browser);
CREATE INDEX IF NOT EXISTS idx_events_os ON events(site_id, os);

-- Event properties (typed key-value - 90 day retention)
CREATE TABLE IF NOT EXISTS event_properties (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  site_id TEXT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  
  prop_key TEXT NOT NULL,                 -- Property name
  data_type INTEGER NOT NULL CHECK (data_type IN (1, 2, 3, 4)),
  -- 1 = string, 2 = number, 3 = boolean, 4 = date
  
  -- Typed value columns
  string_value TEXT,
  number_value REAL,
  boolean_value INTEGER CHECK (boolean_value IN (0, 1)),
  date_value DATETIME,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_props_event ON event_properties(event_id);
CREATE INDEX IF NOT EXISTS idx_props_site_key ON event_properties(site_id, prop_key);
CREATE INDEX IF NOT EXISTS idx_props_string ON event_properties(site_id, prop_key, string_value);
CREATE INDEX IF NOT EXISTS idx_props_number ON event_properties(site_id, prop_key, number_value);
CREATE INDEX IF NOT EXISTS idx_props_date ON event_properties(site_id, prop_key, date_value);

-- Hourly stats (pre-aggregated - indefinite retention)
CREATE TABLE IF NOT EXISTS hourly_stats (
  site_id TEXT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  hour DATETIME NOT NULL,                 -- "2025-01-31 14:00:00"
  
  -- Core metrics
  views INTEGER DEFAULT 0,
  visits INTEGER DEFAULT 0,               -- Unique visit_ids
  visitors INTEGER DEFAULT 0,             -- Unique session_ids
  
  -- Engagement
  bounce_count INTEGER DEFAULT 0,
  total_duration INTEGER DEFAULT 0,       -- For avg calculation
  
  -- Event counts
  custom_events INTEGER DEFAULT 0,
  
  PRIMARY KEY (site_id, hour)
);

CREATE INDEX IF NOT EXISTS idx_hourly_site_hour ON hourly_stats(site_id, hour);

-- Daily stats (long-term trends - indefinite retention)
CREATE TABLE IF NOT EXISTS daily_stats (
  site_id TEXT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  views INTEGER DEFAULT 0,
  visits INTEGER DEFAULT 0,
  visitors INTEGER DEFAULT 0,
  bounce_count INTEGER DEFAULT 0,
  total_duration INTEGER DEFAULT 0,
  custom_events INTEGER DEFAULT 0,
  
  PRIMARY KEY (site_id, date)
);

CREATE INDEX IF NOT EXISTS idx_daily_site_date ON daily_stats(site_id, date);

-- Custom event registry (indefinite retention)
CREATE TABLE IF NOT EXISTS custom_event_registry (
  site_id TEXT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  event_name TEXT NOT NULL,
  
  first_seen_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_seen_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  total_count_24h INTEGER DEFAULT 0,
  total_count_7d INTEGER DEFAULT 0,
  total_count_30d INTEGER DEFAULT 0,
  
  PRIMARY KEY (site_id, event_name)
);

CREATE INDEX IF NOT EXISTS idx_registry_site ON custom_event_registry(site_id);

-- Referrer stats (hourly aggregation)
CREATE TABLE IF NOT EXISTS referrer_stats (
  site_id TEXT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  hour DATETIME NOT NULL,
  referrer_domain TEXT NOT NULL,
  views INTEGER DEFAULT 0,
  visits INTEGER DEFAULT 0,
  
  PRIMARY KEY (site_id, hour, referrer_domain)
);

CREATE INDEX IF NOT EXISTS idx_referrer_stats_site ON referrer_stats(site_id, hour);

-- Page stats (hourly aggregation)
CREATE TABLE IF NOT EXISTS page_stats (
  site_id TEXT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  hour DATETIME NOT NULL,
  url_path TEXT NOT NULL,
  views INTEGER DEFAULT 0,
  visits INTEGER DEFAULT 0,
  
  PRIMARY KEY (site_id, hour, url_path)
);

CREATE INDEX IF NOT EXISTS idx_page_stats_site ON page_stats(site_id, hour);

-- Country stats (hourly aggregation)
CREATE TABLE IF NOT EXISTS country_stats (
  site_id TEXT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  hour DATETIME NOT NULL,
  country TEXT NOT NULL,
  views INTEGER DEFAULT 0,
  visits INTEGER DEFAULT 0,
  
  PRIMARY KEY (site_id, hour, country)
);

CREATE INDEX IF NOT EXISTS idx_country_stats_site ON country_stats(site_id, hour);

-- Device stats (hourly aggregation)
CREATE TABLE IF NOT EXISTS device_stats (
  site_id TEXT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  hour DATETIME NOT NULL,
  device TEXT NOT NULL,
  views INTEGER DEFAULT 0,
  visits INTEGER DEFAULT 0,
  
  PRIMARY KEY (site_id, hour, device)
);

CREATE INDEX IF NOT EXISTS idx_device_stats_site ON device_stats(site_id, hour);

-- ============================================
-- SUBSCRIPTION/BILLING TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,                 -- polar, lemonsqueezy, stripe
  provider_subscription_id TEXT NOT NULL,
  
  -- Plan info
  plan_id TEXT NOT NULL,
  plan_name TEXT,
  status TEXT NOT NULL,                   -- active, cancelled, expired, past_due
  
  -- Billing periods
  current_period_start DATETIME,
  current_period_end DATETIME,
  cancel_at_period_end INTEGER DEFAULT 0,
  
  -- Metadata
  metadata TEXT,                          -- JSON blob
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_provider ON subscriptions(provider, provider_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Webhook events log (for debugging and replay)
CREATE TABLE IF NOT EXISTS webhook_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  provider TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload TEXT NOT NULL,                  -- Full webhook payload
  processed INTEGER DEFAULT 0,
  error TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_webhooks_provider ON webhook_events(provider, event_type);
CREATE INDEX IF NOT EXISTS idx_webhooks_processed ON webhook_events(processed);

-- ============================================
-- MIGRATION TRACKING
-- ============================================

CREATE TABLE IF NOT EXISTS migrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- VIEWS (for convenience)
-- ============================================

-- Current hour stats view
CREATE VIEW IF NOT EXISTS v_current_stats AS
SELECT 
  site_id,
  SUM(views) as total_views,
  SUM(visits) as total_visits,
  SUM(visitors) as total_visitors,
  CASE 
    WHEN SUM(visits) > 0 THEN ROUND(SUM(bounce_count) * 100.0 / SUM(visits), 2)
    ELSE 0 
  END as bounce_rate,
  CASE 
    WHEN SUM(visits) > 0 THEN ROUND(SUM(total_duration) * 1.0 / SUM(visits), 0)
    ELSE 0 
  END as avg_duration
FROM hourly_stats
WHERE hour >= datetime('now', '-24 hours')
GROUP BY site_id;

-- Active sessions view (last 5 minutes - for real-time)
CREATE VIEW IF NOT EXISTS v_active_sessions AS
SELECT 
  s.site_id,
  COUNT(*) as active_count
FROM sessions s
WHERE s.last_visit_at >= datetime('now', '-5 minutes')
GROUP BY s.site_id;
