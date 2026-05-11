import { createSession, listSessions } from "@/lib/session-store.mjs";

export const runtime = "nodejs";

export async function GET() {
  return Response.json(await listSessions());
}

export async function POST(request) {
  try {
    const body = await request.json();
    const session = await createSession(body);
    return Response.json(session, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Could not save session." },
      { status: 400 },
    );
  }
}
