CREATE TABLE IF NOT EXISTS analytics_deletion_jobs (
  id TEXT PRIMARY KEY NOT NULL,
  site_id TEXT NOT NULL,
  requested_by TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  requested_at INTEGER NOT NULL,
  completed_at INTEGER,
  error TEXT
);

CREATE INDEX IF NOT EXISTS idx_analytics_deletion_jobs_status_requested
  ON analytics_deletion_jobs(status, requested_at);
