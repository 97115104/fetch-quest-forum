import { NextResponse } from "next/server";
import { getSession, type SessionPayload } from "@/lib/session";

/**
 * Require an authenticated session for an API route handler.
 * Returns the session payload on success, or a 401 response on failure.
 */
export async function requireAuth(): Promise<
  | { session: SessionPayload; error?: never }
  | { session?: never; error: NextResponse }
> {
  const session = await getSession();
  if (!session) {
    return {
      error: NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      ),
    };
  }
  return { session };
}
