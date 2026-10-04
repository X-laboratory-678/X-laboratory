import YAML from 'yaml';

const OWNER = 'X-laboratory-678';
const REPO = 'X-laboratory';
const GH_API = 'https://api.github.com';
const CONFIG_PATH = 'static/admin/config.yml';
const SESSION_COOKIE = 'xlab_editor_session';
const STATE_COOKIE = 'xlab_admin_state';
const SESSION_SECONDS = 60 * 60 * 12;
const INVITE_SECONDS = 60 * 30;
const MAX_LOGIN_ATTEMPTS = 8;
const LOGIN_WINDOW_SECONDS = 15 * 60;
const KDF_DEFAULT = 310000;
let cachedInstallationToken;
let cachedSchema;
let cachedTree;

export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      const response = url.pathname.startsWith('/api/')
        ? await handleApi(request, env, url)
        : url.pathname.startsWith('/auth/')
          ? await handleAdminOAuth(request, env, url)
          : url.pathname.startsWith('/webhooks/')
            ? await handleWebhook(request, env, url)
            : url.pathname === '/health'
              ? json({ ok: true, service: 'x-lab-cms-editor' })
              : await env.ASSETS.fetch(request);
      return secureResponse(response);
    } catch (error) {
      console.error('request failed', error?.message || 'unknown error');
      const status = error instanceof HttpError ? error.status : 500;
      return secureResponse(json({ error: status === 500 ? '服务器暂时无法处理请求。' : error.message }, status));
    }
  }
};

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function json(value, status = 200, headers = {}) {
  return new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers } });
}

function secureResponse(response) {
  const headers = new Headers(response.headers);
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('Referrer-Policy', 'no-referrer');
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  headers.set('Content-Security-Policy', "default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

async function readJson(request, maxBytes = 100_000) {
  const length = Number(request.headers.get('content-length') || 0);
  if (length > maxBytes) throw new HttpError(413, '提交内容过大。');
  const text = await request.text();
  if (text.length > maxBytes) throw new HttpError(413, '提交内容过大。');
  try { return JSON.parse(text || '{}'); } catch { throw new HttpError(400, '请求格式无效。'); }
}

function mustMethod(request, method) {
  if (request.method !== method) throw new HttpError(405, '请求方法不受支持。');
}

function cookies(request) {
  return Object.fromEntries((request.headers.get('Cookie') || '').split(';').map((part) => {
    const index = part.indexOf('=');
    return index < 0 ? ['', ''] : [part.slice(0, index).trim(), decodeURIComponent(part.slice(index + 1).trim())];
  }).filter(([name]) => name));
}

function cookie(name, value, maxAge, httpOnly = true) {
  return name + '=' + encodeURIComponent(value) + '; Path=/; Max-Age=' + maxAge + '; Secure; SameSite=Lax' + (httpOnly ? '; HttpOnly' : '');
}

function clearCookie(name) {
  return name + '=; Path=/; Max-Age=0; Secure; HttpOnly; SameSite=Lax';
}

function randomBytes(length) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

function base64(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function fromBase64(value, expectedLength) {
  if (typeof value !== 'string' || !/^[A-Za-z0-9+/]+={0,2}$/.test(value)) throw new HttpError(400, '密码校验数据无效。');
  let bytes;
  try { bytes = Uint8Array.from(atob(value), (char) => char.charCodeAt(0)); } catch { throw new HttpError(400, '密码校验数据无效。'); }
  if (expectedLength && bytes.length !== expectedLength) throw new HttpError(400, '密码校验数据无效。');
  return bytes;
}

async function digest(value) {
  return base64(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))));
}

async function hmac(keyText, value) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(keyText), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value)));
}

function equalBytes(a, b) {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) mismatch |= a[i] ^ b[i];
  return mismatch === 0;
}

async function passwordVerifier(env, username, salt, derivedKey) {
  if (!env.PASSWORD_PEPPER) throw new HttpError(503, '密码服务未配置。');
  return base64(await hmac(env.PASSWORD_PEPPER, 'x-lab-editor:v1:' + username + ':' + salt + ':' + base64(derivedKey)));
}

async function currentSession(request, env) {
  const token = cookies(request)[SESSION_COOKIE];
  if (!token) return null;
  const key = await digest(token);
  const row = await env.DB.prepare('SELECT token_hash, kind, username, csrf_token, expires_at FROM sessions WHERE token_hash = ? AND expires_at > ?').bind(key, Math.floor(Date.now() / 1000)).first();
  if (!row) return null;
  if (row.kind === 'editor') {
    const user = await env.DB.prepare('SELECT active, password_hash FROM editor_users WHERE username = ?').bind(row.username).first();
    if (!user?.active || !user.password_hash) {
      await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(key).run();
      return null;
    }
  }
  return { ...row, token };
}

async function requireSession(request, env, kind) {
  const session = await currentSession(request, env);
  if (!session || session.kind !== kind) throw new HttpError(401, '登录状态已过期，请重新登录。');
  return session;
}

function requireCsrf(request, session) {
  if (!session || request.headers.get('X-CSRF-Token') !== session.csrf_token) throw new HttpError(403, '安全校验失败，请刷新页面后重试。');
  const origin = request.headers.get('Origin');
  if (origin && origin !== new URL(request.url).origin) throw new HttpError(403, '请求来源无效。');
}

async function startSession(env, kind, username) {
  const token = base64(randomBytes(32)).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
  const csrf = base64(randomBytes(24)).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
  const tokenHash = await digest(token);
  const expires = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  await env.DB.prepare('INSERT INTO sessions (token_hash, kind, username, csrf_token, expires_at) VALUES (?, ?, ?, ?, ?)').bind(tokenHash, kind, username, csrf, expires).run();
  return { token, csrf, tokenHash, expires };
}

async function audit(env, actor, action, subject = null, detail = null) {
  await env.DB.prepare('INSERT INTO audit_events (id, actor, action, subject, detail) VALUES (?, ?, ?, ?, ?)').bind(crypto.randomUUID(), actor, action, subject, detail).run();
}

async function handleApi(request, env, url) {
  const path = url.pathname;
  if (path === '/api/session' && request.method === 'GET') {
    const session = await currentSession(request, env);
    return json(session ? { authenticated: true, role: session.kind, username: session.username, csrf: session.csrf_token } : { authenticated: false });
  }
  if (path === '/api/auth/login/challenge') return loginChallenge(request, env);
  if (path === '/api/auth/login') return login(request, env);
  if (path === '/api/auth/setup/complete') return completeSetup(request, env);
  if (path === '/api/auth/logout') return logout(request, env);
  if (path === '/api/admin/users') return adminUsers(request, env);
  const userAction = path.match(/^\/api\/admin\/users\/([a-z0-9._-]+)\/(invite|disable|enable)$/);
  if (userAction) return adminUserAction(request, env, userAction[1], userAction[2]);
  if (path === '/api/schema') return schemaRoute(request, env);
  if (path === '/api/content') return contentListRoute(request, env, url);
  if (path === '/api/entry') return entryRoute(request, env, url);
  if (path === '/api/publish') return publishRoute(request, env);
  const jobMatch = path.match(/^\/api\/publish\/([a-f0-9-]+)$/i);
  if (jobMatch) return publishJobRoute(request, env, jobMatch[1]);
  if (path === '/api/publish-jobs') return publishJobsRoute(request, env);
  throw new HttpError(404, '接口不存在。');
}

