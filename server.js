// awal CLI Bridge + Aggregator API (GitHub/NPM/ClawHub)
// Port: 3098

import { createServer } from 'http';
import { execSync } from 'child_process';
import { randomUUID, createHash, generateKeyPairSync, sign as cryptoSign, verify as cryptoVerify } from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createPublicClient, http as viemHttp, parseAbiItem } from 'viem';
import { base } from 'viem/chains';

const PORT = Number(process.env.PORT || 3098);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.join(__dirname, 'dist');

// Minimal .env loader (no dependencies). Loads demo/bazaar-app/.env if present.
function loadDotEnv() {
  try {
    const envPath = path.join(__dirname, '.env');
    if (!fs.existsSync(envPath)) return;
    const raw = fs.readFileSync(envPath, 'utf-8');
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx <= 0) continue;
      const key = trimmed.slice(0, idx).trim();
      let value = trimmed.slice(idx + 1).trim();
      value = value.replace(/^"|"$/g, '').replace(/^'|'$/g, '');
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // ignore
  }
}

loadDotEnv();

// --- AOI Core API v0 (demo-grade) state ---
const WORKSPACE_ROOT = path.resolve(__dirname, '..', '..');
const CORE_STATE_DIR = path.join(WORKSPACE_ROOT, 'var', 'core_api_v0');
const CORE_IDENTITIES_DIR = path.join(CORE_STATE_DIR, 'identities');
const CORE_KEYS_FILE = path.join(CORE_STATE_DIR, 'api_keys.json');
const CORE_RECEIPTS_JSONL = path.join(CORE_STATE_DIR, 'receipts.jsonl');

function ensureCoreStateDirs() {
  fs.mkdirSync(CORE_IDENTITIES_DIR, { recursive: true });
  if (!fs.existsSync(CORE_KEYS_FILE)) fs.writeFileSync(CORE_KEYS_FILE, JSON.stringify({ keys: [] }, null, 2));
  if (!fs.existsSync(CORE_RECEIPTS_JSONL)) fs.writeFileSync(CORE_RECEIPTS_JSONL, '');

  // Ensure workflows registry exists (for fresh deployments).
  const registryPath = path.join(CORE_STATE_DIR, 'workflows.json');
  if (!fs.existsSync(registryPath)) {
    try {
      const fallback = path.join(__dirname, 'default_workflows.json');
      if (fs.existsSync(fallback)) {
        fs.writeFileSync(registryPath, fs.readFileSync(fallback, 'utf-8'));
      } else {
        fs.writeFileSync(registryPath, JSON.stringify({ version: 'v0.0', workflows: [] }, null, 2));
      }
    } catch {
      // ignore
    }
  }
}

function sha256Hex(input) {
  return createHash('sha256').update(input).digest('hex');
}

function readJsonFileOrDefault(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return fallback;
  }
}

function appendJsonl(filePath, obj) {
  fs.appendFileSync(filePath, JSON.stringify(obj) + '\n', 'utf-8');
}

async function readBodyJson(req) {
  return await new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
  });
}

function loadPrivateKey(identityId) {
  const p = path.join(CORE_IDENTITIES_DIR, identityId, 'private_key.pem');
  if (!fs.existsSync(p)) return null;
  return fs.readFileSync(p, 'utf-8');
}

function loadPublicKey(identityId) {
  const p = path.join(CORE_IDENTITIES_DIR, identityId, 'public_key.pem');
  if (!fs.existsSync(p)) return null;
  return fs.readFileSync(p, 'utf-8');
}

function createIdentity() {
  ensureCoreStateDirs();
  const identity_id = `id_${Date.now()}_${randomUUID().slice(0, 8)}`;
  const dir = path.join(CORE_IDENTITIES_DIR, identity_id);
  fs.mkdirSync(dir, { recursive: true });

  const { publicKey, privateKey } = generateKeyPairSync('ed25519');
  const publicPem = publicKey.export({ format: 'pem', type: 'spki' });
  const privatePem = privateKey.export({ format: 'pem', type: 'pkcs8' });

  fs.writeFileSync(path.join(dir, 'public_key.pem'), publicPem);
  fs.writeFileSync(path.join(dir, 'private_key.pem'), privatePem);

  const identity = {
    identity_id,
    created_at: new Date().toISOString(),
    sdna_v0: {
      kind: 'execution_receipt_issuer',
      public_key_pem_sha256: sha256Hex(publicPem),
    },
  };

  fs.writeFileSync(path.join(dir, 'identity.json'), JSON.stringify(identity, null, 2));
  return { identity, public_key_pem: publicPem };
}

