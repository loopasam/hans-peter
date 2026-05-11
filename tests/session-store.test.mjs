import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import {
  createSession,
  getSession,
  listSessions,
  saveSessionFeedback,
} from "../src/lib/session-store.mjs";

test("creates, reads, lists, and updates a session JSON file", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "hans-peter-sessions-"));

  try {
    const session = await createSession(
      {
        level: "A2",
        topic: "daily conversation",
        messages: [
          {
            role: "assistant",
            text: "Hallo! Wie war dein Tag?",
            timestamp: "2026-05-11T12:00:00.000Z",
          },
        ],
      },
      { root, now: () => new Date("2026-05-11T12:01:00.000Z") },
    );

    assert.match(session.id, /^2026-05-11T12-01-00-000Z-/);
    assert.equal(session.feedback, null);

    const saved = JSON.parse(
      await readFile(path.join(root, `${session.id}.json`), "utf8"),
    );
    assert.equal(saved.messages[0].text, "Hallo! Wie war dein Tag?");

    const listed = await listSessions({ root });
    assert.deepEqual(
      listed.map((item) => item.id),
      [session.id],
    );

    const feedback = {
      summary: "Good start.",
      strengths: ["Clear answers"],
      corrections: [],
      vocabulary: ["der Alltag"],
      nextPractice: ["Use past tense"],
    };

    const updated = await saveSessionFeedback(session.id, feedback, { root });
    assert.deepEqual(updated.feedback, feedback);

    const reread = await getSession(session.id, { root });
    assert.deepEqual(reread.feedback, feedback);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("rejects unsafe session ids", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "hans-peter-sessions-"));

  try {
    await assert.rejects(
      () => getSession("../escape", { root }),
      /Invalid session id/,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
