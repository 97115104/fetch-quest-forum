"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useCallback, useState } from "react";

/**
 * Builds the EIP-4361 message that the wallet signs.
 */
function buildSiweMessage(
  address: string,
  nonce: string,
  chainId: number
): string {
  const domain = typeof window !== "undefined" ? window.location.host : "localhost";
  const origin = typeof window !== "undefined" ? window.location.origin : "https://localhost";
  const issuedAt = new Date().toISOString();

  return [
    `${domain} wants you to sign in with your Ethereum account:`,
    address,
    "",
    "Sign in to Fetch Quests Forum",
    "",
    `URI: ${origin}`,
    `Version: 1`,
    `Chain ID: ${chainId}`,
    `Nonce: ${nonce}`,
    `Issued At: ${issuedAt}`,
  ].join("\n");
}

export function ConnectWallet() {
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [busy, setBusy] = useState(false);

  const signIn = useCallback(async () => {
    if (!address || !chainId) return;
    setBusy(true);
    try {
      // 1. Fetch nonce
      const nonceRes = await fetch("/api/auth/nonce");
      const { nonce } = await nonceRes.json();

      // 2. Build and sign the SIWE message
      const message = buildSiweMessage(address, nonce, chainId);

      // The wallet connector handles signing
      const { signMessage } = await import("wagmi/actions");
      const { wagmiConfig } = await import("@/config/wagmi");
      const signature = await signMessage(wagmiConfig, { message });

      // 3. Verify on server
      const verifyRes = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, signature, address, chainId }),
      });

      if (!verifyRes.ok) {
        const err = await verifyRes.json();
        console.error("SIWE verification failed:", err);
      }
    } catch (err) {
      console.error("Sign-in error:", err);
    } finally {
      setBusy(false);
    }
  }, [address, chainId]);

  const handleLogout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    disconnect();
  }, [disconnect]);

  // Not connected: show connector buttons
  if (!isConnected) {
    return (
      <div className="flex gap-2">
        {connectors.map((connector) => (
          <button
            key={connector.uid}
            onClick={() => connect({ connector })}
            className="btn-dark hover-lift rounded-[0_0.75rem_0_0.75rem] px-4 py-2 text-sm font-medium"
          >
            {connector.name === "Coinbase Wallet"
              ? "Smart Wallet"
              : connector.name}
          </button>
        ))}
      </div>
    );
  }

  // Connected but not signed in: show sign-in button
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={signIn}
        disabled={busy}
        className="btn-dark hover-lift rounded-[0_0.75rem_0_0.75rem] px-4 py-2 text-sm font-medium disabled:opacity-50"
      >
        {busy ? "Signing..." : "Sign In"}
      </button>
      <button
        onClick={handleLogout}
        className="btn-light rounded-[0_0.75rem_0_0.75rem] px-3 py-2 text-xs"
      >
        {address?.slice(0, 6)}...{address?.slice(-4)}
      </button>
    </div>
  );
}
