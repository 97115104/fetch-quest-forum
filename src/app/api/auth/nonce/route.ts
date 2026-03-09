import { NextResponse } from "next/server";
import { generateNonce } from "@/lib/nonce";
import { cookies } from "next/headers";

/**
 * GET /api/auth/nonce
 * Returns a random nonce and stores it in a short-lived cookie
 * so the verify endpoint can confirm the wallet signed it.
 */
export async function GET() {
  const nonce = generateNonce();

  const jar = await cookies();
  jar.set("siwe_nonce", nonce, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 300, // 5 minutes
    path: "/",
  });

  return NextResponse.json({ nonce });
}
