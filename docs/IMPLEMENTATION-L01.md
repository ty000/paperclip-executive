# L01 implementation report

## Result

L01 delivers a buildable external Paperclip plugin for one direct-advice journey. The page lets an
authenticated company owner bind an existing Executive agent, submit an idempotent request, and
inspect persisted attribution and terminal state. The worker creates a native agent session, preserves
the required `plugin:<pluginKey>:session:` task-key prefix, records the returned run identifier, and
persists a structured recommendation with assumptions and limitations. Failures and ambiguous
post-dispatch outcomes remain visible; the plugin does not blindly redispatch a known request.

The package also carries one adapted Executive profile and its OpenExecutive provenance. The manifest
declares the profile as paused and no code reconciles, recruits, resumes, or activates it.

## Replayable checks

From `packages/executive`:

```bash
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
pnpm build
```

At this revision, typecheck passed, all 14 targeted tests passed, and esbuild produced the manifest,
worker, and UI bundles. Tests cover missing configuration, non-user and non-owner rejection,
unambiguous active owner membership, owner transfer, cross-company refusal, stale settings revision, duplicate request deduplication, terminal result
attribution including run IDs across a failed persistence transition, interruption/restart
`outcome_unknown`, explicit terminal reconciliation, output-contract validation, and server-rendered unavailable and
completed-result UI states.

## Boundaries

- Verification is local code, mocked session behavior, and build evidence only. No plugin was
  installed, loaded, configured, activated, or executed against a Paperclip instance.
- The included SDK snapshot comes from Paperclip revision
  `61b3fd57a695614dc4a37e2303f426a34a9795cf`; runtime compatibility remains to be checked on the
  eventual target.
- On a company's first access after worker startup, its previously in-flight records become
  `outcome_unknown`. The SDK callback from the
  old worker is gone after a real restart; only a terminal result explicitly delivered to the current
  worker can reconcile that state. The plugin does not query run persistence or recover missed terminal
  output automatically, so G02 still requires a real adapter/run recovery qualification.
- The initial migration is new-package schema only. No existing instance or application data was
  migrated.
- B02, specialists, Council, connectors, recurring work, generalized recovery, and real G01-G04
  qualification remain deferred.

## Next qualification step

On an explicitly authorized disposable target, install and inspect the plugin, bind a real owner and
active Executive agent, then replay success, provider failure, missed event/restart, duplicate request,
stale revision, unauthorized author, and cross-company attempts with persisted host readback. That
qualification must keep installation, readiness, configuration, activation, and actual execution as
separate claims.
