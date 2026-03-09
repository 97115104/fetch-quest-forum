import { randomBytes } from "crypto";

/**
 * Generate a cryptographically random nonce for SIWE.
 */
export function generateNonce(): string {
  return randomBytes(16).toString("hex");
}
