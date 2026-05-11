import {
  buildFeedbackInput,
  normalizeFeedback,
  parseFeedbackText,
} from "@/lib/feedback.mjs";
import { getSession, saveSessionFeedback } from "@/lib/session-store.mjs";

export const runtime = "nodejs";

function feedbackSchema() {
  return {
    type: "object",
    additionalProperties: false,
    required: ["summary", "strengths", "corrections", "vocabulary", "nextPractice"],
    properties: {
      summary: { type: "string" },
      strengths: { type: "array", items: { type: "string" } },
      corrections: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["original", "corrected", "note"],
          properties: {
            original: { type: "string" },
            corrected: { type: "string" },
            note: { type: "string" },
          },
        },
      },
      vocabulary: { type: "array", items: { type: "string" } },
      nextPractice: { type: "array", items: { type: "string" } },
    },
  };
}

function extractResponseText(data) {
  if (typeof data.output_text === "string") return data.output_text;

  return (data.output ?? [])
    .flatMap((item) => item.content ?? [])
    .map((content) => content.text ?? "")
    .filter(Boolean)
    .join("\n");
}

export async function POST(_request, { params }) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return Response.json(
      { error: "OPENAI_API_KEY is not configured." },
      { status: 500 },
    );
  }

  try {
    const { id } = await params;
    const session = await getSession(id);

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_FEEDBACK_MODEL ?? "gpt-5-mini",
        input: buildFeedbackInput(session),
        text: {
          format: {
            type: "json_schema",
            name: "german_tutor_feedback",
            schema: feedbackSchema(),
            strict: true,
          },
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return Response.json(
        { error: data.error?.message ?? "Could not generate feedback." },
        { status: response.status },
      );
    }

    const feedback = normalizeFeedback(parseFeedbackText(extractResponseText(data)));
    const updated = await saveSessionFeedback(id, feedback);

    return Response.json(updated);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Could not generate feedback." },
      { status: 400 },
    );
  }
}
