"use client";

import Link from "next/link";
import Image from "next/image";
import { ConnectWallet } from "@/components/connect-wallet";

export function Header() {
  return (
    <header className="top-bar sticky top-0 z-50 flex items-center justify-between border-b px-4 py-2 md:px-6">
      <Link href="/" className="flex items-center gap-3">
        <Image
          src="/nav.png"
          alt="Fetch Quests"
          width={32}
          height={32}
          className="orb"
        />
        <span className="font-display text-lg font-semibold tracking-tight">
          Forum
        </span>
      </Link>
      <ConnectWallet />
    </header>
  );
}