function loginBucketKey(username, request) {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  return digest(username.toLowerCase() + ':' + ip);
}

async function throttleState(env, key) {
  const now = Math.floor(Date.now() / 1000);
  const row = await env.DB.prepare('SELECT attempts, window_started_at, blocked_until FROM login_attempts WHERE bucket_key = ?').bind(key).first();
  if (!row) return { now, attempts: 0, blocked: false };
  if (row.blocked_until > now) return { now, attempts: row.attempts, blocked: true };
  if (now - row.window_started_at > LOGIN_WINDOW_SECONDS) return { now, attempts: 0, blocked: false };
  return { now, attempts: row.attempts, blocked: row.attempts >= MAX_LOGIN_ATTEMPTS };
}

async function noteLoginFailure(env, key) {
  const now = Math.floor(Date.now() / 1000);
  await env.DB.prepare(`INSERT INTO login_attempts (bucket_key, attempts, window_started_at, blocked_until)
    VALUES (?, 1, ?, 0)
    ON CONFLICT(bucket_key) DO UPDATE SET
      attempts = CASE WHEN ? - window_started_at > ? THEN 1 ELSE attempts + 1 END,
      window_started_at = CASE WHEN ? - window_started_at > ? THEN ? ELSE window_started_at END,
      blocked_until = CASE WHEN attempts + 1 >= ? THEN ? ELSE blocked_until END`)
    .bind(key, now, now, LOGIN_WINDOW_SECONDS, now, LOGIN_WINDOW_SECONDS, now, MAX_LOGIN_ATTEMPTS, now + LOGIN_WINDOW_SECONDS).run();
}

async function loginChallenge(request, env) {
  mustMethod(request, 'POST');
  const body = await readJson(request);
  const username = String(body.username || '').trim().toLowerCase();
  if (!/^[a-z0-9][a-z0-9._-]{0,31}$/.test(username)) throw new HttpError(400, '请输入有效用户名。');
  const key = await loginBucketKey(username, request);
  const throttle = await throttleState(env, key);
  if (throttle.blocked) throw new HttpError(429, '尝试次数过多，请稍后再试。');
  const user = await env.DB.prepare('SELECT password_salt, password_iterations, password_hash, active FROM editor_users WHERE username = ?').bind(username).first();
  if (!user?.active) {
    await noteLoginFailure(env, key);
    throw new HttpError(401, '用户名或密码不正确。');
  }
  if (!user.password_hash || !user.password_salt) throw new HttpError(409, '此账号尚未设置密码，请联系管理员获取一次性设置链接。');
  return json({ salt: user.password_salt, iterations: user.password_iterations || KDF_DEFAULT });
}

async function login(request, env) {
  mustMethod(request, 'POST');
  const body = await readJson(request);
  const username = String(body.username || '').trim().toLowerCase();
  if (!/^[a-z0-9][a-z0-9._-]{0,31}$/.test(username)) throw new HttpError(400, '用户名或密码不正确。');
  const key = await loginBucketKey(username, request);
  const throttle = await throttleState(env, key);
  if (throttle.blocked) throw new HttpError(429, '尝试次数过多，请稍后再试。');
  const user = await env.DB.prepare('SELECT password_salt, password_hash, active FROM editor_users WHERE username = ?').bind(username).first();
  const derived = fromBase64(body.derivedKey, 32);
  if (!user?.active || !user.password_hash || !user.password_salt) {
    await noteLoginFailure(env, key);
    throw new HttpError(401, '用户名或密码不正确。');
  }
  const submitted = await passwordVerifier(env, username, user.password_salt, derived);
  if (!equalBytes(fromBase64(submitted, 32), fromBase64(user.password_hash, 32))) {
    await noteLoginFailure(env, key);
    throw new HttpError(401, '用户名或密码不正确。');
  }
  await env.DB.prepare('DELETE FROM login_attempts WHERE bucket_key = ?').bind(key).run();
  const session = await startSession(env, 'editor', username);
  await audit(env, username, 'login');
  return json({ authenticated: true, role: 'editor', username, csrf: session.csrf }, 200, { 'Set-Cookie': cookie(SESSION_COOKIE, session.token, SESSION_SECONDS) });
}

async function completeSetup(request, env) {
  mustMethod(request, 'POST');
  const body = await readJson(request);
  if (typeof body.token !== 'string' || body.token.length < 32) throw new HttpError(400, '设置链接无效或已过期。');
  const tokenHash = await digest(body.token);
  const invite = await env.DB.prepare('SELECT username, purpose FROM invitations WHERE token_hash = ? AND consumed_at IS NULL AND expires_at > ?').bind(tokenHash, Math.floor(Date.now() / 1000)).first();
  if (!invite) throw new HttpError(410, '设置链接无效或已过期，请联系管理员重新发起。');
  const user = await env.DB.prepare('SELECT active FROM editor_users WHERE username = ?').bind(invite.username).first();
  if (!user?.active) throw new HttpError(403, '该账号已停用。');
  const saltBytes = fromBase64(body.salt, 16);
  const derivedKey = fromBase64(body.derivedKey, 32);
  const iterations = KDF_DEFAULT;
  const salt = base64(saltBytes);
  const verifier = await passwordVerifier(env, invite.username, salt, derivedKey);
  const now = Math.floor(Date.now() / 1000);
  const consumed = await env.DB.prepare('UPDATE invitations SET consumed_at = ? WHERE token_hash = ? AND consumed_at IS NULL AND expires_at > ?').bind(now, tokenHash, now).run();
  if (!consumed.meta?.changes) throw new HttpError(410, '设置链接已经使用，请联系管理员重新发起。');
  const update = await env.DB.prepare('UPDATE editor_users SET password_salt = ?, password_hash = ?, password_iterations = ?, updated_at = CURRENT_TIMESTAMP WHERE username = ? AND active = 1').bind(salt, verifier, iterations, invite.username).run();
  if (!update.meta?.changes) throw new HttpError(403, '该账号已停用。');
  if (invite.purpose === 'reset') await env.DB.prepare("DELETE FROM sessions WHERE kind = 'editor' AND username = ?").bind(invite.username).run();
  const session = await startSession(env, 'editor', invite.username);
  await audit(env, invite.username, invite.purpose === 'setup' ? 'password_setup' : 'password_reset');
  return json({ authenticated: true, role: 'editor', username: invite.username, csrf: session.csrf }, 200, { 'Set-Cookie': cookie(SESSION_COOKIE, session.token, SESSION_SECONDS) });
}

