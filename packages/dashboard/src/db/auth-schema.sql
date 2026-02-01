-- Better Auth Tables for Drizzle ORM
-- Cloudflare D1 (SQLite) Schema

-- Users table
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

-- Sessions table (renamed to sessions_auth to avoid conflict with analytics sessions)
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

-- Accounts table (for OAuth providers)
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

-- Verifications table (for email verification, password reset, etc.)
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
