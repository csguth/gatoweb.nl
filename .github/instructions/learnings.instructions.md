---
description: General workflow preferences and learnings for this repository
applyTo: '**'
---

## Learnings

- When merging a pull request in this repo (via chat/agent-driven workflow), always delete the feature branch afterward — both on origin and locally (if checked out in the current worktree). Don't wait to be asked each time.
- Always branch new feature/dev work off `staging`, never off `main` (e.g. `git checkout -b <branch> origin/staging`). `main` is reserved for hotfixes only — regular feature PRs must target `staging` as their base branch, matching the `guard-main-merges` workflow which only allows `main` merges from `staging` or hotfix-labeled PRs. The app isn't in real production use yet, so `staging` is effectively the default development branch.
- **Pattern for new business-logic features (established in issue #160, TDD-driven):** extract the
  actual decision-making into a small, framework-agnostic JS module with no browser/DOM/Alpine/i18next
  and no Deno-specific APIs (`Deno.env`, `Deno.serve`, etc.) — see `static/js/facturen/invoice-calc.js`
  and `supabase/functions/gcal-sync/logic.js`. Whatever runtime hosts the feature (a browser page, a
  Deno Edge Function) becomes a thin adapter that only wires that pure module to real I/O and should
  contain no business rules of its own. Cover the pure module with Gherkin scenarios under
  `tests/bdd/features/*.feature` + step files that `import` it directly (no page, no Deno, no real
  network/DB calls needed — see `tests/bdd/steps/gcal-sync-*.steps.mjs`), written *before* the
  implementation (red → green). This keeps the code base's real decisions concentrated in small,
  dependency-free, human-readable-spec-covered modules that a human (or a different LLM) can pick up
  and extend with confidence later, instead of being buried in imperative glue code.