async function logout(request, env) {
  mustMethod(request, 'POST');
  const session = await currentSession(request, env);
  if (session) {
    requireCsrf(request, session);
    await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(await digest(session.token)).run();
    await audit(env, session.username, 'logout');
  }
  return json({ ok: true }, 200, { 'Set-Cookie': clearCookie(SESSION_COOKIE) });
}

function allowedAdmins(env) {
  return (env.ADMIN_GITHUB_USERS || OWNER).split(',').map((name) => name.trim().toLowerCase()).filter(Boolean);
}

async function handleAdminOAuth(request, env, url) {
  if (url.pathname === '/auth/github/start') {
    mustMethod(request, 'GET');
    if (!env.ADMIN_GITHUB_CLIENT_ID || !env.ADMIN_GITHUB_CLIENT_SECRET) throw new HttpError(503, '管理员 GitHub 登录尚未配置。');
    const state = base64(randomBytes(32)).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
    const expires = Math.floor(Date.now() / 1000) + 600;
    await env.DB.prepare('INSERT INTO oauth_states (state_hash, expires_at) VALUES (?, ?)').bind(await digest(state), expires).run();
    const redirect = new URL('https://github.com/login/oauth/authorize');
    redirect.searchParams.set('client_id', env.ADMIN_GITHUB_CLIENT_ID);
    redirect.searchParams.set('redirect_uri', new URL('/auth/github/callback', request.url).toString());
    redirect.searchParams.set('scope', 'read:user');
    redirect.searchParams.set('state', state);
    return new Response(null, { status: 302, headers: { Location: redirect.toString(), 'Set-Cookie': cookie(STATE_COOKIE, state, 600) } });
  }
  if (url.pathname === '/auth/github/callback') {
    mustMethod(request, 'GET');
    const state = url.searchParams.get('state') || '';
    const stateCookie = cookies(request)[STATE_COOKIE] || '';
    if (!state || !stateCookie || state !== stateCookie) throw new HttpError(400, '管理员登录校验失败，请重新开始。');
    const stateHash = await digest(state);
    const validState = await env.DB.prepare('SELECT state_hash FROM oauth_states WHERE state_hash = ? AND expires_at > ?').bind(stateHash, Math.floor(Date.now() / 1000)).first();
    if (!validState) throw new HttpError(400, '管理员登录已过期，请重新开始。');
    await env.DB.prepare('DELETE FROM oauth_states WHERE state_hash = ?').bind(stateHash).run();
    if (url.searchParams.has('error')) throw new HttpError(401, 'GitHub 管理员登录未完成。');
    const code = url.searchParams.get('code');
    if (!code) throw new HttpError(400, 'GitHub 未返回登录授权。');
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: env.ADMIN_GITHUB_CLIENT_ID, client_secret: env.ADMIN_GITHUB_CLIENT_SECRET, code })
    });
    const tokenBody = await tokenResponse.json();
    if (!tokenResponse.ok || !tokenBody.access_token) throw new HttpError(401, 'GitHub 管理员登录失败。');
    const profileResponse = await fetch('https://api.github.com/user', { headers: githubHeaders(tokenBody.access_token) });
    if (!profileResponse.ok) throw new HttpError(401, '无法读取 GitHub 登录身份。');
    const profile = await profileResponse.json();
    const loginName = String(profile.login || '').toLowerCase();
    if (!allowedAdmins(env).includes(loginName)) throw new HttpError(403, '此 GitHub 账号未获授权管理本地编辑账号。');
    const session = await startSession(env, 'admin', loginName);
    await audit(env, loginName, 'admin_login');
    const headers = new Headers({ Location: '/editor/' });
    headers.append('Set-Cookie', cookie(SESSION_COOKIE, session.token, SESSION_SECONDS));
    headers.append('Set-Cookie', clearCookie(STATE_COOKIE));
    return new Response(null, { status: 302, headers });
  }
  throw new HttpError(404, '认证地址不存在。');
}

async function requireAdminMutation(request, env) {
  const session = await requireSession(request, env, 'admin');
  requireCsrf(request, session);
  return session;
}

async function adminUsers(request, env) {
  const session = await requireSession(request, env, 'admin');
  if (request.method === 'GET') {
    const rows = await env.DB.prepare(`SELECT u.username, u.active, u.password_hash IS NOT NULL AS password_set,
      u.created_at, u.updated_at,
      (SELECT COUNT(*) FROM sessions s WHERE s.kind = 'editor' AND s.username = u.username AND s.expires_at > ?) AS active_sessions
      FROM editor_users u ORDER BY u.username`).bind(Math.floor(Date.now() / 1000)).all();
    return json({ users: rows.results || [], csrf: session.csrf_token });
  }
  mustMethod(request, 'POST');
  requireCsrf(request, session);
  const body = await readJson(request);
  const username = String(body.username || '').trim().toLowerCase();
  if (!/^[a-z0-9][a-z0-9._-]{0,31}$/.test(username) || ['admin', 'administrator', 'root'].includes(username)) throw new HttpError(400, '用户名须为 1–32 位小写字母、数字、点、下划线或连字符。');
  await env.DB.prepare('INSERT INTO editor_users (username, active) VALUES (?, 1)').bind(username).run().catch((error) => {
    if (String(error.message).toLowerCase().includes('unique')) throw new HttpError(409, '这个用户名已存在。');
    throw error;
  });
  const link = await issueInvitation(env, username, 'setup', session.username, new URL(request.url).origin);
  await audit(env, session.username, 'editor_created', username);
  return json({ ok: true, username, inviteUrl: link });
}

async function issueInvitation(env, username, purpose, createdBy, editorOrigin) {
  const token = base64(randomBytes(32)).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
  const tokenHash = await digest(token);
  const now = Math.floor(Date.now() / 1000);
  await env.DB.batch([
    env.DB.prepare('UPDATE invitations SET consumed_at = ? WHERE username = ? AND consumed_at IS NULL').bind(now, username),
    env.DB.prepare('INSERT INTO invitations (token_hash, username, purpose, expires_at, created_by) VALUES (?, ?, ?, ?, ?)').bind(tokenHash, username, purpose, now + INVITE_SECONDS, createdBy)
  ]);
  const base = new URL('/editor/', editorOrigin || env.PUBLIC_EDITOR_ORIGIN || env.PUBLIC_SITE_URL || 'https://example.com');
  base.searchParams.set('invite', token);
  return base.toString();
}

