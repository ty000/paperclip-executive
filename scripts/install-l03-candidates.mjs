#!/usr/bin/env node
// Install the bounded L03 candidates through native plugin lifecycle APIs, preserving L02 data.
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const base = 'http://127.0.0.1:3220';
const l02 = '331bf268-b21e-4874-9a3c-2137415c7e08';
const councilPath = '/home/davy-lp/workspace/paperclip-council-l03';
let cookie = '';
async function api(method, path, body) {
  const r = await fetch(base + path, { method, headers: { origin: base, cookie, 'content-type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(60_000) });
  const cookies = r.headers.getSetCookie();
  if (cookies.length) cookie = cookies.map(c => c.split(';')[0]).join('; ');
  const value = await r.json();
  if (!r.ok) throw new Error(`${method} ${path}: HTTP ${r.status}: ${JSON.stringify(value)}`);
  return value;
}
const health = await api('GET', '/api/health');
assert.equal(health.commit, '61b3fd57a695614dc4a37e2303f426a34a9795cf');
assert.equal(health.deploymentMode, 'authenticated');
assert.equal(health.deploymentExposure, 'private');
const args = readFileSync('/proc/1074721/cmdline', 'utf8').split('\0');
assert(args.includes('executive-dev'));
assert(args.includes('/home/davy-lp/workspace/paperclip-executive/.paperclip-dev/instances/executive-dev/config.json'));
assert(readFileSync('/proc/1074721/environ', 'utf8').split('\0').includes('HEARTBEAT_SCHEDULER_ENABLED=false'));
await api('POST', '/api/auth/sign-in/email', JSON.parse(readFileSync('/home/davy-lp/workspace/paperclip-executive/.paperclip-dev/dev-owner.json', 'utf8')));
const beforeRuns = await api('GET', `/api/companies/${l02}/heartbeat-runs?limit=1000`);
assert(beforeRuns.every(r => !['running', 'queued'].includes(r.status)));
const beforeAgents = await api('GET', `/api/companies/${l02}/agents`);
const installed = await api('GET', '/api/plugins');
const priorExecutive = installed.find(p => p.pluginKey === 'paperclip-executive.executive') ?? await api('GET', '/api/plugins/2f5ead19-69e1-4065-9fe4-93bd7699e510');
if (!installed.some(p=>p.id===priorExecutive.id)) installed.push(priorExecutive);
const l02Before = priorExecutive.status === 'ready' ? await api('POST', `/api/plugins/${priorExecutive.id}/data/advice-state`, {companyId:l02,params:{companyId:l02}}) : null;
const configBefore = await api('GET', `/api/plugins/${priorExecutive.id}/config?companyId=${l02}`);
const candidates = [
  { key: 'paperclip-executive.executive', path: resolve(root, 'packages/executive'), version: '0.3.0' },
  { key: 'private.paperclip-council', path: councilPath, version: '0.5.0' },
];
const results = [];
for (const candidate of candidates) {
  const prior = installed.find(p => p.pluginKey === candidate.key);
  assert.equal(JSON.parse(readFileSync(resolve(candidate.path, 'package.json'), 'utf8')).version, candidate.version);
  let result;
  if (prior?.packagePath === candidate.path && prior.version === candidate.version && prior.status === 'ready') {
    result = prior;
    if (process.argv.includes('--reload')) {
      await api('POST', `/api/plugins/${prior.id}/disable`, {});
      result = await api('POST', `/api/plugins/${prior.id}/enable`, {});
    }
  } else {
    if (prior && prior.status !== 'uninstalled') {
      // Host's soft-uninstall/reinstall preserves ID, private namespace, migrations and config.
      // Required because upgrade cannot change the local source path or approve new capabilities.
      const removed = await api('DELETE', `/api/plugins/${prior.id}?purge=false`);
      assert.equal(removed.status, 'uninstalled');
    }
    result = await api('POST', '/api/plugins/install', { packageName: candidate.path, isLocalPath: true });
    if (prior) assert.equal(result.id, prior.id);
  }
  assert.equal(result.status, 'ready'); assert.equal(result.version, candidate.version);
  results.push({ key: candidate.key, id: result.id, path: result.packagePath, version: result.version, status: result.status,
    workerSha256: createHash('sha256').update(readFileSync(resolve(candidate.path, 'dist/worker.js'))).digest('hex'),
    manifestSha256: createHash('sha256').update(readFileSync(resolve(candidate.path, 'dist/manifest.js'))).digest('hex') });
}
const l02After = await api('POST', `/api/plugins/${priorExecutive.id}/data/advice-state`, {companyId:l02,params:{companyId:l02}});
if (l02Before) for (const key of ['requests','contributions']) assert.deepEqual(l02After.data[key], l02Before.data[key]);
assert(l02After.data.contributions.some(c => c.contributionId === '7201f796-70bb-489b-9685-e400aecdd651' && c.status === 'completed'));
assert.deepEqual(await api('GET', `/api/plugins/${priorExecutive.id}/config?companyId=${l02}`), configBefore);
const afterRuns = await api('GET', `/api/companies/${l02}/heartbeat-runs?limit=1000`);
const afterAgents = await api('GET', `/api/companies/${l02}/agents`);
assert.deepEqual(afterRuns.map(r => [r.id, r.status]).sort(), beforeRuns.map(r => [r.id, r.status]).sort());
assert.deepEqual(afterAgents.map(a => [a.id, a.status]).sort(), beforeAgents.map(a => [a.id, a.status]).sort());
const evidence = { observedAt: new Date().toISOString(), host: { base, commit: health.commit, instance: 'executive-dev', schedulerEnabled: false }, candidates: results,
  l02Preserved: { companyId: l02, runIds: afterRuns.map(r => r.id), agentIds: afterAgents.map(a => a.id) }, providerCalls: 0, note: 'Installed and ready is not model execution or effective profile-load proof.' };
writeFileSync(resolve(root, 'docs/evidence/l03-installed.json'), JSON.stringify(evidence, null, 2) + '\n');
console.log(JSON.stringify(evidence, null, 2));
