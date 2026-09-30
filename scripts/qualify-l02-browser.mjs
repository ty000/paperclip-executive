#!/usr/bin/env node
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = resolve(process.env.PAPERCLIP_SOURCE ?? resolve(root, "../paperclip"));
const home = resolve(root, ".paperclip-dev");
const contributionId = process.argv[2];
assert(contributionId, "Usage: node scripts/qualify-l02-browser.mjs <completed-contribution-id>");
const { chromium } = createRequire(resolve(source, "package.json"))("@playwright/test");
const setup = JSON.parse(readFileSync(resolve(home, "setup-result.json"), "utf8"));
const base = "http://127.0.0.1:3220";
assert.equal(setup.baseUrl, base);
const browser = await chromium.launch({ headless: true, executablePath: process.env.PAPERCLIP_BROWSER_EXECUTABLE });
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1100 } });
  const auth = await context.request.post(base + "/api/auth/sign-in/email", {
    headers: { origin: base }, data: JSON.parse(readFileSync(resolve(home, "dev-owner.json"), "utf8")),
  });
  assert.equal(auth.status(), 200);
  const companiesResponse = await context.request.get(base + "/api/companies");
  assert.equal(companiesResponse.status(), 200);
  const company = (await companiesResponse.json()).find(c => c.id === setup.companyId);
  assert(company);
  const state = await context.request.post(base + `/api/plugins/${setup.pluginId}/data/advice-state`, {
    headers: { origin: base }, data: { companyId: company.id, params: { companyId: company.id } },
  });
  assert.equal(state.status(), 200);
  const contribution = (await state.json()).data.contributions.find(c => c.contributionId === contributionId);
  assert.equal(contribution?.status, "completed");
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto(base + `/${company.issuePrefix}/plugins/${setup.pluginId}`);
  const article = page.locator("article").filter({ hasText: contribution.requestKey });
  await article.getByText("Status: completed", { exact: true }).waitFor();
  assert((await article.innerText()).includes(contribution.runId));
  assert((await article.innerText()).includes(contribution.result.recommendation));
  await article.locator("summary").click();
  await article.getByText(contribution.source.reference, { exact: false }).waitFor();
  assert((await article.innerText()).includes(contribution.approach.summary));
  await article.screenshot({ path: resolve(home, "l02-completed.png") });
  await page.reload();
  await article.getByText("Status: completed", { exact: true }).waitFor();
  assert.deepEqual(errors, []);
  const result = { checkedAt: new Date().toISOString(), contributionId, runId: contribution.runId, url: page.url(), checks: ["completed result", "attribution", "expand captured snapshot", "reload"], pageErrors: errors, status: "pass" };
  writeFileSync(resolve(home, "l02-browser-result.json"), JSON.stringify(result, null, 2) + "\n", { mode: 0o600 });
  console.log(JSON.stringify(result, null, 2));
} finally { await browser.close(); }
