/**
 * All deployed contract addresses on Base Sepolia.
 * Sourced from the fetch-quests-smart-contracts repository.
 */

export const CONTRACTS = {
  // Core
  QuestEscrow: "0x2279b9b655E33BAcE51b8fDEa7e9D67e06f7ddf1" as const,
  QuestManager: "0xCD50564ac1e49FD8C15c57be466515eEfC1063a1" as const,
  ReputationManager: "0x7a85f86076F8642E8C4588eCC2Ba5Acc3dAAc3c8" as const,
  PlatformFeeManager: "0x9cD27c4dFAfff51d5e83d11901C3BD291382BEa8" as const,
  // Tokens
  ANORAKToken: "0xCFed28a3864a3f809cc40e2e2e3162BCCb3D3C67" as const,
  CommunityShares: "0x36Caf83b584BE35E81F3e9e1a75Be70f8B4e99b0" as const,
  // Governance
  GovernanceManager: "0x05Dc25CEFc88BeB0c5fb0dc9BEB18fAC85F81AB2" as const,
  Treasury: "0xc5d1f2D254cECe3ea8b9A8c3C82f77C47c13C1Cb" as const,
  DAORouter: "0x6B67Eb9da3d4C21ac4ad0dC10E7543d828F1fF6E" as const,
} as const;

export type ContractName = keyof typeof CONTRACTS;
