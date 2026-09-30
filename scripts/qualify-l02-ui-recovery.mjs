#!/usr/bin/env node
// Synthetic browser qualification: real React UI, mocked plugin bridge, no host writes or model calls.
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = resolve(process.env.PAPERCLIP_SOURCE ?? resolve(root, "../paperclip"));
const home = resolve(root, ".paperclip-dev");
mkdirSync(home, { recursive: true });
const { chromium, expect } = createRequire(resolve(source, "package.json"))("@playwright/test");
const { build } = createRequire(resolve(root, "packages/executive/package.json"))("esbuild");
const bundle = await build({
  stdin: {
    contents: 'import React from "react"; import {createRoot} from "react-dom/client"; import {ExecutivePage} from "./src/ui/index.tsx"; createRoot(document.getElementById("root")).render(<ExecutivePage context={{companyId:"synthetic-company"}} />);',
    resolveDir: resolve(root, "packages/executive"), loader: "tsx",
  },
  bundle: true, write: false, format: "iife", platform: "browser", jsx: "automatic",
  plugins: [{ name: "synthetic-plugin-bridge", setup(api) {
    api.onResolve({ filter: /^@paperclipai\/plugin-sdk\/ui$/ }, () => ({ path: "bridge", namespace: "synthetic" }));
    api.onLoad({ filter: /.*/, namespace: "synthetic" }, () => ({
      resolveDir: resolve(root, "packages/executive"), loader: "js",
      contents: `import {useState,useCallback} from "react";
        export function usePluginData() {
          const [data,setData]=useState(()=>structuredClone(window.fixture));
          const refresh=useCallback(()=>{ window.refreshes++; setData(structuredClone(window.fixture)); },[]);
          return {data,refresh,loading:false,error:null};
        }
        export function usePluginAction(name) { return async args=>{
          if(name!=="submit-contribution") throw Error("Unexpected synthetic action");
          window.actions.push(args);
          window.fixture.contributions=[{...window.contribution,requestKey:args.requestKey}];
          throw Error("Synthetic failure after durable claim");
        }; }`,
    }));
  } }],
});
const browser = await chromium.launch({ headless: true, executablePath: process.env.PAPERCLIP_BROWSER_EXECUTABLE });
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 1000 } });
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.clock.install({ time: new Date("2026-09-30T12:00:00Z") });
  await page.setContent('<div id="root"></div>');
  await page.evaluate(() => {
    const now = new Date().toISOString();
    window.refreshes = 0; window.actions = [];
    window.fixture = { configuration: { configured: false, revision: 0, executiveAgentId: null, agentStatus: null, available: false, reason: "Synthetic fixture" }, requests: [], contributions: [] };
    window.contribution = {
      companyId: "synthetic-company", contributionId: "synthetic-contribution", requestKey: "pending", inputVersion: 1,
      issue: { id: "issue", identifier: "SYN-1", title: "Synthetic ticket", status: "todo", executorAgentId: "executor", updatedAt: now },
      source: { reference: "SYN-1", objective: "Bounded review", acceptanceCriteria: ["Copy ID"], exclusions: ["No backend"], dependencies: [] },
      approach: { summary: "Use clipboard", evidenceReferences: [], decisiveUnknowns: [], constraints: [] },
      contributor: { agentId: "reviewer", name: "Synthetic reviewer" }, method: { id: "synthetic", version: "1" },
      status: "outcome_unknown", sessionId: "synthetic-session", runId: "synthetic-run", updatedAt: now, result: null, error: "Synthetic uncertain outcome",
    };
    window.completedResult = { recommendation: "Synthetic completion recovered", perspectiveNotes: { product: "Bounded", technical: "Bounded", delivery_cost: "Unknown" }, findings: [], assumptions: [], limitations: ["Synthetic UI evidence only"] };
  });
  await page.addScriptTag({ content: bundle.outputFiles[0].text });
  const form = page.locator('section[aria-labelledby="contribution-title"]');
  for (const field of await form.locator("input[required], textarea[required]").all()) await field.fill("Synthetic supplied input");
  const key = await form.locator("code").innerText();
  await form.getByRole("button", { name: "Request one contribution", exact: true }).click();
  await expect(page.getByText("Synthetic failure after durable claim", { exact: true })).toBeVisible();
  await expect(page.getByText("Status: Outcome unknown", { exact: true })).toBeVisible();
  await expect(form.getByRole("textbox", { name: "Proposed approach", exact: true })).toHaveValue("Synthetic supplied input");
  assert.equal(await form.locator("code").innerText(), key);
  assert.equal(await page.evaluate(() => window.actions.length), 1);

  // The backend changes, but only the UI polling bridge may fetch and render it.
  await page.evaluate(() => { Object.assign(window.fixture.contributions[0], { status: "completed", error: null, result: window.completedResult }); });
  await page.clock.runFor(2500);
  await expect(page.getByText("Synthetic completion recovered", { exact: true })).toBeVisible();

  // A fresh uncertain record stops polling after the fixed two-minute deadline.
  await page.evaluate(() => { window.fixture.contributions = [{ ...window.contribution, updatedAt: new Date().toISOString() }]; });
  await page.getByRole("button", { name: "Refresh history", exact: true }).click();
  await expect(page.getByText("Status: Outcome unknown", { exact: true })).toBeVisible();
  await page.clock.runFor(125_000);
  const afterBound = await page.evaluate(() => window.refreshes);
  await page.clock.runFor(10_000);
  assert.equal(await page.evaluate(() => window.refreshes), afterBound, "Uncertain polling must stop at its deadline");
  await page.evaluate(() => { Object.assign(window.fixture.contributions[0], { status: "completed", error: null, result: window.completedResult }); });
  await page.getByRole("button", { name: "Refresh history", exact: true }).click();
  await expect(page.getByText("Synthetic completion recovered", { exact: true })).toBeVisible();
  assert.equal(await page.evaluate(() => window.actions.length), 1, "Refresh must never resubmit");
  assert.deepEqual(errors, []);
  await page.screenshot({ path: resolve(home, "l02-ui-recovery-synthetic.png"), fullPage: true });
  const result = { checkedAt: new Date().toISOString(), mode: "synthetic-browser", checks: ["partial-success error refresh", "input/key/error preserved", "later correlated completion displayed", "unknown polling stops after two minutes", "manual refresh after deadline", "no resubmit"], pageErrors: errors, status: "pass", limitation: "Mocked plugin bridge; no native persistence or model execution proof" };
  writeFileSync(resolve(home, "l02-ui-recovery-synthetic.json"), JSON.stringify(result, null, 2) + "\n");
  console.log(JSON.stringify(result, null, 2));
} finally { await browser.close(); }
