---
name: github-project-management
description: 'Triage and manage issues on the "Gato Petsit — Website Roadmap" GitHub Project (owner csguth, project #1). Use when creating issues, adding items to the project board, setting Status/Priority, applying labels, or reviewing/reporting on the roadmap board.'
argument-hint: '[issue title or task description]'
---

# GitHub Project Management (Gato Petsit — Website Roadmap)

## When to Use
- Creating a new issue and triaging it onto the project board
- Adding an existing issue/PR to the project
- Setting or updating `Status` or `Priority` on a project item
- Applying/removing repo labels during triage
- Reporting on what's Todo / In Progress / Done, or listing items by priority

## Prerequisites
- `gh` CLI authenticated with access to `csguth/gatoweb.nl` and the user's projects
- Requires `project` scope: if commands fail with a permissions error, run `gh auth refresh -s project` first

## Key IDs (avoid re-discovering these every session)

| Item | Value |
|---|---|
| Repo | `csguth/gatoweb.nl` |
| Project owner | `csguth` |
| Project number | `1` |
| Project title | Gato Petsit — Website Roadmap |
| Project node ID | `PVT_kwHOABmUcs4BeDiN` |

### Status field (`ProjectV2SingleSelectField`)
| Option | ID |
|---|---|
| Todo | `f75ad846` |
| In Progress | `47fc9ee4` |
| Done | `98236657` |

### Priority field (`ProjectV2SingleSelectField`, custom)
| Option | ID |
|---|---|
| High | `9a12dbb1` |
| Medium | `4a5862b0` |
| Low | `67357327` |

If field/option IDs ever stop working (e.g. project was recreated), refresh them with:
```
gh project field-list 1 --owner csguth --format json
```

### Repo labels
`bug`, `documentation`, `duplicate`, `enhancement`, `good first issue`, `help wanted`, `invalid`, `question`, `wontfix`
(no priority labels exist — priority is tracked via the project's `Priority` field, not labels)

## Procedure: Full Triage of a New Task

1. **Create the issue** (skip if it already exists):
   ```
   gh issue create --repo csguth/gatoweb.nl --title "<title>" --body "<description>" --label "<label>"
   ```
   Capture the returned issue URL/number.

2. **Add the issue to the project** — this returns the project *item ID* (different from the issue number), needed for all following steps:
   ```
   gh project item-add 1 --owner csguth --url https://github.com/csguth/gatoweb.nl/issues/<N> --format json
   ```
   Extract `.id` from the JSON output as `ITEM_ID`.

3. **Set Status**:
   ```
   gh project item-edit --project-id PVT_kwHOABmUcs4BeDiN --id <ITEM_ID> \
     --field-id PVTSSF_lAHOABmUcs4BeDiNzhYgjsM --single-select-option-id <STATUS_OPTION_ID>
   ```

4. **Set Priority**:
   ```
   gh project item-edit --project-id PVT_kwHOABmUcs4BeDiN --id <ITEM_ID> \
     --field-id PVTSSF_lAHOABmUcs4BeDiNzhY3BJM --single-select-option-id <PRIORITY_OPTION_ID>
   ```

5. **Confirm** by listing the item:
   ```
   gh project item-list 1 --owner csguth --format json
   ```

Ask the user for Status/Priority/labels if not specified — do not guess a priority for someone else's task.

## Procedure: Move Existing Item Between Statuses

1. Find the item ID: `gh project item-list 1 --owner csguth --format json` and match by issue title/number.
2. Run the `item-edit` command from step 3 above with the new Status option ID.

## Procedure: Board Report

```
gh project item-list 1 --owner csguth --format json
```
Group the returned items by `status` field value and summarize (counts + titles) per column. Include Priority per item when relevant.

## Notes
- Prefer the `gh` CLI (`gh issue`, `gh project`, `gh label`) over MCP GitHub tools per this repo's tooling conventions.
- Labels are managed at the repo level (`gh label create/edit/delete --repo csguth/gatoweb.nl`), separate from the project's own `Labels` field (which just mirrors issue labels).
- If a new custom field or option is needed, create it with `gh project field-create` and update the tables above so future sessions don't need to rediscover it.
