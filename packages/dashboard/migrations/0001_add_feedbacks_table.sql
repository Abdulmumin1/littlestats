-- Migration: Add feedbacks table for customer feedback system
-- Links feedback to analytics visitors/sessions for context

CREATE TABLE IF NOT EXISTS feedbacks (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  visitor_id TEXT,
  session_id TEXT,
  content TEXT NOT NULL,
  rating INTEGER,
  category TEXT,
  email TEXT,
  url TEXT,
  browser TEXT,
  os TEXT,
  device TEXT,
  screen TEXT,
  country TEXT,
  status TEXT DEFAULT 'new',
  metadata TEXT,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

-- Index for efficient querying by site
CREATE INDEX IF NOT EXISTS idx_feedbacks_site_id ON feedbacks(site_id);

-- Index for filtering by status
CREATE INDEX IF NOT EXISTS idx_feedbacks_status ON feedbacks(site_id, status);

-- Index for linking to analytics
CREATE INDEX IF NOT EXISTS idx_feedbacks_visitor ON feedbacks(site_id, visitor_id);
