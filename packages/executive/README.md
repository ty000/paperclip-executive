# Paperclip Executive plugin

This external Paperclip plugin implements the L01 direct-advice slice. An authenticated company
owner binds an existing agent, submits a question, and can inspect the persisted session/run status,
structured recommendation, assumptions, limitations, failure, or uncertain outcome.

The package never recruits, reconciles, resumes, or activates an agent automatically. It creates no
issues or other native work. Plugin workers and UI are trusted same-origin code; installation is an
explicit trust decision, not a sandbox boundary.

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
Installation is intentionally not part of L01 verification. On an explicitly selected compatible
Paperclip instance, the later operator command would be:

```bash
paperclipai plugin install "$(pwd)"
```

After installation, an operator must inspect readiness, explicitly provision or select an agent,
activate it under an approved adapter/budget, and bind its ID on the Executive page. A build does not
prove installation, configuration, activation, session execution, or production readiness.

## Upstream attribution

The Executive profile adapts selected OpenExecutive material at revision
`13da433bc6f3ae97e78bb8c90f06bb5e49953447`. See `profiles/executive/AGENTS.md`,
`provenance/openexecutive.json`, `NOTICE`, and `LICENSES/Apache-2.0.txt`. The surrounding project
remains MIT-licensed; the adapted profile retains its Apache-2.0 obligations.
