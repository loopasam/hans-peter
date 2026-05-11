# agentic-flow

Template repo for AI-assisted development with [pi](https://github.com/mariozechner/pi-coding-agent).

## Structure

- `AGENTS.md` — Instructions for the AI agent
- `PLAN.md` — Project goals and milestones
- `PROGRESS.md` — Current state of work
- `docs/` — Project documentation (see `docs/INDEX.md`)

## Setup

1. Clone / use as template
2. Install recommended skills:
   ```bash
   npx skills add firecrawl/cli -g -y
   npx skills add https://github.com/currents-dev/playwright-best-practices-skill --skill playwright-best-practices -g -y
   ```
3. Start working:
   ```bash
   pi
   ```

## Updating Skills

```bash
npx skills check    # see what's outdated
npx skills update   # update all
```
