import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const DEFAULT_ROOT = path.join(process.cwd(), "data", "sessions");
const SAFE_ID = /^[A-Za-z0-9_.-]+$/;

function sessionRoot(options = {}) {
  return options.root ?? DEFAULT_ROOT;
}

function assertSafeId(id) {
  if (!id || !SAFE_ID.test(id) || id.includes("..")) {
    throw new Error("Invalid session id");
  }
}

function sessionPath(id, options = {}) {
  assertSafeId(id);
  return path.join(sessionRoot(options), `${id}.json`);
}

function makeId(now = () => new Date()) {
  const stamp = now().toISOString().replaceAll(":", "-").replace(".", "-");
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${stamp}-${suffix}`;
}

async function writeSession(session, options = {}) {
  await mkdir(sessionRoot(options), { recursive: true });
  await writeFile(
    sessionPath(session.id, options),
    `${JSON.stringify(session, null, 2)}\n`,
    "utf8",
  );
}

export async function createSession(input, options = {}) {
  const now = options.now ?? (() => new Date());
  const endedAt = now().toISOString();
  const session = {
    id: makeId(options.now),
    startedAt: input.startedAt ?? endedAt,
    endedAt: input.endedAt ?? endedAt,
    level: input.level ?? "A2",
    topic: input.topic ?? "daily conversation",
    messages: Array.isArray(input.messages) ? input.messages : [],
    feedback: input.feedback ?? null,
  };

  await writeSession(session, options);
  return session;
}

export async function getSession(id, options = {}) {
  const raw = await readFile(sessionPath(id, options), "utf8");
  return JSON.parse(raw);
}

export async function listSessions(options = {}) {
  await mkdir(sessionRoot(options), { recursive: true });
  const files = await readdir(sessionRoot(options));
  const sessions = await Promise.all(
    files
      .filter((file) => file.endsWith(".json"))
      .map(async (file) => {
        const id = file.slice(0, -".json".length);
        const session = await getSession(id, options);
        return {
          id: session.id,
          startedAt: session.startedAt,
          endedAt: session.endedAt,
          level: session.level,
          topic: session.topic,
          messageCount: session.messages.length,
          hasFeedback: Boolean(session.feedback),
        };
      }),
  );

  return sessions.sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}

export async function saveSessionFeedback(id, feedback, options = {}) {
  const session = await getSession(id, options);
  const updated = { ...session, feedback };
  await writeSession(updated, options);
  return updated;
}
