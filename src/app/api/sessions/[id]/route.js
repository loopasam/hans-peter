import { getSession } from "@/lib/session-store.mjs";

export const runtime = "nodejs";

export async function GET(_request, { params }) {
  try {
    const { id } = await params;
    return Response.json(await getSession(id));
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Session not found." },
      { status: 404 },
    );
  }
}