async function adminUserAction(request, env, username, action) {
  const session = await requireAdminMutation(request, env);
  if (action === 'invite') {
    mustMethod(request, 'POST');
    const user = await env.DB.prepare('SELECT username, active FROM editor_users WHERE username = ?').bind(username).first();
    if (!user) throw new HttpError(404, '账号不存在。');
    if (!user.active) throw new HttpError(409, '请先启用账号再发设置链接。');
    const purpose = (await env.DB.prepare('SELECT password_hash FROM editor_users WHERE username = ?').bind(username).first())?.password_hash ? 'reset' : 'setup';
    const inviteUrl = await issueInvitation(env, username, purpose, session.username, new URL(request.url).origin);
    await audit(env, session.username, purpose === 'reset' ? 'password_reset_invited' : 'password_setup_invited', username);
    return json({ ok: true, inviteUrl });
  }
  if (action === 'disable' || action === 'enable') {
    mustMethod(request, 'POST');
    const active = action === 'enable' ? 1 : 0;
    const result = await env.DB.prepare('UPDATE editor_users SET active = ?, updated_at = CURRENT_TIMESTAMP WHERE username = ?').bind(active, username).run();
    if (!result.meta?.changes) throw new HttpError(404, '账号不存在。');
    if (!active) await env.DB.batch([
      env.DB.prepare("DELETE FROM sessions WHERE kind = 'editor' AND username = ?").bind(username),
      env.DB.prepare('UPDATE invitations SET consumed_at = ? WHERE username = ? AND consumed_at IS NULL').bind(Math.floor(Date.now() / 1000), username)
    ]);
    await audit(env, session.username, active ? 'editor_enabled' : 'editor_disabled', username);
    return json({ ok: true });
  }
  throw new HttpError(404, '账号操作不存在。');
}

async function appJwt(env) {
  if (!env.GITHUB_APP_ID || !env.GITHUB_APP_PRIVATE_KEY || !env.GITHUB_INSTALLATION_ID) throw new HttpError(503, 'GitHub App 尚未配置。');
  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = base64Url(JSON.stringify({ iat: now - 60, exp: now + 540, iss: String(env.GITHUB_APP_ID) }));
  const unsigned = header + '.' + payload;
  const keyBytes = pkcs8FromPem(env.GITHUB_APP_PRIVATE_KEY);
  const key = await crypto.subtle.importKey('pkcs8', keyBytes, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(unsigned));
  return unsigned + '.' + base64UrlBytes(new Uint8Array(signature));
}

async function installationToken(env) {
  const now = Math.floor(Date.now() / 1000);
  if (cachedInstallationToken?.expiresAt > now + 60) return cachedInstallationToken.value;
  const jwt = await appJwt(env);
  const result = await fetch(GH_API + '/app/installations/' + encodeURIComponent(env.GITHUB_INSTALLATION_ID) + '/access_tokens', {
    method: 'POST', headers: githubHeaders(jwt, 'Bearer'), body: '{}'
  });
  const body = await result.json();
  if (!result.ok || !body.token) throw new HttpError(502, 'GitHub App 暂时无法访问仓库。');
  cachedInstallationToken = { value: body.token, expiresAt: Math.floor(new Date(body.expires_at).getTime() / 1000) };
  return body.token;
}

function pemBytes(pem) {
  const body = pem.replace(/-----BEGIN [^-]+-----/g, '').replace(/-----END [^-]+-----/g, '').replace(/\s+/g, '');
  try { return Uint8Array.from(atob(body), (c) => c.charCodeAt(0)); } catch { throw new HttpError(503, 'GitHub App 私钥格式无效。'); }
}

function derLength(length) {
  if (length < 128) return Uint8Array.of(length);
  const bytes = [];
  let number = length;
  while (number) { bytes.unshift(number & 255); number >>>= 8; }
  return Uint8Array.of(128 | bytes.length, ...bytes);
}

function derElement(tag, bytes) {
  const length = derLength(bytes.length);
  const result = new Uint8Array(1 + length.length + bytes.length);
  result[0] = tag;
  result.set(length, 1);
  result.set(bytes, 1 + length.length);
  return result;
}

function concatBytes(...parts) {
  const result = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let offset = 0;
  for (const part of parts) { result.set(part, offset); offset += part.length; }
  return result;
}

function pkcs8FromPem(pem) {
  const bytes = pemBytes(pem);
  if (pem.includes('BEGIN PRIVATE KEY')) return bytes;
  if (!pem.includes('BEGIN RSA PRIVATE KEY')) throw new HttpError(503, 'GitHub App 私钥须为标准 RSA 私钥 PEM。');
  const version = Uint8Array.of(2, 1, 0);
  const algorithm = Uint8Array.of(48, 13, 6, 9, 42, 134, 72, 134, 247, 13, 1, 1, 1, 5, 0);
  const privateKey = derElement(4, bytes);
  return derElement(48, concatBytes(version, algorithm, privateKey));
}

function base64Url(value) {
  return base64UrlBytes(new TextEncoder().encode(value));
}

function base64UrlBytes(bytes) {
  return base64(bytes).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

function githubHeaders(token, scheme = 'token') {
  return {
    Authorization: scheme === 'Bearer' ? 'Bearer ' + token : 'token ' + token,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'x-laboratory-cms-editor'
  };
}

async function github(env, path, options = {}) {
  const token = await installationToken(env);
  const response = await fetch(GH_API + path, {
    ...options,
    headers: { ...githubHeaders(token), ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(options.headers || {}) }
  });
  const text = await response.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = {}; }
  if (!response.ok) {
    const detail = response.status === 409 || response.status === 422 ? 'GitHub 拒绝了这次内容更新，可能存在并发修改。' : 'GitHub 仓库请求失败。';
    throw new HttpError(response.status === 404 ? 404 : response.status === 409 || response.status === 422 ? 409 : 502, detail);
  }
  return data;
}

function repository(env) {
  const repo = env.REPOSITORY || OWNER + '/' + REPO;
  if (repo.toLowerCase() !== (OWNER + '/' + REPO).toLowerCase()) throw new HttpError(503, 'Worker 仅允许连接指定实验室仓库。');
  return repo;
}

async function getSchema(env) {
  if (cachedSchema && cachedSchema.expiresAt > Date.now()) return cachedSchema.value;
  repository(env);
  const response = await fetch('https://raw.githubusercontent.com/' + OWNER + '/' + REPO + '/' + encodeURIComponent(env.MAIN_BRANCH || 'main') + '/' + CONFIG_PATH, { headers: { 'Cache-Control': 'no-cache' } });
  if (!response.ok) throw new HttpError(502, '无法读取现有 CMS 字段配置。');
  const parsed = YAML.parse(await response.text());
  if (parsed?.backend?.repo?.toLowerCase() !== (OWNER + '/' + REPO).toLowerCase()) throw new HttpError(503, 'CMS 仓库配置不匹配。');
  const collections = (parsed.collections || []).filter((collection) => typeof collection.folder === 'string' && collection.folder.startsWith('content/'));
  const value = { locales: parsed.i18n?.locales || ['en', 'zh'], defaultLocale: parsed.i18n?.default_locale || 'en', collections };
  cachedSchema = { value, expiresAt: Date.now() + 60_000 };
  return value;
}

async function schemaRoute(request, env) {
  mustMethod(request, 'GET');
  await requireSession(request, env, 'editor');
  return json(await getSchema(env));
}

