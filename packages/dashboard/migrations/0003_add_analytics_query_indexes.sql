CREATE INDEX IF NOT EXISTS idx_events_site_time_id
  ON events(site_id, created_at, id);

CREATE INDEX IF NOT EXISTS idx_events_site_type_time
  ON events(site_id, event_type, created_at);

CREATE INDEX IF NOT EXISTS idx_events_site_event_time
  ON events(site_id, event_type, event_name, created_at);

CREATE INDEX IF NOT EXISTS idx_events_site_visit_time
  ON events(site_id, visit_id, created_at);
