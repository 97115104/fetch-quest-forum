import { baseSepolia, base } from "viem/chains";

export const SUPPORTED_CHAINS = [baseSepolia, base] as const;

export const DEFAULT_CHAIN = baseSepolia;

export const SUPPORTED_CHAIN_ID = Number(
  process.env.NEXT_PUBLIC_CHAIN_ID ?? baseSepolia.id
);