async function getMainTree(env) {
  if (cachedTree && cachedTree.expiresAt > Date.now()) return cachedTree.value;
  const data = await github(env, '/repos/' + repository(env) + '/git/trees/' + encodeURIComponent(env.MAIN_BRANCH || 'main') + '?recursive=1');
  if (!Array.isArray(data.tree) || data.truncated) throw new HttpError(502, '仓库内容索引暂时不可用。');
  const value = data.tree.filter((item) => item.type === 'blob' && item.path.startsWith('content/'));
  cachedTree = { value, expiresAt: Date.now() + 10_000 };
  return value;
}

function collectionByName(schema, name) {
  const collection = schema.collections.find((item) => item.name === name);
  if (!collection) throw new HttpError(404, '内容栏目不存在。');
  return collection;
}

function entriesFromTree(tree, collection) {
  const prefix = collection.folder + '/';
  const map = new Map();
  for (const item of tree) {
    if (!item.path.startsWith(prefix)) continue;
    const rest = item.path.slice(prefix.length);
    const match = rest.match(/^([a-z0-9]+(?:-[a-z0-9]+)*)\/index\.(en|zh)\.md$/);
    if (!match) continue;
    const id = match[1];
    const entry = map.get(id) || { id, locales: {} };
    entry.locales[match[2]] = true;
    map.set(id, entry);
  }
  return [...map.values()].sort((a, b) => a.id.localeCompare(b.id));
}

async function contentListRoute(request, env, url) {
  mustMethod(request, 'GET');
  await requireSession(request, env, 'editor');
  const schema = await getSchema(env);
  const collection = collectionByName(schema, url.searchParams.get('collection'));
  const tree = await getMainTree(env);
  let entries = entriesFromTree(tree, collection);
  if (collection.filter?.field) {
    const visible = [];
    for (const entry of entries) {
      const file = tree.find((item) => item.path === entryFilePath(collection, entry.id, 'en')) || tree.find((item) => item.path === entryFilePath(collection, entry.id, 'zh'));
      if (!file) continue;
      const parsed = parseMarkdown(await readBlob(env, file.sha));
      if (passesCollectionFilter(collection, parsed.fields)) visible.push(entry);
    }
    entries = visible;
  }
  return json({ entries, canCreate: collection.create === true });
}

function entryFilePath(collection, id, locale) {
  return collection.folder + '/' + id + '/index.' + locale + '.md';
}

function parseMarkdown(text) {
  const match = String(text).match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)([\s\S]*)$/);
  if (!match) throw new HttpError(422, '内容文件的 YAML 头部格式无效。');
  let fields;
  try { fields = YAML.parse(match[1]) || {}; } catch { throw new HttpError(422, '内容文件的 YAML 头部格式无效。'); }
  return { fields, body: match[2] || '' };
}

function decodeUtf8Base64(value) {
  const binary = atob(value);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

async function readBlob(env, sha) {
  const blob = await github(env, '/repos/' + repository(env) + '/git/blobs/' + sha);
  if (blob.encoding !== 'base64' || typeof blob.content !== 'string') throw new HttpError(502, '无法读取内容文件。');
  return decodeUtf8Base64(blob.content.replace(/\s/g, ''));
}

function passesCollectionFilter(collection, fields) {
  if (collection.name === 'events' && fields.eventType === 'recurring') return false;
  if (collection.name === 'materials' && fields.translationKey === 'materials') return false;
  const filter = collection.filter;
  if (filter?.field && typeof filter.pattern === 'string') {
    try { return new RegExp(filter.pattern).test(String(fields[filter.field] ?? '')); } catch { return true; }
  }
  return true;
}

async function entryRoute(request, env, url) {
  mustMethod(request, 'GET');
  await requireSession(request, env, 'editor');
  const schema = await getSchema(env);
  const collection = collectionByName(schema, url.searchParams.get('collection'));
  const id = url.searchParams.get('id') || '';
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) throw new HttpError(400, '条目 ID 无效。');
  const tree = await getMainTree(env);
  const files = {};
  for (const locale of ['en', 'zh']) {
    const path = entryFilePath(collection, id, locale);
    const item = tree.find((entry) => entry.path === path);
    files[locale] = item ? { sha: item.sha, ...parseMarkdown(await readBlob(env, item.sha)) } : { sha: null, fields: {}, body: '' };
  }
  const isNew = !files.en.sha && !files.zh.sha;
  if (isNew && !collection.create) throw new HttpError(404, '条目不存在。');
  if (isNew) {
    const prefixes = { people: 'people', publications: 'publication', projects: 'project', research: 'research', news: 'news', grants: 'grant', opportunities: 'opportunity', events: 'event', resources: 'resource', materials: 'material' };
    for (const locale of ['en', 'zh']) {
      for (const field of collection.fields || []) {
        if (field.name === 'id') files[locale].fields.id = id;
        if (field.name === 'translationKey') files[locale].fields.translationKey = (prefixes[collection.name] || collection.name) + '-' + id;
        if (field.widget !== 'hidden' && field.name && field.default !== undefined) files[locale].fields[field.name] = field.default;
      }
    }
  }
  if (!isNew && !passesCollectionFilter(collection, files.en.fields) && !passesCollectionFilter(collection, files.zh.fields)) throw new HttpError(404, '此系统条目不能从编辑器打开。');
  return json({ id, collection: collection.name, locales: files });
}

function fieldMap(fields) {
  return new Map((fields || []).filter((field) => field && typeof field.name === 'string').map((field) => [field.name, field]));
}

