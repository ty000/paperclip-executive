# Agent provisioning and qualification

Status: prepared procedure only. It does not authorize or perform a hire, skill-library change, configuration mutation, activation, or model run.

The versioned source is `packages/executive/config/agent-catalog.json`. Its `nativeHireDraft` objects contain only fields supported by the inspected Paperclip create/hire contract. Repository-owned metadata such as profile versions, source paths, lifecycle intent, conditional skills, workspace needs, and authorization boundaries stays outside those native payload objects. The contract was checked against Paperclip commit `61b3fd57a695614dc4a37e2303f426a34a9795cf`; discover the deployed schema again before using it on an instance.

## Packaging and lifecycle boundary

The npm package carries `config`, `profiles`, `skills`, `provenance`, and the validator. The existing plugin manifest is deliberately unchanged: its L01/L02 managed `executive` agent remains the only reconciled agent, with `status: paused`. Installing or reconciling the plugin therefore distributes the catalogue assets without registering the other 17 profiles or replacing an installed Executive profile.

Every catalogue entry has `automaticProvisioning: false`, `automaticActivation: false`, timer heartbeat disabled, on-demand wake disabled, no agent/skill creation permission, no task-assignment permission proposal, and a zero proposed monthly budget. In the inspected host, zero does not establish an enforceable cap or execution lock because budget enforcement is applied only when the configured value is greater than zero. The operator must set and read back an enforceable role budget before activation. Native hire creation does not accept a requested `paused` status, so dormant provisioning requires a separate, authorized pause and readback if a hire returns `idle`. A pending hire stays `pending_approval`; do not approve it merely to complete provisioning.

## Adapter, engine, and model proposals

All roles propose native `codex_local` with `engine: acp`. At the inspected Paperclip revision, `acpx_local` is retired and Codex ACP runs through `codex_local` with `engine: "acp"`; it requires Node `>=24.11.0` and `@agentclientprotocol/codex-acp`. Missing prerequisites fail rather than silently falling back. `nonInteractivePermissions: deny` prevents an unattended permission fallback. Specialist consultations use one-shot sessions; the executor, Council reviewer, and Executive use persistent sessions because their work can span a bounded correction or consultation thread.

The model choices are proposals for future Paperclip agents, separate from the models used to author this catalogue. Availability and authentication on the target instance are unknown until adapter discovery and an authorized environment probe.

| Roles | Proposed model / effort | Reason |
| --- | --- | --- |
| Council Reviewer | `gpt-6-astra` / `high` | Integrates conflicting evidence and owns the bounded Council decision. |
| Software Executor, Executive Advisor | `gpt-6-sol` / `high` | Handles multi-file implementation or cross-functional synthesis with material boundary checks. |
| Architecture, Security & Privacy, Legal & Compliance | `gpt-6-sol` / `high` | Reviews high-impact technical, security, privacy, licensing, or regulated-risk ambiguity. |
| Product, Quality, UX & Accessibility, Operations, Delivery, Economics, Strategy, Data & Experimentation, Marketing, Sales & Customer, Organization & Talent, Board Communications | `gpt-5.6-sol` / `medium` | Produces a bounded specialist opinion from prepared evidence; escalate ambiguity instead of increasing routine effort. |

Re-evaluate a selection only when the target instance does not advertise it, the configured auth binding cannot serve it, or the ticket has substantive complexity outside the role's normal lane. Record the actual model and effort from configuration readback; a catalogue proposal is not proof of an effective setting.

## Materialize a reviewed hire

Perform these steps for one profile at a time. Use an exact instance, company, authenticated actor, source issue, and target profile approved by the operator. Never infer a server URL, credential, company ID, reporting-line ID, environment ID, skill version ID, or agent ID.

