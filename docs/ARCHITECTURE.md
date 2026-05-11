# Architecture

Hans Peter is a Next.js app with browser-based Realtime voice and minimal server-side API routes.

## Runtime

- `src/components/TutorApp.jsx` owns the tutor UI, Realtime session lifecycle, transcript state, and session save flow.
- `src/app/api/realtime/session/route.js` creates short-lived OpenAI Realtime client secrets. The browser never receives `OPENAI_API_KEY`.
- `src/app/api/sessions/route.js` lists and creates local session files.
- `src/app/api/sessions/[id]/route.js` reads one saved session.
- `src/app/api/sessions/[id]/feedback/route.js` generates structured feedback with the Responses API and saves it back to the session file.

## Storage

Sessions are JSON files under `data/sessions`.

The app ignores saved JSON files in git. Keep durable migrations behind the helper functions in `src/lib/session-store.mjs` so local files can be replaced by a database later.

## Defaults

- Tutor level: `A2`
- Topic: `daily conversation`
- Correction style: feedback after the session
- Realtime model: `gpt-realtime`
- Feedback model: `gpt-5-mini`