function cleanScalar(value, field) {
  if (value === null || value === undefined) return field.widget === 'boolean' ? false : '';
  const widget = field.widget;
  if (widget === 'boolean') {
    if (typeof value !== 'boolean') throw new HttpError(400, '字段“' + field.label + '”须为布尔值。');
    return value;
  }
  if (widget === 'number') {
    if (value === '' && !field.required) return '';
    const number = Number(value);
    if (!Number.isFinite(number)) throw new HttpError(400, '字段“' + field.label + '”须为数字。');
    return number;
  }
  if (widget === 'select') {
    const options = (field.options || []).map((item) => typeof item === 'object' ? item.value : item);
    if (Array.isArray(value) && field.multiple) {
      if (value.length > 100 || value.some((item) => !options.includes(item))) throw new HttpError(400, '字段“' + field.label + '”包含无效选项。');
      return value;
    }
    if (value === '' && !field.required) return '';
    if (!options.includes(value)) throw new HttpError(400, '字段“' + field.label + '”包含无效选项。');
    return value;
  }
  if (widget === 'relation') {
    if (Array.isArray(value) && field.multiple) {
      if (value.length > 100 || value.some((item) => typeof item !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item))) throw new HttpError(400, '关联项无效。');
      return [...new Set(value)];
    }
    if (value === '' || value === null) return '';
    if (typeof value !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) throw new HttpError(400, '关联项无效。');
    return value;
  }
  if (widget === 'list') {
    if (!Array.isArray(value) || value.length > 250) throw new HttpError(400, '字段“' + field.label + '”须为不超过 250 项的列表。');
    if (Array.isArray(field.fields) && field.fields.length) {
      const allowed = fieldMap(field.fields);
      return value.map((row) => {
        if (!row || typeof row !== 'object' || Array.isArray(row)) throw new HttpError(400, '字段“' + field.label + '”的项目格式无效。');
        const output = {};
        for (const [key, valueItem] of Object.entries(row)) {
          const child = allowed.get(key);
          if (!child || child.widget === 'hidden') throw new HttpError(400, '列表字段包含不允许的子字段。');
          output[key] = cleanScalar(valueItem, child);
        }
        return output;
      });
    }
    if (value.some((item) => typeof item !== 'string' || item.length > 2000)) throw new HttpError(400, '列表项须为不超过 2000 字符的文本。');
    return value;
  }
  if (widget === 'image') {
    if (value === '') return '';
    if (typeof value !== 'string' || value.length > 2000 || value.includes('..') || value.startsWith('//') || /^(?:javascript|data):/i.test(value)) throw new HttpError(400, '图片地址无效。');
    return value;
  }
  if (widget === 'datetime') {
    if (typeof value !== 'string') throw new HttpError(400, '字段“' + field.label + '”的日期格式无效。');
    if (field.type === 'date' && !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new HttpError(400, '字段“' + field.label + '”须为有效日期。');
    if (field.type !== 'date' && field.input_timezone === 'Asia/Shanghai' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?$/.test(value)) return value + '+08:00';
    if (field.type !== 'date' && !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value)) throw new HttpError(400, '字段“' + field.label + '”须为有效日期时间。');
    return value;
  }
  if (typeof value !== 'string') throw new HttpError(400, '字段“' + field.label + '”须为文本。');
  const max = widget === 'markdown' ? 200_000 : 10_000;
  if (value.length > max) throw new HttpError(413, '字段“' + field.label + '”内容过长。');
  return value;
}

function validateFields(collection, rawLocales, existingLocales, expectedId) {
  const topFields = fieldMap(collection.fields);
  const normalized = { en: {}, zh: {} };
  for (const locale of ['en', 'zh']) {
    const raw = rawLocales?.[locale];
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new HttpError(400, '英文和中文内容都需要一起提交。');
    for (const [name, value] of Object.entries(raw)) {
      const field = topFields.get(name);
      if (!field || field.widget === 'hidden' || name === 'body') continue;
      normalized[locale][name] = cleanScalar(value, field);
    }
    for (const [name, field] of topFields) {
      if (field.widget === 'hidden') continue;
      if (!(name in normalized[locale]) && name in (existingLocales[locale]?.fields || {})) normalized[locale][name] = existingLocales[locale].fields[name];
      if (field.required && (normalized[locale][name] === '' || normalized[locale][name] === null || normalized[locale][name] === undefined || (Array.isArray(normalized[locale][name]) && !normalized[locale][name].length))) {
        throw new HttpError(400, '“' + field.label + '”为必填项，请检查 ' + (locale === 'zh' ? '中文' : '英文') + '内容。');
      }
    }
  }
  for (const [name, field] of topFields) {
    if (field.widget === 'hidden') continue;
    if (field.i18n !== true) {
      if (name in normalized.en) normalized.zh[name] = normalized.en[name];
      else if (name in normalized.zh) normalized.en[name] = normalized.zh[name];
    }
  }
  if (topFields.has('id') && (String(normalized.en.id || '') !== expectedId || String(normalized.zh.id || '') !== expectedId)) throw new HttpError(400, '稳定 ID 必须与页面地址 ID 一致。');
  return normalized;
}

function validateRelationships(fields, values, schema, tree) {
  for (const field of fields || []) {
    const value = values?.[field.name];
    if (value === undefined || value === '' || value === null) continue;
    if (field.widget === 'relation') {
      const target = schema.collections.find((collection) => collection.name === field.collection);
      if (!target) throw new HttpError(400, '关联字段目标栏目无效。');
      const ids = new Set(entriesFromTree(tree, target).map((entry) => entry.id));
      const selected = Array.isArray(value) ? value : [value];
      if (selected.some((id) => !ids.has(id))) throw new HttpError(400, '“' + field.label + '”包含不存在的关联条目。');
    } else if (field.widget === 'list' && Array.isArray(field.fields) && Array.isArray(value)) {
      for (const row of value) validateRelationships(field.fields, row, schema, tree);
    }
  }
}

function stringifyMarkdown(fields, body) {
  const yaml = YAML.stringify(fields, { lineWidth: 0 }).trimEnd();
  return '---\n' + yaml + '\n---\n\n' + String(body || '').replace(/^\s+$/, '');
}

function validateSlug(collection, id, isNew) {
  const slug = collection.slug;
  if (isNew && slug?.editable === false) throw new HttpError(403, '此栏目不允许创建条目。');
  if (isNew && Array.isArray(slug?.editable) && !slug.editable.includes('create')) throw new HttpError(403, '此栏目不允许创建条目。');
  const pattern = Array.isArray(slug?.pattern) ? slug.pattern[0] : null;
  if (pattern) {
    try { if (!(new RegExp(pattern).test(id))) throw new HttpError(400, '条目 ID 格式不符合栏目要求。'); }
    catch (error) { if (error instanceof HttpError) throw error; }
  } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) throw new HttpError(400, '条目 ID 格式无效。');
}

function validImageBytes(bytes, mime) {
  if (mime === 'image/png') return bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  if (mime === 'image/jpeg') return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (mime === 'image/gif') return String.fromCharCode(...bytes.slice(0, 6)).startsWith('GIF8');
  if (mime === 'image/webp') return String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP';
  return false;
}

async function createBlob(env, content, encoding = 'utf-8') {
  return github(env, '/repos/' + repository(env) + '/git/blobs', { method: 'POST', body: JSON.stringify({ content, encoding }) });
}

