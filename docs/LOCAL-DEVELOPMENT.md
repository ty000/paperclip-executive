# Local development and integration acceptance

Use two separate Paperclip instances. Executive development belongs to this
checkout; cross-project acceptance belongs to the shared Paperclip instance.
They share host source code, not databases, companies, sessions, or secrets.

| Environment | Purpose | UI / API | Data |
| --- | --- | --- | --- |
| `executive-dev` | Build and qualify Executive changes locally | `http://127.0.0.1:3220` | `.paperclip-dev/` in this checkout |
| `council-local` | Shared acceptance for Executive, Council, and Paperclip | `http://127.0.0.1:3210` | Existing `~/.paperclip/instances/council-local/` |

The development launcher uses the existing sibling `../paperclip` checkout.
Set `PAPERCLIP_SOURCE` to select another installed checkout. The initial host
revision is `61b3fd57a695614dc4a37e2303f426a34a9795cf`, matching the packaged SDK.
This is a development convenience, not an immutable acceptance deployment:
changing shared host source can affect both environments on reload/restart.
Record the host revision and plugin candidate when qualifying a change.

## Start and install

Prerequisites: Node 24, pnpm 9.15.4, and installed dependencies in the Paperclip
host and `packages/executive`. No second Paperclip clone or Docker stack is needed.
Run from this repository root:

```sh
pnpm --dir packages/executive build
node scripts/dev-paperclip.mjs start
```

In another terminal, run the one-time bootstrap:

```sh
node scripts/dev-paperclip.mjs setup
```

The launcher creates an authenticated, loopback-only instance with its own
embedded PostgreSQL on port `54349`; the host UI uses HMR port `13220`.
The setup command creates a local test owner, claims the new instance through
the native API, creates `Executive Dev`, installs the built local plugin, and
reads its health back. Repeating setup reuses that owner, company, and installation.
It does not upgrade an existing plugin installation.

Sign in at `http://127.0.0.1:3220` using the generated development credentials in
`.paperclip-dev/dev-owner.json` (mode `0600`). These are local test credentials,
not an existing account. Keep the entire ignored `.paperclip-dev/` directory
private: it contains the database, authentication secret, logs, and local proofs.
It is disposable development data with automatic backups disabled.

No provider credentials are copied. The heartbeat scheduler is disabled, and
setup creates no agents or issues and sends no model requests. Real contributor
configuration and execution are separate qualification steps.

## Development loop

```sh
pnpm --dir packages/executive dev
```

Paperclip watches the installed local package's built worker and manifest.
Reload the Executive page after UI rebuilds. Source files alone are not the
installed artifact; rebuild before evaluating a change. The optional plugin UI
HMR server is unnecessary for this initial loop.

Stop this instance with Ctrl-C in its foreground terminal, or, on WSL/Linux:

```sh
node scripts/dev-paperclip.mjs stop
```

Restart with `start`; data is retained. No system service or login autostart is
installed. The existing `paperclipai-council-local.service` is independent.
The `cli` subcommand uses the development instance's isolated home and default
API target; explicit CLI target overrides still take precedence.

## Qualification boundary

First validate local installation, worker/data bridge, and actual browser
rendering. Then qualify a prepared ticket with an explicitly configured native
contributor, checking persisted request/run attribution and returned output.
An installed or healthy plugin alone does not prove L02 end to end.

Promote a reviewed, identifiable plugin candidate to shared acceptance only
when ready to test cross-project contracts. Keep the shared instance off the
active development build watcher; record its installed artifact and host revision.
Council decision effects remain later work, outside L02's advisory contribution.

Local setup readback is saved in `.paperclip-dev/setup-result.json`.

## Initial verification — 2026-09-30

- Plugin build and launcher syntax checks passed.
- Native installation returned `ready` / `healthy`; the worker data bridge
  returned HTTP 200 with empty advice and contribution histories.
- A real headless Chromium session authenticated and rendered the Executive
  page, including the L02 contribution form. Direct advice was disabled while
  unconfigured; no uncaught page errors were observed.
- Stop/start and repeated setup preserved the company and installed plugin IDs;
  the data bridge and browser smoke check passed again after restart.
- Shared acceptance retained its existing API and database processes.

Frontend QA verdict: **pass for the initial empty-state smoke check; partial
for L02 overall**. No contribution was submitted and no model run was performed.
The check is not a full usability, accessibility, responsive, or design review;
no separate design-system or Impeccable guardrail applies to this bootstrap.
Local browser evidence and its replay script are in
`.paperclip-dev/browser-result.json`, `.paperclip-dev/executive-page.png`, and
`.paperclip-dev/browser-smoke.mjs` (machine-specific cached browser path).

The subsequent real L02 journey, duplicate/conflict checks, completed-result restart
and browser qualification are recorded in [IMPLEMENTATION-L02.md](IMPLEMENTATION-L02.md).
