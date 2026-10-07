CREATE TABLE IF NOT EXISTS cms_workspaces (
  id TEXT PRIMARY KEY,
  branch_name TEXT NOT NULL UNIQUE,
  base_sha TEXT NOT NULL,
  head_sha TEXT NOT NULL,
  state TEXT NOT NULL CHECK (state IN ('creating', 'saving', 'draft', 'publishing', 'published', 'failed')),
  created_by TEXT NOT NULL,
  updated_by TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS cms_workspaces_active_idx ON cms_workspaces(state)
  WHERE state IN ('creating', 'saving', 'draft', 'publishing');
CREATE INDEX IF NOT EXISTS cms_workspaces_updated_idx ON cms_workspaces(updated_at);

CREATE TABLE IF NOT EXISTS cms_draft_items (
  collection TEXT NOT NULL,
  entry_id TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('content', 'settings', 'trash')),
  updated_by TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (collection, entry_id)
);

CREATE TABLE IF NOT EXISTS cms_trash_items (
  id TEXT PRIMARY KEY,
  collection TEXT NOT NULL,
  entry_id TEXT NOT NULL,
  workspace_id TEXT NOT NULL,
  files_json TEXT NOT NULL,
  state TEXT NOT NULL CHECK (state IN ('draft_delete', 'active', 'draft_restore', 'restored', 'purge_pending', 'purged')),
  deleted_by TEXT NOT NULL,
  restored_by TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  restored_at TEXT
);
CREATE INDEX IF NOT EXISTS cms_trash_state_idx ON cms_trash_items(state, created_at);
