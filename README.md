# Paperclip Executive

A virtual executive team for Paperclip that turns goals into actionable initiatives, coordinates
agents, and tracks outcomes under explicit human delegation.

## L01: direct executive advice

The first local implementation lives in [`packages/executive`](packages/executive). It is an external
Paperclip plugin with a small React page, company-scoped persistence, an adapted Executive profile,
and native Paperclip agent-session dispatch. The current slice supports one owner, one explicitly
bound agent, and direct B01 advice only. It does not create work, recruit or activate agents, call a
provider directly, or implement the broader H1/B01/B02 roadmap.

```bash
cd packages/executive
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
pnpm build
```

The SDK snapshot needed for this unreleased host contract is checked into the package, so these
commands do not depend on a local absolute Paperclip path. See the package README for deliberate SDK
refresh instructions and the later, separately authorized installation workflow.

Implementation evidence and current limits are recorded in
[`docs/IMPLEMENTATION-L01.md`](docs/IMPLEMENTATION-L01.md). Product and architecture intent remain in
[`docs/PRD.md`](docs/PRD.md), [`docs/TAD.md`](docs/TAD.md), and [`docs/ROADMAP.md`](docs/ROADMAP.md).