function createApiKey({ identity_id }) {
  ensureCoreStateDirs();
  const store = readJsonFileOrDefault(CORE_KEYS_FILE, { keys: [] });
  const api_key_id = `key_${Date.now()}_${randomUUID().slice(0, 8)}`;
  const api_key = `aoi_${randomUUID().replace(/-/g, '')}`;

  const rec = {
    api_key_id,
    api_key_sha256: sha256Hex(api_key),
    identity_id,
    created_at: new Date().toISOString(),
    status: 'active',
  };

  store.keys = Array.isArray(store.keys) ? store.keys : [];
  store.keys.push(rec);
  fs.writeFileSync(CORE_KEYS_FILE, JSON.stringify(store, null, 2));

  return { api_key_id, api_key };
}

function authApiKey(req) {
  const header = req.headers['authorization'] || '';
  const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length).trim() : '';
  if (!token) return { ok: false, error: 'missing bearer token' };

  const store = readJsonFileOrDefault(CORE_KEYS_FILE, { keys: [] });
  const digest = sha256Hex(token);
  const match = (store.keys || []).find(k => k.api_key_sha256 === digest && k.status === 'active');
  if (!match) return { ok: false, error: 'invalid api key' };

  return { ok: true, api_key_id: match.api_key_id, identity_id: match.identity_id };
}

function signReceipt({ identity_id, payload }) {
  const privatePem = loadPrivateKey(identity_id);
  if (!privatePem) throw new Error('identity private key missing');
  const canonical = JSON.stringify(payload);
  const signature = cryptoSign(null, Buffer.from(canonical, 'utf-8'), privatePem).toString('base64');
  return { canonical, signature };
}

function verifyReceiptSignature({ identity_id, payload, signature_b64 }) {
  const publicPem = loadPublicKey(identity_id);
  if (!publicPem) return { ok: false, error: 'identity public key missing' };
  const canonical = JSON.stringify(payload);
  const ok = cryptoVerify(null, Buffer.from(canonical, 'utf-8'), publicPem, Buffer.from(signature_b64, 'base64'));
  return { ok };
}

// --- end AOI Core API v0 state ---

const ALLOWED_SOURCES = ['bazaar', 'clawhub', 'github', 'npm', 'acp'];

const BAZAAR_SKILLS = [
  {
    id: 'AOI-2026-0225-SKILL-001',
    name: 'Whale Sonar',
    description: 'Real-time whale wallet tracking with on-chain pattern detection.',
    author: 'Blue-Eye@aoineco',
    price: '2.50',
    source: 'bazaar',
    sdna_verified: true,
    guardian_pass: true,
    core_temp: 39.2,
    core_temp_badge: '🔥 Hot',
    tags: ['crypto', 'whale-tracking', 'on-chain'],
    downloads: 1842,
    rating: 4.7,
  },
  {
    id: 'AOI-2026-0225-SKILL-002',
    name: 'Prompt Armor',
    description: 'Prompt injection and jailbreak defense with real-time scoring.',
    author: 'Blue-Blade@aoineco',
    price: '0.01',
    source: 'bazaar',
    sdna_verified: true,
    guardian_pass: true,
    core_temp: 40.1,
    core_temp_badge: '🔥 Hot',
    tags: ['security', 'prompt-injection', 'defense'],
    downloads: 3201,
    rating: 4.9,
  },
  {
    id: 'clawhub:edmonddantesj/aoi-hackathon-scout-lite',
    name: 'AOI Hackathon Scout (Lite)',
    description: 'Public-safe hackathon source registry + filtering output (no crawling, no submissions).',
    author: 'edmonddantesj',
    price: '0.00',
    source: 'clawhub',
    sdna_verified: false,
    guardian_pass: false,
    core_temp: 36.8,
    core_temp_badge: '🧊 Frozen',
    tags: ['hackathon', 'registry', 'source-filter', 'community'],
    downloads: 1200,
    rating: 4.4,
    rank_score: 46.2,
    url: 'https://clawhub.ai/edmonddantesj/aoi-hackathon-scout-lite',
  },
  {
    id: 'AOI-2026-0225-SKILL-003',
    name: 'OMNIA Debate Engine',
    description: 'Multi-perspective reasoning engine for structured argument generation.',
    author: 'Blue-Brain@aoineco',
    price: '5.00',
    source: 'bazaar',
    sdna_verified: true,
    guardian_pass: true,
    core_temp: 38.8,
    core_temp_badge: '🌡️ Warm',
    tags: ['reasoning', 'debate', 'decision'],
    downloads: 956,
    rating: 4.5,
  },
];

