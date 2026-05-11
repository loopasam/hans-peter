import assert from "node:assert/strict";
import test from "node:test";

import {
  buildFeedbackInput,
  normalizeFeedback,
} from "../src/lib/feedback.mjs";

test("builds a focused feedback request from a transcript", () => {
  const input = buildFeedbackInput({
    level: "A2",
    topic: "daily conversation",
    messages: [
      { role: "assistant", text: "Wie war dein Tag?" },
      { role: "user", text: "Mein Tag war gut, ich habe gearbeitet." },
    ],
  });

  assert.match(input, /German tutor/);
  assert.match(input, /CEFR level: A2/);
  assert.match(input, /assistant: Wie war dein Tag\?/);
  assert.match(input, /user: Mein Tag war gut/);
});

test("normalizes partial feedback into the app schema", () => {
  assert.deepEqual(
    normalizeFeedback({
      summary: "Solid session.",
      corrections: [{ original: "Ich bin gut.", corrected: "Mir geht es gut." }],
    }),
    {
      summary: "Solid session.",
      strengths: [],
      corrections: [{ original: "Ich bin gut.", corrected: "Mir geht es gut." }],
      vocabulary: [],
      nextPractice: [],
    },
  );
});