async function publishRoute(request, env) {
  mustMethod(request, 'POST');
  const session = await requireSession(request, env, 'editor');
  requireCsrf(request, session);
  repository(env);
  const body = await readJson(request, 12_000_000);
  const schema = await getSchema(env);
  const collection = collectionByName(schema, body.collection);
  const id = String(body.id || '');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) throw new HttpError(400, '条目 ID 无效。');
  const files = await getMainTree(env);
  const existing = {};
  for (const locale of ['en', 'zh']) existing[locale] = files.find((item) => item.path === entryFilePath(collection, id, locale)) || null;
  const isNew = !existing.en && !existing.zh;
  if (isNew && collection.create !== true) throw new HttpError(403, '此栏目不允许创建条目。');
  validateSlug(collection, id, isNew);
  for (const locale of ['en', 'zh']) {
    const expected = body.baseShas?.[locale] || null;
    if (expected !== (existing[locale]?.sha || null)) throw new HttpError(409, '内容已被其他修改更新。请重新载入条目，合并保留的内容后再发布。');
  }
  const oldLocales = {};
  for (const locale of ['en', 'zh']) oldLocales[locale] = existing[locale] ? parseMarkdown(await readBlob(env, existing[locale].sha)) : { fields: {}, body: '' };
  if (!isNew && !passesCollectionFilter(collection, oldLocales.en.fields) && !passesCollectionFilter(collection, oldLocales.zh.fields)) throw new HttpError(403, '此系统条目不能从编辑器修改。');
  const cleanLocales = validateFields(collection, body.locales, oldLocales, id);
  validateRelationships(collection.fields, cleanLocales.en, schema, files);
  validateRelationships(collection.fields, cleanLocales.zh, schema, files);
  const markdown = {};
  for (const locale of ['en', 'zh']) {
    const frontmatter = { ...oldLocales[locale].fields, ...cleanLocales[locale] };
    if (Array.isArray(collection.fields)) {
      const hidden = collection.fields.filter((field) => field.widget === 'hidden');
      for (const field of hidden) if (!(field.name in frontmatter) && 'default' in field) frontmatter[field.name] = field.default;
    }
    markdown[locale] = stringifyMarkdown(frontmatter, body.locales[locale].body);
  }
  const uploads = Array.isArray(body.uploads) ? body.uploads : [];
  if (uploads.length > 10) throw new HttpError(413, '一次最多上传 10 张图片。');
  const uploadBytes = [];
  let totalBytes = 0;
  for (const upload of uploads) {
    const name = String(upload.name || '');
    const mime = String(upload.mime || '');
    if (!/^[a-f0-9-]{20,40}\.(?:png|jpe?g|gif|webp)$/i.test(name)) throw new HttpError(400, '图片文件名无效。');
    if (!['image/png', 'image/jpeg', 'image/gif', 'image/webp'].includes(mime)) throw new HttpError(400, '只支持 PNG、JPEG、GIF 或 WebP 图片。');
    const bytes = fromBase64(upload.data, 0);
    if (bytes.length > 4_000_000 || !validImageBytes(bytes, mime)) throw new HttpError(400, '图片无法验证或超过 4 MB。');
    totalBytes += bytes.length;
    if (totalBytes > 8_000_000) throw new HttpError(413, '图片总大小不能超过 8 MB。');
    uploadBytes.push({ name, mime, data: upload.data, bytes });
  }
  const jobId = crypto.randomUUID();
  const branch = 'cms-editor/' + session.username + '/' + jobId.slice(0, 8);
  const repo = repository(env);
  await env.DB.prepare('INSERT INTO publish_jobs (id, username, collection, entry_id, branch_name, state, message) VALUES (?, ?, ?, ?, ?, ?, ?)').bind(jobId, session.username, collection.name, id, branch, 'creating', '正在创建内容分支与拉取请求。').run();
  try {
    const mainBranch = env.MAIN_BRANCH || 'main';
    const ref = await github(env, '/repos/' + repo + '/git/ref/heads/' + encodeURIComponent(mainBranch));
    const parentSha = ref.object.sha;
    const commit = await github(env, '/repos/' + repo + '/git/commits/' + parentSha);
    const parentTree = await github(env, '/repos/' + repo + '/git/trees/' + commit.tree.sha + '?recursive=1');
    if (parentTree.truncated) throw new HttpError(502, '仓库内容索引暂时不可用。');
    for (const locale of ['en', 'zh']) {
      const latest = (parentTree.tree || []).find((item) => item.path === entryFilePath(collection, id, locale))?.sha || null;
      if (latest !== (body.baseShas?.[locale] || null)) throw new HttpError(409, '发布期间内容发生了并发修改，请重新载入并合并后再试。');
    }
    const changes = [];
    for (const locale of ['en', 'zh']) {
      const fileBlob = await createBlob(env, markdown[locale]);
      changes.push({ path: entryFilePath(collection, id, locale), mode: '100644', type: 'blob', sha: fileBlob.sha });
    }
    const existingPaths = new Set((parentTree.tree || []).map((item) => item.path));
    for (const upload of uploadBytes) {
      const path = entryFilePath(collection, id, 'en').replace(/\/index\.en\.md$/, '/' + upload.name);
      if (existingPaths.has(path)) throw new HttpError(409, '图片文件名已存在，请重新选择图片。');
      const blob = await createBlob(env, upload.data, 'base64');
      changes.push({ path, mode: '100644', type: 'blob', sha: blob.sha });
    }
    const tree = await github(env, '/repos/' + repo + '/git/trees', { method: 'POST', body: JSON.stringify({ base_tree: commit.tree.sha, tree: changes }) });
    const newCommit = await github(env, '/repos/' + repo + '/git/commits', { method: 'POST', body: JSON.stringify({ message: 'content: edit ' + collection.name + '/' + id, tree: tree.sha, parents: [parentSha] }) });
    await github(env, '/repos/' + repo + '/git/refs', { method: 'POST', body: JSON.stringify({ ref: 'refs/heads/' + branch, sha: newCommit.sha }) });
    const pull = await github(env, '/repos/' + repo + '/pulls', {
      method: 'POST',
      body: JSON.stringify({
        title: 'content: update ' + collection.label_singular + ' ' + id,
        head: branch,
        base: mainBranch,
        draft: false,
        body: '通过实验室本地内容编辑器提交。\n\n编辑账号：' + session.username + '\n栏目：' + collection.label + '\n条目：' + id + '\n\n<!-- xlab-editor-job:' + jobId + ' -->'
      })
    });
    await env.DB.prepare('UPDATE publish_jobs SET pull_number = ?, head_sha = ?, state = ?, message = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind(pull.number, newCommit.sha, 'checks_pending', '拉取请求已创建，正在等待 Build and audit 检查。', jobId).run();
    await audit(env, session.username, 'content_publish_requested', collection.name + '/' + id, JSON.stringify({ pull: pull.number, jobId }));
    try { await reconcileCompletedCheckSuite(env, newCommit.sha); }
    catch (error) { console.error('check reconciliation deferred', error?.message || 'unknown error'); }
    const latestJob = await env.DB.prepare('SELECT state, message FROM publish_jobs WHERE id = ?').bind(jobId).first();
    return json({ job: { id: jobId, pullNumber: pull.number, url: pull.html_url, state: latestJob?.state || 'checks_pending', message: latestJob?.message || '拉取请求已创建，正在等待检查。' } }, 201);
  } catch (error) {
    await env.DB.prepare('UPDATE publish_jobs SET state = ?, message = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind('failed', error instanceof HttpError ? error.message : '创建拉取请求失败，请稍后重试。', jobId).run();
    throw error;
  }
}

async function reconcileCompletedCheckSuite(env, sha) {
  const data = await github(env, '/repos/' + repository(env) + '/commits/' + sha + '/check-suites?per_page=100');
  const suite = (data.check_suites || []).find((item) => item.status === 'completed');
  if (suite) await handleCheckSuite(env, { action: 'completed', repository: { full_name: repository(env) }, check_suite: suite });
}

async function publishJobRoute(request, env, jobId) {
  mustMethod(request, 'GET');
  const session = await requireSession(request, env, 'editor');
  const job = await env.DB.prepare('SELECT id, username, collection, entry_id, pull_number, head_sha, merge_sha, state, message, created_at, updated_at FROM publish_jobs WHERE id = ? AND username = ?').bind(jobId, session.username).first();
  if (!job) throw new HttpError(404, '发布记录不存在。');
  return json({ job });
}

async function publishJobsRoute(request, env) {
  mustMethod(request, 'GET');
  const session = await requireSession(request, env, 'editor');
  const result = await env.DB.prepare('SELECT id, collection, entry_id, pull_number, state, message, created_at, updated_at FROM publish_jobs WHERE username = ? ORDER BY created_at DESC LIMIT 20').bind(session.username).all();
  return json({ jobs: result.results || [] });
}

async function handleWebhook(request, env, url) {
  if (url.pathname !== '/webhooks/github') throw new HttpError(404, 'Webhook 地址不存在。');
  mustMethod(request, 'POST');
  if (!env.GITHUB_WEBHOOK_SECRET) throw new HttpError(503, 'GitHub webhook 尚未配置。');
  const raw = await request.text();
  if (raw.length > 1_000_000) throw new HttpError(413, 'Webhook 内容过大。');
  const signature = request.headers.get('X-Hub-Signature-256') || '';
  const expected = 'sha256=' + [...await hmac(env.GITHUB_WEBHOOK_SECRET, raw)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
  if (!equalBytes(new TextEncoder().encode(signature), new TextEncoder().encode(expected))) throw new HttpError(401, 'Webhook 签名无效。');
  const event = request.headers.get('X-GitHub-Event');
  let payload;
  try { payload = JSON.parse(raw); } catch { throw new HttpError(400, 'Webhook 内容无效。'); }
  if (payload.repository?.full_name?.toLowerCase() !== (OWNER + '/' + REPO).toLowerCase()) throw new HttpError(403, 'Webhook 仓库无效。');
  if (event === 'check_suite' && payload.action === 'completed') await handleCheckSuite(env, payload);
  else if (event === 'deployment_status') await handleDeploymentStatus(env, payload);
  return json({ ok: true });
}

async function handleCheckSuite(env, payload) {
  const sha = payload.check_suite?.head_sha;
  if (!sha) return;
  const job = await env.DB.prepare("SELECT * FROM publish_jobs WHERE head_sha = ? AND state IN ('checks_pending', 'awaiting_required_check')").bind(sha).first();
  if (!job) return;
  const checks = await github(env, '/repos/' + repository(env) + '/commits/' + sha + '/check-runs?filter=latest&per_page=100');
  const checkRuns = checks.check_runs || [];
  if (payload.check_suite.conclusion !== 'success') {
    const failedNames = checkRuns.filter((run) => run.status === 'completed' && !['success', 'neutral', 'skipped'].includes(run.conclusion)).map((run) => run.name + ': ' + run.conclusion);
    const detail = failedNames.length ? '失败检查：' + failedNames.join('、') + '。' : '构建或内容审计未通过。';
    await env.DB.prepare('UPDATE publish_jobs SET state = ?, message = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind('checks_failed', detail + ' PR 保持未合并。', job.id).run();
    return;
  }
  const required = checkRuns.find((run) => run.name === 'Build and audit');
  const unfinished = checkRuns.some((run) => run.status !== 'completed');
  const failed = checkRuns.some((run) => run.status === 'completed' && !['success', 'neutral', 'skipped'].includes(run.conclusion));
  if (unfinished) {
    await env.DB.prepare('UPDATE publish_jobs SET state = ?, message = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind('checks_pending', '检查仍在运行。', job.id).run();
    return;
  }
  if (failed) {
    await env.DB.prepare('UPDATE publish_jobs SET state = ?, message = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind('checks_failed', '至少一项检查未通过；PR 保持未合并。', job.id).run();
    return;
  }
  if (!required || required.conclusion !== 'success') {
    await env.DB.prepare('UPDATE publish_jobs SET state = ?, message = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind('awaiting_required_check', '尚未找到成功的 Build and audit 检查，未执行合并。', job.id).run();
    return;
  }
  const pull = await github(env, '/repos/' + repository(env) + '/pulls/' + job.pull_number);
  const marker = '<!-- xlab-editor-job:' + job.id + ' -->';
  if (pull.state !== 'open' || pull.base?.ref !== (env.MAIN_BRANCH || 'main') || pull.head?.ref !== job.branch_name || pull.head?.sha !== sha || !String(pull.body || '').includes(marker)) {
    await env.DB.prepare('UPDATE publish_jobs SET state = ?, message = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind('merge_blocked', 'PR 与此编辑任务不匹配，未执行自动合并。', job.id).run();
    return;
  }
  let merge;
  try {
    merge = await github(env, '/repos/' + repository(env) + '/pulls/' + job.pull_number + '/merge', { method: 'PUT', body: JSON.stringify({ merge_method: 'squash', sha }) });
  } catch (error) {
    if (!(error instanceof HttpError)) throw error;
    await env.DB.prepare('UPDATE publish_jobs SET state = ?, message = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind('merge_blocked', '检查通过，但 GitHub 当前合并规则阻止合并；PR 保持未合并。', job.id).run();
    return;
  }
  if (!merge.merged) {
    await env.DB.prepare('UPDATE publish_jobs SET state = ?, message = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind('merge_blocked', '检查通过，但 GitHub 合并规则拒绝合并。', job.id).run();
    return;
  }
  await env.DB.prepare('UPDATE publish_jobs SET state = ?, merge_sha = ?, message = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind('merged_deploying', merge.sha, '检查已通过并合并，正在等待 GitHub Pages 部署。', job.id).run();
  await audit(env, job.username, 'content_auto_merged', job.collection + '/' + job.entry_id, JSON.stringify({ pull: job.pull_number, sha: merge.sha }));
}

async function handleDeploymentStatus(env, payload) {
  const sha = payload.deployment?.sha;
  if (!sha) return;
  const job = await env.DB.prepare("SELECT id FROM publish_jobs WHERE merge_sha = ? AND state IN ('merged_deploying', 'deployment_failed') ORDER BY created_at DESC LIMIT 1").bind(sha).first();
  if (!job) return;
  const success = payload.deployment_status?.state === 'success';
  const failure = ['failure', 'error', 'inactive'].includes(payload.deployment_status?.state);
  if (success) await env.DB.prepare('UPDATE publish_jobs SET state = ?, message = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind('published', '网站已更新。', job.id).run();
  else if (failure) await env.DB.prepare('UPDATE publish_jobs SET state = ?, message = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind('deployment_failed', '内容已合并，但网站部署失败；请联系管理员检查 Pages。', job.id).run();
}