1. Read the target state through `GET /api/agents/me`, `GET /api/companies/:companyId/agents`, `GET /api/companies/:companyId/org`, and `GET /api/companies/:companyId/agent-configurations`. Confirm the actor has `agents:create`. Record the target, actor, company, source revision, deployed version, and timestamp without secrets.
2. Discover `/llms/agent-configuration.txt` and `/llms/agent-configuration/codex_local.txt`. Confirm `codex_local`, ACP prerequisites, the proposed model/effort, runtime environment, workspace mechanism, and provider authentication are supported. Resolve a distinct identity and reporting-line agent ID. Do not reuse another agent's runtime ID or credential binding.
3. Read `GET /api/companies/:companyId/skills`. Choose one source mechanism supported by the target: `POST /api/companies/:companyId/skills/import` with `{ "source": "<reviewed source>" }` for a target-accessible absolute local package path, GitHub source, or URL; or `POST /api/companies/:companyId/skills/install-catalog` with a discovered `catalogSkillId` and optional reviewed slug. For this package, a local import source is the exact installed `packages/executive/skills` directory, never an inferred checkout path. Import or install every required skill before assignment under separate authorization. Read back each library record, content, source, compatibility, version, and actual company key. A source file in this package does not prove installation.
4. Build and retain a proposal-to-instance map from each catalogue key/version to the actual imported company skill key and, when version pinning is enabled, its native version UUID. Reject collisions, missing keys, incompatible content, or ambiguous duplicate slugs. Replace the proposal keys in `nativeHireDraft.desiredSkills` with the resolved company keys; use `{ "key": "<actual-key>", "versionId": "<actual-version-uuid>" }` only when the target's Beta version pinning is enabled and the UUID was read back. Conditional skills are not assigned by default; add them later through the same reviewed mapping when their trigger applies.
5. Copy the rest of the selected `nativeHireDraft`; add the resolved `reportsTo`, `sourceIssueId` or `sourceIssueIds`, `defaultEnvironmentId` when needed, and top-level `instructionsBundle.files["AGENTS.md"]` loaded from the exact `instructionsSource`. Do not add catalogue-only keys to the payload. Do not add a secret, runtime-generated ID from another instance, legacy prompt template, provider default, or `status`.
6. Review workspace and tool scope. `isolated-project-write` is reserved for Software Executor and requires a bounded worktree/write allowlist. `project-read-only` roles receive only the required repository/evidence surface. `none` roles work from supplied Paperclip context. External-system, deploy, publish, spending, credential, customer-contact, and personnel actions require separate authorization and are not granted by a title or skill.
7. Submit the reviewed request through `POST /api/companies/:companyId/agent-hires`. Do not use direct creation to bypass board approval. If the response or connection is ambiguous, read agents, approvals, and the source issue before any retry; names are not idempotency keys.
8. Read back the returned agent ID, approval state, `GET /api/agents/:id/configuration`, `GET /api/agents/:id/instructions-bundle`, its `AGENTS.md` content/revision/hash, and `GET /api/agents/:id/skills`. Compare exact identity, adapter, engine, model, effort, heartbeat, instructions, and desired skill keys with the reviewed materialized payload.
9. If the hire is `idle`, obtain board authorization for `POST /api/agents/:id/pause`, then read back `status: paused` and absence of active runs before continuing. If it is `pending_approval`, leave it pending. Never wake it to manufacture proof.
10. Apply the reviewed permission proposal through the dedicated permissions endpoint only when separately authorized, carrying the complete supported payload: `canCreateAgents: false`, `canCreateSkills: false`, `canAssignTasks: false`. Read it back. Do not infer effective rights from the draft. For later additions, call `POST /api/agents/:id/skills/sync` with `mode: "add"` and only the mapped `desiredSkills`; read back both configuration and the skill snapshot because desired state can persist even when adapter synchronization fails. Never use `replace` for a bounded addition.

## Preserve installed customizations

The catalogue is a proposal, not a reset source. For an existing agent, capture the current configuration, desired skills, instruction bundle mode, entry-file revision/hash, content, and managed-resource ownership before comparing it with a profile. Prepare a field-level diff and preserve operator customizations. Use current concurrency tokens for instruction changes and additive/removal skill sync for bounded changes. Do not use `managed.reset()`, whole-set replacement, stale revisions, or a fresh hire to overwrite an identity.

This lot has `migration_prewrite: not-applicable` because it prepares versioned files and performs no installed-agent migration. If an operator later replaces existing instructions, desired skills, or identity/configuration, that run must classify migration prewrite as required and pass its applicable migration contract before the first write.

## Qualification ledger

Record evidence by layer for each profile. Stop at the first unresolved layer and retain the partial state.

| Layer | Required evidence |
| --- | --- |
| Declared | Catalogue version, profile version, skill source versions, package revision, validation result. |
| Installed | Exact package/plugin record plus company skill-library keys and version records. |
| Desired | Agent configuration and desired-skill readback for the exact agent ID. |
| Loaded | Adapter skill snapshot/runtime mount and exact instruction bundle observed for that profile. |
| Activated | Approved governance state, intended status/config, and explicit authorization for work. |
| Executed | Authorized run ID, terminal result, logs/artifacts, and role-specific output contract. |

For configuration qualification, run `pnpm run validate:agent-catalog`, then inspect `npm pack --dry-run --json` and confirm the packed file list contains all `config/**`, `profiles/**`, `skills/**`, provenance files, and the validator. Build and existing tests prove source/package integrity only. Synthetic scenarios validate contract coverage; they do not prove model judgment, installation, loading, activation, or execution.

An authorized runtime qualification starts only after declared, installed, desired, and loaded evidence passes. Select a bounded synthetic or disposable-company task, record the exact agent/config/skill versions, obtain run authorization, then read the terminal run and native work product. No blind retry is allowed after a timeout or disconnected write/run. Reconcile state first; if the outcome stays uncertain, record `unknown` and stop.

## Operational record

For every future provision or qualification, retain:

```text
operation / timestamp:
instance / company / actor / authorization:
profile id + version / skill keys + versions:
Paperclip source contract / deployed version / discovered schema:
pre-state + resource ids + revisions/hashes:
materialized payload / preservation policy:
attempted action / response or unknown outcome:
readback / postcondition comparison:
declared / installed / desired / loaded / activated / executed:
partial state / stop reason / smallest supported next action:
```

Omit secrets. Preserve disagreements and missing evidence. Installation, configuration, activation, execution, and completion remain separate claims.
