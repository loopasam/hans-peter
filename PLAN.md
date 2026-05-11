# Plan

## Goals

Build a minimal German-speaking tutor app that lets the user hold a spoken German conversation, saves each chat session to local files, and generates structured feedback after the session.

## Milestones

1. Scaffold a Next.js app with a simple single-page tutor interface.
2. Add a minimal server-side API route that creates OpenAI Realtime browser sessions without exposing the server API key.
3. Connect the browser microphone to the OpenAI Realtime session using the OpenAI Agents SDK Realtime flow.
4. Display finalized tutor and user transcript messages during the session.
5. Save completed sessions as JSON files under `data/sessions`.
6. Generate structured feedback from the saved transcript after the user ends a session.
7. Add a simple past-session view that lists saved sessions and shows transcript plus feedback.

## Open Questions

- Should the first tutor level default to A2 or B1?
- Should the MVP correct mistakes only after the session, or also lightly during conversation?
- Should session history be included in the first implementation pass, or added immediately after the core voice loop works?
