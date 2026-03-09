import { NextRequest, NextResponse } from "next/server";
import { verifyMessage } from "viem";
import { createSession } from "@/lib/session";
import { cookies } from "next/headers";

interface VerifyBody {
  message: string;
  signature: `0x${string}`;
  address: `0x${string}`;
  chainId: number;
}

/**
 * POST /api/auth/verify
 * Accepts a SIWE-style signed message, verifies the signature
 * matches the claimed address, and issues a JWT session cookie.
 */
export async function POST(request: NextRequest) {
  const body = (await request.json()) as VerifyBody;

  if (!body.message || !body.signature || !body.address || !body.chainId) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  // Verify that the nonce in the message matches the one we issued
  const jar = await cookies();
  const expectedNonce = jar.get("siwe_nonce")?.value;
  if (!expectedNonce || !body.message.includes(expectedNonce)) {
    return NextResponse.json({ error: "Invalid nonce" }, { status: 401 });
  }

  // Verify domain matches
  const domain = process.env.NEXT_PUBLIC_SIWE_DOMAIN ?? "localhost";
  if (!body.message.includes(domain)) {
    return NextResponse.json({ error: "Domain mismatch" }, { status: 401 });
  }

  // Verify the cryptographic signature
  const valid = await verifyMessage({
    address: body.address,
    message: body.message,
    signature: body.signature,
  });

  if (!valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // Clear the nonce cookie after successful verification
  jar.delete("siwe_nonce");

  // Issue a session
  await createSession({ address: body.address, chainId: body.chainId });

  return NextResponse.json({ ok: true, address: body.address });
}
