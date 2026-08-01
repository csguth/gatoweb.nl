---
description: General workflow preferences and learnings for this repository
applyTo: '**'
---

## Learnings

- When merging a pull request in this repo (via chat/agent-driven workflow), always delete the feature branch afterward — both on origin and locally (if checked out in the current worktree). Don't wait to be asked each time.
- Always branch new feature/dev work off `staging`, never off `main` (e.g. `git checkout -b <branch> origin/staging`). `main` is reserved for hotfixes only — regular feature PRs must target `staging` as their base branch, matching the `guard-main-merges` workflow which only allows `main` merges from `staging` or hotfix-labeled PRs. The app isn't in real production use yet, so `staging` is effectively the default development branch.
