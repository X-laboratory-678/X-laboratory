import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import YAML from 'yaml';

const workerPath = resolve('src/index.js');
const editorPath = resolve('public/editor/index.html');
const configPath = resolve('../static/admin/config.yml');
const migrationPath = resolve('migrations/0001_initial.sql');

for (const path of [workerPath]) {
  const result = spawnSync(process.execPath, ['--check', path], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.stdout);
}

const page = readFileSync(editorPath, 'utf8');
const script = page.match(/<script>([\s\S]*?)<\/script>/i)?.[1];
assert.ok(script, 'editor page must include its application script');
new Function(script);

const cms = YAML.parse(readFileSync(configPath, 'utf8'));
assert.equal(cms.backend.repo, 'X-laboratory-678/X-laboratory');
assert.deepEqual(cms.i18n.locales, ['en', 'zh']);
assert.equal(cms.collections.length, 10);
assert.ok(cms.collections.every((collection) => collection.folder.startsWith('content/')));
assert.ok(cms.collections.every((collection) => Array.isArray(collection.fields) && collection.fields.length));

const migration = readFileSync(migrationPath, 'utf8');
const python = [
  'import sqlite3, sys',
  'db = sqlite3.connect(":memory:")',
  'db.executescript(sys.stdin.read())',
  'tables = {row[0] for row in db.execute("SELECT name FROM sqlite_master WHERE type = \'table\'")}',
  'required = {"editor_users", "invitations", "sessions", "oauth_states", "login_attempts", "audit_events", "publish_jobs"}',
  'assert required <= tables, sorted(required - tables)',
  'assert db.execute("SELECT username, active, password_hash FROM editor_users").fetchone() == ("k", 1, None)',
  'print("D1 schema and pending k account are valid")'
].join('\n');
const dbCheck = spawnSync('python', ['-c', python], { input: migration, encoding: 'utf8' });
assert.equal(dbCheck.status, 0, dbCheck.stderr || dbCheck.stdout);

console.log('Worker syntax, editor script, CMS schema, and D1 migration checks passed.');