function execAwal(args) {
  try {
    const result = execSync(`npx -y awal ${args} --json`, {
      timeout: 30000,
      encoding: 'utf-8',
    });
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { error: 'No JSON in output', raw: result };
    return JSON.parse(jsonMatch[0]);
  } catch (e) {
    return { error: e.message };
  }
}

function parseSources(rawValues) {
  const values = rawValues.filter(Boolean).flatMap(v => v.split(',').map(x => x.trim().toLowerCase()));
  const deduped = [...new Set(values)].filter(v => ALLOWED_SOURCES.includes(v));
  return deduped.length > 0 ? deduped : ['bazaar', 'clawhub', 'github', 'npm', 'acp'];
}

function clamp(value, min, max) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function normalizeDownloads(itemCount, boost = 0) {
  const n = Number(itemCount);
  if (!Number.isFinite(n) || n < 0) return Math.max(0, boost);
  return n + boost;
}

function computeCoreTempFromStars(stars, forks) {
  const starScore = Number(stars) || 0;
  const forkScore = Number(forks) || 0;
  const base = 36.5;
  const gain = Math.log10(starScore + 1) * 0.6 + Math.log10(forkScore + 1) * 0.4;
  return clamp(Number((base + gain).toFixed(1)), 36.5, 42);
}

function computeRankScore({ source, core_temp, sdna_verified, guardian_pass, downloads = 0, rating = 0, stargazers_count = 0 }) {
  const trustBias = source === 'bazaar' ? 30 : 8;
  const trustPass = sdna_verified ? 10 : 0;
  const guardianBonus = guardian_pass ? 10 : 0;
  const popularity = Math.min(Math.log10(downloads + 1) * 3, 20);
  const quality = Math.min(rating, 5) * 2;
  const starBonus = Math.min(Math.log10(stargazers_count + 1) * 1.2, 8);

  return clamp(
    trustBias + trustPass + guardianBonus + popularity + quality + starBonus + (core_temp || 36.5),
    0,
    100,
  );
}

function withScore(item) {
  const score = computeRankScore(item);
  return {
    ...item,
    rank_score: Number(score.toFixed(2)),
  };
}

