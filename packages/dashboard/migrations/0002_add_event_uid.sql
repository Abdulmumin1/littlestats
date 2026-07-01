-- Give buffered events a stable identity so retries and overlapping flushes
-- cannot insert the same analytics event more than once.
ALTER TABLE events ADD COLUMN event_uid TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_events_uid
  ON events(site_id, event_uid)
  WHERE event_uid IS NOT NULL;
