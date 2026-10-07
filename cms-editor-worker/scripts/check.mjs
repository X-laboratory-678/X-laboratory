import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import YAML from 'yaml';
import { onRequest as previewMiddleware } from '../../functions/_middleware.js';

const workerPath = resolve('src/index.js');
const editorPath = resolve('public/editor/index.html');
const configPath = resolve('../static/admin/config.yml');
const migrationPaths = ['migrations/0001_initial.sql', 'migrations/0002_visual_cms.sql'].map((path) => resolve(path));

for (const path of [workerPath]) {
  const result = spawnSync(process.execPath, ['--check', path], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.stdout);
}

const page = readFileSync(editorPath, 'utf8');
const script = page.match(/<script>([\s\S]*?)<\/script>/i)?.[1];
assert.ok(script, 'editor page must include its application script');
new Function(script);
const bridgePath = resolve('public/editor/visual-bridge.js');
const bridge = readFileSync(bridgePath, 'utf8');
assert.equal(spawnSync(process.execPath, ['--check', bridgePath], { encoding: 'utf8' }).status, 0, 'visual bridge must parse');
assert.ok(bridge.includes("parent.postMessage"), 'visual bridge must send editor selection messages');

const cms = YAML.parse(readFileSync(configPath, 'utf8'));
assert.equal(cms.backend.repo, 'X-laboratory-678/X-laboratory');
assert.deepEqual(cms.i18n.locales, ['en', 'zh']);
assert.equal(cms.collections.length, 10);
assert.ok(cms.collections.every((collection) => collection.folder.startsWith('content/')));
assert.ok(cms.collections.every((collection) => Array.isArray(collection.fields) && collection.fields.length));

const migration = migrationPaths.map((path) => readFileSync(path, 'utf8')).join('\n');
const python = [
  'import sqlite3, sys',
  'db = sqlite3.connect(":memory:")',
  'db.executescript(sys.stdin.read())',
  'tables = {row[0] for row in db.execute("SELECT name FROM sqlite_master WHERE type = \'table\'")}',
  'required = {"editor_users", "invitations", "sessions", "oauth_states", "login_attempts", "audit_events", "publish_jobs", "cms_workspaces", "cms_draft_items", "cms_trash_items"}',
  'assert required <= tables, sorted(required - tables)',
  'assert db.execute("SELECT username, active, password_hash FROM editor_users").fetchone() == ("k", 1, None)',
  'indexes = {row[0] for row in db.execute("SELECT name FROM sqlite_master WHERE type = \'index\'")}',
  'assert "cms_workspaces_active_idx" in indexes',
  'print("D1 schema, visual workspace, trash, and pending k account are valid")'
].join('\n');
const dbCheck = spawnSync('python', ['-c', python], { input: migration, encoding: 'utf8' });
assert.equal(dbCheck.status, 0, dbCheck.stderr || dbCheck.stdout);

const wrangler = readFileSync(resolve('wrangler.toml'), 'utf8');
assert.ok(wrangler.includes('"/preview/*"'), 'preview requests must be handled by the authenticated Worker proxy');
assert.ok(wrangler.includes('PREVIEW_SITE_PATH'), 'preview base path must be configured');
const worker = readFileSync(workerPath, 'utf8');
assert.ok(worker.includes("await requireSession(request, env, 'editor')"), 'preview and content APIs must require an editor session');
assert.ok(worker.includes('PREVIEW_SHARED_SECRET'), 'draft previews must require the shared server secret');
assert.ok(worker.includes('X-XLab-Preview-Secret'), 'the authenticated Worker must add the preview header');

const previewSecret = 'a'.repeat(32);
const previewRequest = (provided) => new Request('https://preview.example.test/', {
  headers: provided ? { 'X-XLab-Preview-Secret': provided } : {},
});
const runPreview = (branch, secret, provided) => previewMiddleware({
  env: { CF_PAGES_BRANCH: branch, PREVIEW_SHARED_SECRET: secret },
  request: previewRequest(provided),
  next: async () => new Response('site content'),
});
const productionPreview = await runPreview('main', '', '');
const missingSecret = await runPreview('draft', '', '');
const wrongSecret = await runPreview('draft', previewSecret, 'wrong');
const authorizedPreview = await runPreview('draft', previewSecret, previewSecret);
assert.equal(productionPreview.status, 200, 'the production branch must remain public');
assert.equal(missingSecret.status, 404, 'preview must fail closed when its secret is missing');
assert.equal(wrongSecret.status, 404, 'preview must reject an incorrect secret');
assert.equal(authorizedPreview.status, 200, 'preview must allow the Worker secret');
assert.equal(authorizedPreview.headers.get('cache-control'), 'private, no-store');
assert.equal(authorizedPreview.headers.get('x-robots-tag'), 'noindex, nofollow');

console.log('Worker syntax, editor scripts, CMS schema, migrations, and preview protection checks passed.');