async function searchGithub(query, limit = 10) {
  if (!query) return [];

  const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(`${query} in:name,description`)}&per_page=${Math.min(
    limit,
    10,
  )}`;
  const res = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'nexus-bazaar-demo',
      ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
    },
  });

  if (!res.ok) throw new Error(`GitHub API ${res.status} ${await res.text()}`);
  const payload = await res.json();

  return (payload.items || []).map(item => withScore({
    id: `github:${item.full_name}`,
    name: item.name,
    description: item.description || 'No description',
    author: item.owner?.login || 'unknown',
    price: '0.00',
    source: 'github',
    sdna_verified: false,
    guardian_pass: false,
    core_temp: computeCoreTempFromStars(item.stargazers_count || 0, item.forks_count || 0),
    core_temp_badge: '🧊 Frozen',
    tags: Array.isArray(item.topics) ? item.topics.slice(0, 4) : ['repository'],
    downloads: normalizeDownloads(item.stargazers_count || 0),
    rating: clamp(Number((((item.stargazers_count || 0) / 1200).toFixed(2)), 2.0, 5.0), 2.0, 5.0),
    url: item.html_url,
    stargazers_count: item.stargazers_count || 0,
  }));
}

async function searchNpm(query, limit = 10) {
  if (!query) return [];

  const url = `https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(query)}&size=${Math.min(limit, 10)}`;
  const res = await fetch(url);

  if (!res.ok) throw new Error(`npm API ${res.status} ${await res.text()}`);
  const payload = await res.json();

  return (payload.objects || []).map(obj => {
    const pkg = obj.package;
    const popularity = Number(pkg.score?.detail?.popularity || 0);
    const downloads = Math.max(0, Math.round(popularity * 100000));
    const rating = 4.0;

    return withScore({
      id: `npm:${pkg.name}@${pkg.version}`,
      name: pkg.name,
      description: pkg.description || 'No description',
      author: (pkg.author && (pkg.author.name || pkg.author)) || 'community',
      price: '0.00',
      source: 'npm',
      sdna_verified: false,
      guardian_pass: false,
      core_temp: clamp((qualityToScore(pkg.score?.detail?.quality || 0) + 36.5), 36.5, 42),
      core_temp_badge: '🧊 Frozen',
      tags: Array.isArray(pkg.keywords) ? pkg.keywords.slice(0, 4) : ['npm'],
      downloads,
      rating,
      url: pkg.links?.npm || pkg.links?.homepage || '',
      quality: pkg.score?.detail?.quality || 0,
    });
  });
}

function qualityToScore(value) {
  return Number((Math.max(0, Math.min(1, Number(value))) * 10).toFixed(1));
}

async function searchClawHub(query, limit = 10) {
  const base = (process.env.CLAWHUB_API_URL || process.env.CLAWHUB_SEED_API || '').replace(/\/$/, '');
  if (!query || !base) return [];

  const pathsToTry = ['/api/search', '/search', '/skills/search', '/api/skills/search', '/v1/skills'];

  for (const path of pathsToTry) {
    const endpoint = `${base}${path}`;
    try {
      const url = new URL(endpoint);
      url.searchParams.set('q', query);
      url.searchParams.set('limit', String(Math.min(limit, 10)));
      url.searchParams.set('source', 'nexus');

      const res = await fetch(url.toString(), {
        headers: {
          Accept: 'application/json',
          ...(process.env.CLAWHUB_API_TOKEN ? { Authorization: `Bearer ${process.env.CLAWHUB_API_TOKEN}` } : {}),
        },
      });

      if (!res.ok) {
        if (res.status === 404 || res.status === 405) continue;
        throw new Error(`ClawHub API ${res.status} ${await res.text()}`);
      }

      const payload = await res.json();
      const items = payload.items || payload.skills || payload.data || [];
      if (!Array.isArray(items)) continue;

      return items.slice(0, Math.min(limit, 10)).map(item => {
        const scoreHints = Number(item.downloads || item.stars || item.score || 0);
        return withScore({
          id: item.id || `clawhub:${item.name || item.slug || Math.random()}`,
          name: item.name || item.title || 'Unnamed Skill',
          description: item.description || 'No description',
          author: item.author || 'clawhub',
          price: item.price || '0.00',
          source: 'clawhub',
          sdna_verified: Boolean(item.sdna_verified || item.sdnaVerified),
          guardian_pass: Boolean(item.guardian_pass || item.guardianPass),
          core_temp: clamp(36.5 + Math.min(5, Math.log10(scoreHints + 1) * 0.7), 36.5, 42),
          core_temp_badge: '🧊 Frozen',
          tags: Array.isArray(item.tags) ? item.tags.slice(0, 4) : ['clawhub'],
          downloads: scoreHints || 0,
          rating: clamp(Number(item.rating || 4.0), 2.0, 5.0),
          url: item.url || item.href || '',
          rank_score: Number(item.rank_score || 0),
        });
      });
    } catch (err) {
      // try next endpoint
      continue;
    }
  }

  return [];
}

function sortResults(items) {
  return items.slice().sort((a, b) => {
    if (a.source === 'bazaar' && b.source !== 'bazaar') return -1;
    if (a.source !== 'bazaar' && b.source === 'bazaar') return 1;

    if (b.rank_score !== a.rank_score) return (b.rank_score || 0) - (a.rank_score || 0);
    if (b.core_temp !== a.core_temp) return b.core_temp - a.core_temp;
    return (b.downloads || 0) - (a.downloads || 0);
  });
}

async function findSkillById(skillId) {
  const target = decodeURIComponent(String(skillId || '')).trim();

  const mockMatch = BAZAAR_SKILLS.find(s => s.id === target);
  if (mockMatch) return { ...mockMatch };

  if (!target) return null;

  const tasks = [];
  if (target.startsWith('clawhub:')) {
    const q = target.replace('clawhub:', '').trim();
    const ownerSlug = q.includes('@') ? q : q;
    if (q) tasks.push(searchClawHub(ownerSlug, 10));
  }

  if (target.startsWith('github:')) {
    const repo = target.replace('github:', '').trim();
    if (repo) tasks.push(searchGithub(repo, 10));
  }

  if (target.startsWith('npm:')) {
    const pkg = target.replace('npm:', '').trim().split('@')[0].trim();
    if (pkg) tasks.push(searchNpm(pkg, 10));
  }

  tasks.push(Promise.resolve(BAZAAR_SKILLS.filter(s => s.id === target)));

  return Promise.all(tasks.map(p => p.catch(() => [])))
    .then(groups => groups.flat().find(s => s.id === target) || null);
}

async function runAggregatorSearch(urlObj) {
  const q = (urlObj.searchParams.get('q') || '').trim();
  const limit = Number(urlObj.searchParams.get('limit') || 20);
  const sources = parseSources(urlObj.searchParams.getAll('sources'));

  const calls = [];
  const safeLimit = Math.max(1, Math.min(limit, 50));
  const perSource = Math.max(1, Math.ceil(safeLimit / 3));

  if (sources.includes('bazaar')) {
    calls.push(
      Promise.resolve(
        BAZAAR_SKILLS.slice(0, 5).map(item => withScore({
          ...item,
          rank_score: 100,
          trust_warning: undefined,
        })),
      ),
    );
  }
  if (sources.includes('github')) calls.push(searchGithub(q, perSource));
  if (sources.includes('npm')) calls.push(searchNpm(q, perSource));
  if (sources.includes('clawhub')) calls.push(searchClawHub(q, perSource));
  if (sources.includes('acp')) calls.push(Promise.resolve([]));

  const batches = await Promise.all(
    calls.map(p =>
      p.catch(err => {
        console.error('aggregator search error:', err.message);
        return [];
      }),
    ),
  );

  const merged = batches.flat().filter(Boolean);
  const scored = merged.map(item =>
    item.rank_score === undefined || Number.isNaN(item.rank_score) ? withScore(item) : item,
  );

  const results = sortResults(scored).slice(0, safeLimit);

  return {
    query: q,
    count: results.length,
    total: results.length,
    source: sources,
    sources_searched: sources,
    results,
  };
}

const routes = {
  '/api/awal/status': () => execAwal('status'),
  '/api/awal/balance': () => execAwal('balance --chain base-sepolia'),
  '/api/awal/address': () => execAwal('address'),
};

function loadWorkflowsRegistry() {
  try {
    ensureCoreStateDirs();
    const registryPath = path.join(CORE_STATE_DIR, 'workflows.json');
    if (!fs.existsSync(registryPath)) {
      return { version: 'v0.0', workflows: [] };
    }
    return JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
  } catch {
    return { version: 'v0.0', workflows: [] };
  }
}

// --- public demo helpers (no auth) ---
// This is intentionally read-only and hard-capped.
const DEMO_RATE_WINDOW_MS = 60_000;
const DEMO_RATE_MAX = 8; // per IP per minute
const demoRate = new Map();

function getClientIp(req) {
  const xf = req.headers['x-forwarded-for'];
  if (typeof xf === 'string' && xf.trim()) return xf.split(',')[0].trim();
  return req.socket?.remoteAddress || 'unknown';
}

function demoRateAllow(ip) {
  const now = Date.now();
  const rec = demoRate.get(ip) || { start: now, count: 0 };
  if (now - rec.start > DEMO_RATE_WINDOW_MS) {
    rec.start = now;
    rec.count = 0;
  }
  rec.count += 1;
  demoRate.set(ip, rec);
  return rec.count <= DEMO_RATE_MAX;
}

// --- end public demo helpers ---


function writeJson(res, payload, statusCode = 200) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');

  // CORS + preflight
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'content-type,authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  if (req.method === 'GET' && req.url?.startsWith('/api/aggregator/search')) {
    try {
      const payload = await runAggregatorSearch(url);
      return writeJson(res, payload);
    } catch (error) {
      return writeJson(res, { error: error.message }, 500);
    }
  }

  if (req.method === 'GET' && req.url?.startsWith('/api/aggregator/skill/')) {
    const rawId = req.url.replace('/api/aggregator/skill/', '').split('?')[0] || '';
    const targetId = decodeURIComponent(rawId);
    try {
      const skill = await findSkillById(targetId);
      if (!skill) {
        return writeJson(res, { error: 'skill not found', skill_id: targetId }, 404);
      }
      return writeJson(res, {
        id: targetId,
        skill,
      });
    } catch (error) {
      return writeJson(res, { error: error.message }, 500);
    }
  }

  if (req.method === 'POST' && req.url?.startsWith('/api/aggregator/clickout')) {
    try {
      const payload = await readBodyJson(req);
      const logged = {
        event_id: `co_${Date.now()}_${randomUUID().slice(0, 8)}`,
        logged: true,
        timestamp: new Date().toISOString(),
        ...payload,
      };
      console.log('clickout', logged);
      return writeJson(res, logged, 200);
    } catch (error) {
      return writeJson(res, { error: error.message }, 400);
    }
  }

  // --- AOI Core API v0 endpoints ---
  if (req.method === 'POST' && url.pathname === '/api/core/identity/create') {
    try {
      const created = createIdentity();
      return writeJson(res, { ok: true, ...created }, 200);
    } catch (e) {
      return writeJson(res, { ok: false, error: e.message }, 500);
    }
  }

  if (req.method === 'POST' && url.pathname === '/api/core/apikey/create') {
    try {
      const payload = await readBodyJson(req);
      const identity_id = payload.identity_id;
      if (!identity_id) return writeJson(res, { ok: false, error: 'identity_id required' }, 400);
      if (!loadPublicKey(identity_id)) return writeJson(res, { ok: false, error: 'unknown identity_id' }, 404);
      const key = createApiKey({ identity_id });
      return writeJson(res, { ok: true, identity_id, ...key }, 200);
    } catch (e) {
      return writeJson(res, { ok: false, error: e.message }, 500);
    }
  }

  if (req.method === 'GET' && url.pathname === '/api/core/workflows') {
    const reg = loadWorkflowsRegistry();
    return writeJson(res, { ok: true, ...reg }, 200);
  }

  // Public demo endpoint: run + verify without API keys.
  // Hard-capped, read-only, rate-limited. Suitable for Base Batches tester onboarding.
  if (req.method === 'POST' && url.pathname === '/api/demo/runverify') {
    try {
      const ip = getClientIp(req);
      if (!demoRateAllow(ip)) return writeJson(res, { ok: false, error: 'rate_limited' }, 429);

      const payload = await readBodyJson(req);
      const token_address = payload.token_address || '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
      const lookback_blocks = Math.min(25, Math.max(1, Number(payload.lookback_blocks ?? 10) || 10));

      // 1) create identity + key
      const created = createIdentity();
      const identity_id = created.identity.identity_id;
      const key = createApiKey({ identity_id });

      // 2) run
      const runReq = {
        workflow: 'erc20_transfer_alert',
        token_address,
        lookback_blocks,
        // Force public demo to use BASE_RPC_URL; disallow arbitrary rpc_url injection.
      };

      // Reuse the authenticated endpoint by calling handler logic directly via HTTP would be messy;
      // simplest is to call our own API internally.
      // We'll emulate it by making a local HTTP request.
      const runRes = await fetch(`http://127.0.0.1:${PORT}/api/core/run`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'authorization': `Bearer ${key.api_key}`,
        },
        body: JSON.stringify(runReq),
      });
      const runJson = await runRes.json();
      if (!runRes.ok || !runJson?.ok) {
        return writeJson(res, { ok: false, stage: 'run', upstream_status: runRes.status, upstream: runJson }, 502);
      }

      // 3) verify
      const verRes = await fetch(`http://127.0.0.1:${PORT}/api/core/verify`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ receipt: runJson.receipt }),
      });
      const verJson = await verRes.json();

      return writeJson(res, {
        ok: true,
        verified: !!verJson?.verified,
        receipt_id: runJson.receipt?.receipt_id,
        duration_ms: runJson.receipt?.duration_ms,
        cost_usd: runJson.receipt?.cost_usd,
        transfer_events_found: runJson.receipt?.result?.summary?.transfer_events_found,
        evidence: {
          receipt: runJson.receipt,
          verify: verJson,
        },
      }, 200);
    } catch (e) {
      return writeJson(res, { ok: false, error: e?.message || String(e) }, 500);
    }
  }

  if (req.method === 'POST' && url.pathname === '/api/core/run') {
    try {
      const auth = authApiKey(req);
      if (!auth.ok) return writeJson(res, { ok: false, error: auth.error }, 401);

      const payload = await readBodyJson(req);
      const workflow = payload.workflow || 'erc20_transfer_alert';

      const t0 = Date.now();
      if (workflow !== 'erc20_transfer_alert') return writeJson(res, { ok: false, error: 'unsupported workflow' }, 400);

      // Inputs (read-only): token contract + last N blocks to scan
      const token_address = payload.token_address;
      if (!token_address) return writeJson(res, { ok: false, error: 'token_address required' }, 400);

      const lookback_blocks = Number(payload.lookback_blocks ?? 200);
      let safeLookback = Math.max(1, Math.min(2000, Number.isFinite(lookback_blocks) ? lookback_blocks : 200));

      // Core policy decision (v0): read-only allowed
      const policy = {
        decision: 'ALLOW',
        mode: 'READ_ONLY',
        capability_manifest: {
          chain_read: ['base'],
          wallet_tx: false,
          network: ['base-rpc'],
          secrets: false,
        },
      };

      const rpcUrl = payload.rpc_url || process.env.BASE_RPC_URL || 'https://mainnet.base.org';

      // Provider-specific guardrails (free tiers often cap eth_getLogs ranges).
      if (rpcUrl.includes('alchemy.com')) {
        safeLookback = Math.min(safeLookback, 10);
      }

      const client = createPublicClient({ chain: base, transport: viemHttp(rpcUrl) });
      const latest = await client.getBlockNumber();

      // Inclusive range size should be <= safeLookback blocks.
      const span = BigInt(Math.max(1, safeLookback));
      const fromBlock = latest >= (span - 1n) ? latest - (span - 1n) : 0n;

      const transferEvent = parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)');
      const logs = await client.getLogs({
        address: token_address,
        event: transferEvent,
        fromBlock,
        toBlock: latest,
      });

      const summary = {
        token_address,
        scanned_blocks: safeLookback,
        from_block: fromBlock.toString(),
        to_block: latest.toString(),
        transfer_events_found: logs.length,
        sample: logs.slice(0, 3).map(l => ({
          blockNumber: l.blockNumber?.toString?.() ?? null,
          transactionHash: l.transactionHash,
          args: l.args ? { from: l.args.from, to: l.args.to, value: l.args.value?.toString?.() ?? String(l.args.value) } : null,
        })),
      };

      const duration_ms = Math.max(0, Date.now() - t0);

      // Cost estimate (v0): placeholder. We record it explicitly so cost/run becomes a first-class metric.
      // In v1, replace with real metering (RPC provider cost, model tokens, vendor fees, etc.)
      const cost_usd = 0.0;

      const receipt_payload = {
        receipt_version: 'v0.1',
        receipt_id: `rcpt_${Date.now()}_${randomUUID().slice(0, 8)}`,
        workflow,
        identity_id: auth.identity_id,
        api_key_id: auth.api_key_id,
        issued_at: new Date().toISOString(),
        nonce: randomUUID(),
        ttl_seconds: 300,
        duration_ms,
        cost_usd,
        policy,
        inputs_hash: sha256Hex(JSON.stringify({ workflow, token_address, safeLookback, rpcUrl })),
        outputs_hash: sha256Hex(JSON.stringify(summary)),
        result: { ok: true, summary },
      };

      const signed = signReceipt({ identity_id: auth.identity_id, payload: receipt_payload });
      const receipt = {
        ...receipt_payload,
        signature_b64: signed.signature,
      };

      ensureCoreStateDirs();
      appendJsonl(CORE_RECEIPTS_JSONL, receipt);

      // Optional Telegram alert (best-effort)
      try {
        const bot = process.env.TELEGRAM_BOT_TOKEN;
        const chat = process.env.TELEGRAM_CHAT_ID;
        if (!bot || !chat) {
          console.log('telegram:skip', { has_bot: !!bot, has_chat: !!chat });
        } else {
          const text = `[AOI] ERC20 Transfer Alert\nToken: ${token_address}\nBlocks: ${summary.from_block}~${summary.to_block}\nEvents: ${summary.transfer_events_found}`;
          const tgRes = await fetch(`https://api.telegram.org/bot${bot}/sendMessage`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ chat_id: chat, text }),
          });
          const tgBody = await tgRes.text();
          console.log('telegram:send', { ok: tgRes.ok, status: tgRes.status, body: tgBody.slice(0, 200) });
        }
      } catch (e) {
        console.log('telegram:error', { error: e?.message || String(e) });
      }

      return writeJson(res, { ok: true, receipt }, 200);
    } catch (e) {
      return writeJson(res, { ok: false, error: e.message }, 500);
    }
  }

  if (req.method === 'GET' && url.pathname === '/api/core/telegram/status') {
    return writeJson(res, {
      ok: true,
      has_bot: !!process.env.TELEGRAM_BOT_TOKEN,
      has_chat: !!process.env.TELEGRAM_CHAT_ID,
      chat_id_preview: process.env.TELEGRAM_CHAT_ID ? String(process.env.TELEGRAM_CHAT_ID).slice(0, 4) + '…' : null,
    }, 200);
  }

  if (req.method === 'POST' && url.pathname === '/api/core/telegram/test') {
    try {
      const bot = process.env.TELEGRAM_BOT_TOKEN;
      const chat = process.env.TELEGRAM_CHAT_ID;
      if (!bot || !chat) return writeJson(res, { ok: false, error: 'missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID' }, 400);
      const payload = await readBodyJson(req);
      const text = payload.text || '[AOI] telegram test';
      const tgRes = await fetch(`https://api.telegram.org/bot${bot}/sendMessage`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ chat_id: chat, text }),
      });
      const tgBody = await tgRes.text();
      return writeJson(res, { ok: tgRes.ok, status: tgRes.status, body: tgBody }, 200);
    } catch (e) {
      return writeJson(res, { ok: false, error: e?.message || String(e) }, 500);
    }
  }

  if (req.method === 'POST' && url.pathname === '/api/core/verify') {
    try {
      const payload = await readBodyJson(req);
      const receipt = payload.receipt;
      if (!receipt) return writeJson(res, { ok: false, error: 'receipt required' }, 400);

      const { signature_b64, ...unsigned } = receipt;
      if (!signature_b64) return writeJson(res, { ok: false, error: 'signature_b64 missing' }, 400);
      if (!unsigned.identity_id) return writeJson(res, { ok: false, error: 'identity_id missing' }, 400);

      const verified = verifyReceiptSignature({ identity_id: unsigned.identity_id, payload: unsigned, signature_b64 });
      if (!verified.ok) return writeJson(res, { ok: false, verified: false, error: verified.error || 'bad signature' }, 200);

      return writeJson(res, { ok: true, verified: true }, 200);
    } catch (e) {
      return writeJson(res, { ok: false, error: e.message }, 500);
    }
  }
  // --- end AOI Core API v0 endpoints ---

  const direct = routes[req.url];
  if (direct && req.method === 'GET') {
    const data = direct();
    return writeJson(res, data);
  }



  // Static SPA fallback (for refresh / direct link: /skill/:id)
  // If `dist/` exists (after `npm run build`), serve index.html for unknown routes.
  if (req.method === 'GET' && !req.url?.startsWith('/api/')) {
    try {
      const requestPath = url.pathname;
      const hasExtension = path.extname(requestPath) !== '';

      const filePath = hasExtension
        ? path.join(DIST_DIR, requestPath)
        : path.join(DIST_DIR, 'index.html');

      const safePath = path.normalize(filePath);
      if (!safePath.startsWith(path.normalize(DIST_DIR))) {
        res.statusCode = 400;
        return res.end('bad path');
      }

      if (fs.existsSync(safePath)) {
        const data = fs.readFileSync(safePath);
        const ext = path.extname(safePath).toLowerCase();
        const contentType =
          ext === '.html'
            ? 'text/html; charset=utf-8'
            : ext === '.js'
              ? 'application/javascript; charset=utf-8'
              : ext === '.css'
                ? 'text/css; charset=utf-8'
                : ext === '.svg'
                  ? 'image/svg+xml'
                  : ext === '.png'
                    ? 'image/png'
                    : ext === '.jpg' || ext === '.jpeg'
                      ? 'image/jpeg'
                      : 'application/octet-stream';

        res.statusCode = 200;
        res.setHeader('Content-Type', contentType);
        return res.end(data);
      }

      // if dist missing or asset missing, fallthrough to JSON 404
    } catch (e) {
      // fallthrough
    }
  }

  res.statusCode = 404;
  writeJson(res, { error: 'not found' });
});

server.listen(PORT, () => {
  console.log(`bazaar bridge running on http://localhost:${PORT}`);
});
