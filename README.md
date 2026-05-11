# Hans Peter

Hans Peter is a minimal German speaking tutor app.

## Stack

- Next.js app router
- OpenAI Agents SDK Realtime for browser voice sessions
- OpenAI Responses API for structured feedback
- Local JSON files in `data/sessions`

## Setup

1. Install dependencies with your package manager.
2. Copy `.env.example` to `.env.local`.
3. Set `OPENAI_API_KEY`.
4. Run the app:

```bash
npm run dev
```

## Scripts

```bash
npm run dev
npm run build
npm test
```

## Notes

Saved session JSON files are ignored by git. The checked-in `data/sessions/.gitkeep` keeps the directory visible.
