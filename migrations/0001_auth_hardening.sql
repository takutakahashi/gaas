CREATE TABLE registration_context (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  consumed_at INTEGER,
  created_at INTEGER NOT NULL
);

CREATE TABLE rate_limit_bucket (
  key TEXT PRIMARY KEY NOT NULL,
  window_started_at INTEGER NOT NULL,
  count INTEGER NOT NULL
);

CREATE TABLE audit_log (
  id TEXT PRIMARY KEY NOT NULL,
  actor_user_id TEXT REFERENCES user(id) ON DELETE SET NULL,
  event TEXT NOT NULL,
  target_id TEXT,
  project_id TEXT,
  metadata TEXT,
  created_at INTEGER NOT NULL
);

CREATE INDEX audit_log_actor_created_idx ON audit_log(actor_user_id, created_at);
CREATE INDEX audit_log_project_created_idx ON audit_log(project_id, created_at);
