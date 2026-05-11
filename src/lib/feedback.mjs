const EMPTY_FEEDBACK = {
  summary: "",
  strengths: [],
  corrections: [],
  vocabulary: [],
  nextPractice: [],
};

export function buildFeedbackInput(session) {
  const transcript = (session.messages ?? [])
    .map((message) => `${message.role}: ${message.text}`)
    .join("\n");

  return [
    "You are a German tutor giving concise, practical feedback.",
    "Return JSON only with this shape: summary, strengths, corrections, vocabulary, nextPractice.",
    `CEFR level: ${session.level ?? "A2"}`,
    `Topic: ${session.topic ?? "daily conversation"}`,
    "Transcript:",
    transcript || "(No transcript messages.)",
  ].join("\n");
}

export function normalizeFeedback(value) {
  return {
    summary:
      typeof value?.summary === "string"
        ? value.summary
        : EMPTY_FEEDBACK.summary,
    strengths: Array.isArray(value?.strengths) ? value.strengths : [],
    corrections: Array.isArray(value?.corrections) ? value.corrections : [],
    vocabulary: Array.isArray(value?.vocabulary) ? value.vocabulary : [],
    nextPractice: Array.isArray(value?.nextPractice) ? value.nextPractice : [],
  };
}

export function parseFeedbackText(text) {
  try {
    return normalizeFeedback(JSON.parse(text));
  } catch {
    return {
      ...EMPTY_FEEDBACK,
      summary: text.trim() || "No feedback was generated.",
    };
  }
}
