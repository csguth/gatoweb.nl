---
description: "Deploy the current or a named branch to a temporary Cloudflare Pages preview URL, without touching staging.gatoweb.nl or main. Use when the user wants to test a feature/PR branch live before merging, asks for a 'preview deploy', 'deploy temporário/temporária', or 'deploy na branch'."
name: "Deploy Branch Preview (Cloudflare Pages)"
argument-hint: "[nome da branch, padrão: a branch atual]"
agent: "agent"
tools: ["runCommands"]
---
Deploy the target branch (use `${input:branch}` if provided, otherwise the current git branch) to a
**temporary Cloudflare Pages preview** — this does NOT touch `staging.gatoweb.nl` (production-like
staging) or `main`. It reuses the existing "Deploy Staging (Cloudflare Pages)" GitHub Actions
workflow (`.github/workflows/deploy-staging-cloudflare.yml`), which already supports
`workflow_dispatch` and deploys whatever `branch: ${{ github.ref_name }}` is dispatched on — any
branch other than `staging` produces its own isolated Cloudflare Pages preview URL
(`https://<hash>.gatoweb-nl-staging.pages.dev`), sharing the same `staging` environment
config/secrets (Supabase project, price vars, etc.) but a separate URL.

## Steps

1. Determine the branch to deploy:
   - If the user gave a branch name, use it.
   - Otherwise run `git branch --show-current` in the repo working directory.
   - If there are uncommitted changes on that branch, warn the user that only the last **pushed**
     commit will be deployed (the workflow builds from the remote branch, not the local working
     tree) and ask whether to push first.
2. Make sure the branch exists on `origin` (push it if needed, only with explicit user confirmation
   if it hasn't been pushed yet).
3. Trigger the workflow on that branch:
   ```
   gh workflow run "Deploy Staging (Cloudflare Pages)" --repo csguth/gatoweb.nl --ref <branch>
   ```
4. Get the run ID from the command output (or `gh run list --workflow "Deploy Staging (Cloudflare Pages)" --branch <branch> --limit 1`) and watch it:
   ```
   gh run watch <run-id> --repo csguth/gatoweb.nl --exit-status
   ```
5. Once the run succeeds, extract the preview URL from the deploy step's logs:
   ```
   gh run view <run-id> --repo csguth/gatoweb.nl --log | Select-String -Pattern "https://.*pages.dev"
   ```
6. Report the preview URL back to the user in a short message, and remind them it shares the
   `staging` Supabase project/data — so test data created there is not fully isolated from other
   staging testing.

## Notes / constraints

- Never dispatch this workflow with `--ref staging` or `--ref main` when the intent is "just a
  preview" — that would be a real staging/production deploy, not a throwaway preview.
- Do not create or modify any GitHub Actions workflow files to accomplish this — the existing
  `deploy-staging-cloudflare.yml` already supports arbitrary branches via `workflow_dispatch`.
- If the workflow run fails, surface the failing step's log output rather than retrying blindly.
