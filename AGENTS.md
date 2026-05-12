# AGENTS.md

You are working inside a project that follows the `agentic-flow` conventions. Read and respect this file.

## Project Files

| File | Purpose | Who updates it |
|---|---|---|
| `PLAN.md` | Current sprint/feature: goals, milestones, open questions | You, with user approval |
| `PROGRESS.md` | Current sprint/feature: what's done, in flight, blockers | You, after each meaningful change |
| `AGENTS.md` | How you should work (this file) | The user only |
| `README.md` | Human-facing overview and setup | You or the user |
| `docs/INDEX.md` | Table of contents for project documentation | You, when docs change |
| `docs/*.md` | Detailed documentation split by topic | You, as the project grows |

## Workflow

1. **Start of session** — Read `PLAN.md` and `PROGRESS.md` to get context. Do not ask the user to recap what's already written there.
2. **Planning** — Discuss the plan with the user. Once agreed, serialize goals, milestones, and tasks into `PLAN.md`. Initialize `PROGRESS.md` with all tasks in the backlog.
3. **Implementation** — Work through tasks **one at a time**, following a TDD red-green cycle:
   - Write a failing test (red)
   - Write the minimal code to pass it (green)
   - Refactor if needed
4. **After each task** — Update `PROGRESS.md`: mark done, move to next task. Keep it concise.
5. **When the plan evolves** — Update `PLAN.md` to reflect changes. Always confirm with the user before major plan changes.
6. **When a sprint/feature seems done** — Ask the user if the effort is complete. Only clear `PLAN.md` and `PROGRESS.md` back to empty skeletons after confirmation.

## PLAN.md / PROGRESS.md

These files are **scoped to the current sprint or feature**, not the whole project. They get cleared when the effort is done.

**PLAN.md format:**
```markdown
## Goals
What this sprint/feature aims to achieve.

## Milestones
Ordered list of deliverables.

## Open Questions
Anything unresolved that affects the plan.
```

**PROGRESS.md format:**
```markdown
## Done
- [x] Thing that was completed

## In Progress
- [ ] Thing currently being worked on

## Blockers
- Anything preventing progress
```

Keep both flat. Move items between sections as they progress. Remove stale entries.

## Documentation (`docs/`)

- Split documentation into small, focused `.md` files — one topic per file.
- Always update `docs/INDEX.md` when adding, removing, or renaming a doc file.
- Keep docs factual and terse. No filler.

## Skills

This project uses skills managed via [skills.sh](https://skills.sh/). You don't install skills — they're already available. Use them when relevant. Run `npx skills check` if you suspect something is missing.

## General Rules

- Be direct. No preamble, no fluff.
- Be concise by default. Prefer short answers, bullet points, and direct file references. Avoid summaries, preambles, and extra explanation unless requested.
- When there are many questions or decisions, go through them one at a time so the user can answer and process them more easily.
- Don't modify `AGENTS.md` unless the user explicitly asks.
- If you create a new convention or pattern, document it in `docs/`.
- Prefer editing existing files over creating new ones, unless separation is clearly warranted.
