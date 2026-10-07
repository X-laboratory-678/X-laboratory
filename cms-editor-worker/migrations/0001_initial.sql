CREATE TABLE IF NOT EXISTS editor_users (
  username TEXT PRIMARY KEY,
  password_salt TEXT,
  password_hash TEXT,
  password_iterations INTEGER NOT NULL DEFAULT 310000,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS invitations (
  token_hash TEXT PRIMARY KEY,
  username TEXT NOT NULL REFERENCES editor_users(username),
  purpose TEXT NOT NULL CHECK (purpose IN ('setup', 'reset')),
  expires_at INTEGER NOT NULL,
  consumed_at INTEGER,
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS invitations_user_idx ON invitations(username, expires_at);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  kind TEXT NOT NULL CHECK (kind IN ('editor', 'admin')),
  username TEXT NOT NULL,
  csrf_token TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS sessions_expiry_idx ON sessions(expires_at);

CREATE TABLE IF NOT EXISTS oauth_states (
  state_hash TEXT PRIMARY KEY,
  expires_at INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS login_attempts (
  bucket_key TEXT PRIMARY KEY,
  attempts INTEGER NOT NULL,
  window_started_at INTEGER NOT NULL,
  blocked_until INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS audit_events (
  id TEXT PRIMARY KEY,
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  subject TEXT,
  detail TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS audit_events_created_idx ON audit_events(created_at);

CREATE TABLE IF NOT EXISTS publish_jobs (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  collection TEXT NOT NULL,
  entry_id TEXT NOT NULL,
  branch_name TEXT NOT NULL UNIQUE,
  pull_number INTEGER,
  head_sha TEXT,
  merge_sha TEXT,
  state TEXT NOT NULL,
  message TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS publish_jobs_sha_idx ON publish_jobs(head_sha);
CREATE INDEX IF NOT EXISTS publish_jobs_merge_sha_idx ON publish_jobs(merge_sha);
CREATE INDEX IF NOT EXISTS publish_jobs_user_idx ON publish_jobs(username, created_at);

INSERT OR IGNORE INTO editor_users (username, active) VALUES ('k', 1);
