# Prepared agent assets: L03 handoff

Contract ID: `executive-agent-catalog.v1`; asset version: `1.0.0`.
Status: provisional interface published for parallel design; not runtime-qualified.
This document becomes the handoff to the merged assets after the agents PR merges.
L03 must pin that merge commit and the asset versions, never a provisional copy.

## Stable profile identifiers

`software-executor`, `council-reviewer`, `executive`, `product`, `architecture`,
`quality`, `ux-accessibility`, `security-privacy`, `operations`, `delivery`,
`economics`, `strategy`, `data-experimentation`, `marketing`, `sales-customer`,
`organization-talent`, `legal-compliance`, `board-communications`.

Sources are `packages/executive/profiles/<id>/AGENTS.md`. These are 18 distinct
prepared profiles; only the existing `executive` remains manifest-managed.
Prepared assets do not hire or activate agents. Each future runtime binding must
resolve a real company-scoped identity; profile IDs are not native agent UUIDs.

Default proposed review: `product`, `architecture`, `quality`, `delivery`,
`economics` supply distinct opinions; `council-reviewer` owns synthesis and the
mandated decision. `software-executor` cannot accept its own output. `executive`
may synthesize on request without replacing Council or recursively dispatching.

## Inputs and outputs

A future L03 request binds the native issue, captured Linear source, objective,
criteria, exclusions, exact subject/result version, mandate ID/revision, actor,
question, permitted evidence, remaining review limits and escalation destination.
Never infer IDs, context, permissions, cost or deadlines from a title.

An opinion identifies its profile/version, subject and mandate revisions,
relevance (including an explicit reason when not relevant), evidence and unknowns,
assumptions, limitations, dissent and findings. Every finding states `must_fix`,
`useful_now` or `defer`, criterion/risk, evidence, consequence and the smallest
sufficient correction. Missing evidence does not become a favorable vote.
Council alone records the decision through its authenticated, qualified contract;
recorded decision, confirmed native effect and observed outcome remain separate.
These are proposed semantic requirements, not a new executable endpoint/schema.

L02 remains `prepared-ticket-contribution.v1`, method
`paperclip-executive.prepared-ticket-review@1.0.0`, profile revision
`paperclip-executive-l02`, as declared in `src/contribution.ts`. Its supported
perspectives remain `product`, `technical`, `delivery_cost`; its required JSON
shape does not grow when these assets are installed. Any specialist using L02
must obey that prompt's schema. L03 must explicitly version/map any richer
opinion envelope; it must not send new enums into the existing L02 parser.

## Parallel work and merge dependency

L03 may inspect Council/host contracts, design direction versus result decisions,
correction/readback, identity/version checks and tests independent of final profiles.
This lot does not start L03 or authorize changes to Council or Paperclip.

Strict order: merge agents assets; L03 integrates current `origin/main`; L03 pins
merged profile/skill versions; integrated qualification uses those exact assets;
only then may L03 merge. Agent asset merge proves neither installation nor V1.

Required owning-component evidence remains: mandate authority, decision-time
subject freshness, plan direction distinct from result acceptance, authenticated
Council decision and native effect readback, correction counters, budget/stop
controls, replay/uncertain-outcome handling and distinct executor/reviewer actors.
No panel engine, voting, fan-out, scheduler, appeal engine or runtime provisioning
is implemented by this catalogue.
