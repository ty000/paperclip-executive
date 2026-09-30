# Paperclip Executive plugin

This external Paperclip plugin implements the L01 direct-advice slice and the locally validated L02
prepared-ticket contribution slice. An authenticated company
owner binds an existing agent, submits a question, and can inspect the persisted session/run status,
structured recommendation, assumptions, limitations, failure, or uncertain outcome.

For L02, an authenticated company owner selects a company-scoped Paperclip issue with an assigned
executor, supplies a prepared Linear reference/content snapshot and proposed approach, and selects
an existing dispatchable contributor distinct from that executor. One immutable, versioned request
is persisted before one native session dispatch. Its structured result includes a recommendation,
product/technical/delivery-cost notes, classified findings (`must_fix`, `useful_now`, `defer`),
evidence/reasons, assumptions, and limitations. Zero `must_fix` findings is valid.

The package never recruits, reconciles, resumes, or activates an agent automatically. It creates no
issues or other native work. Plugin workers and UI are trusted same-origin code; installation is an
explicit trust decision, not a sandbox boundary.

L02 reads an issue and agent through company-scoped SDK calls but never updates the issue, wakes its
executor, recruits or activates an agent, calls Council, or contacts Linear/OpenExecutive. Supplied
Linear content is not synchronized data. Duplicate request keys return the captured operation;
changed input conflicts, and uncertain dispatch is exposed without automatic retry or output repair.

## Development

Requirements: Node.js 24 or later and pnpm 9.

```bash
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
pnpm build
```

The checked-in `.paperclip-sdk` tarballs are a scaffold snapshot from Paperclip revision
`61b3fd57a695614dc4a37e2303f426a34a9795cf`; the package does not require a machine-specific path.
To deliberately refresh the snapshot against another compatible checkout, rerun the native scaffold
or pack the SDK from that checkout, review the resulting tarballs and lockfile, then repeat all checks.
An npm version string alone does not establish compatibility with this host contract.

For local development, `pnpm dev` watches the worker, manifest, and UI bundles in `dist/`.
Installation is intentionally not part of local L01/L02 verification. On an explicitly selected compatible
Paperclip instance, the later operator command would be:

```bash
paperclipai plugin install "$(pwd)"
```

After installation, an operator must inspect readiness, explicitly provision or select an agent,
activate it under an approved adapter/budget, and bind its ID on the Executive page. A build does not
prove installation, configuration, activation, session execution, or production readiness.

L02 runtime qualification additionally requires an authorized host, owner, issue, distinct existing
executor/contributor identities, bounded adapter/model configuration, one approved reference ticket,
persisted readback, and a rendered browser interaction. Local unit/SSR tests do not prove those facts.
See `../../docs/IMPLEMENTATION-L02.md` for the delivered contract and evidence boundary.

## Upstream attribution

The Executive profile adapts selected OpenExecutive material at revision
`13da433bc6f3ae97e78bb8c90f06bb5e49953447`. See `profiles/executive/AGENTS.md`,
`provenance/openexecutive.json`, `NOTICE`, and `LICENSES/Apache-2.0.txt`. The surrounding project
remains MIT-licensed; the adapted profile retains its Apache-2.0 obligations.

## Prepared development agents

The package also distributes 18 versioned role profiles, eight reusable source
skills and an inactive declarative catalogue in `config/`. They are prepared assets;
installing this package does not hire these profiles or import/assign their skills.
The runtime manifest still declares only the existing paused `executive` agent.

See the repository's [canonical catalogue](../../docs/AGENT-CATALOG.md),
[skill registry](../../docs/AGENT-SKILLS.md),
[provisioning procedure](../../docs/AGENT-PROVISIONING.md), and
[L03 handoff](../../docs/AGENT-HANDOFF-L03.md). Run `pnpm validate:agent-catalog` to check
prepared assets and `pnpm test` for L01/L02 regressions plus catalogue validation.
The package version and runtime manifest version remain their historical values;
the prepared catalogue carries its own explicit version and provenance.
