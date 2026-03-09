# Fetch Quests Forum

Fetch Quests Forum is the governance and community hub for the Fetch Quests platform. It serves as the central space where Farmers, Givers, Guild Masters, and Community Share holders discuss proposals, vote on protocol changes, earn ANORAK tokens through participation, and engage with one another on matters that shape the future of the platform. The forum replaces the standalone Wiki, ANORAK, Oracle, and Community DAO pages from the main Fetch Quests application, consolidating all governance and community interaction into a single, purpose-built interface.

The forum is modeled after community discussion platforms such as the World of Warcraft forums and Reddit, adapted for the decentralized governance needs of a blockchain-native protocol. Users authenticate with their existing Coinbase Smart Wallet or MetaMask wallet, the same wallet they use on the main Fetch Quests platform, and their on-chain identity, reputation, ANORAK balance, and Community Share status carry over automatically. Every action on the forum, from posting a comment to casting a vote on a Fetch Quest Proposal, is tied to the same wallet address and reputation that the user has built through completing quests, leaving reviews, and contributing to the ecosystem.

---

## About Fetch Quests

Fetch Quests is a decentralized gig-work platform built on the Base blockchain that connects technical work providers (Givers) with developers (Farmers). Givers post quests with USDC rewards held in smart contract escrow, Farmers accept quests and complete the work against GitHub Issues, and a CI workflow verifies completion automatically. When the work passes verification, the smart contract releases the reward directly to the Farmer's wallet. The platform operates in 14-day seasons, tracks reputation on-chain through the Dreyfus Skill Model, and distributes Incentive Shares to engaged participants at the end of each season. All state, reputation, payments, and dispute outcomes are on-chain, auditable, and require no central authority to maintain.

The ANORAK token is the platform's ERC-20 engagement token, minted when users complete quests, post reviews, perform benevolent actions, win disputes, or register their wallet for the first time. ANORAK balance determines a user's rank status, gates access to governance features such as submitting and voting on proposals, and can be burned as tribute on other users' profiles as a form of public recognition.

The Governance contract manages Fetch Quest Proposals (FQPs), which follow a structured lifecycle of 14 days of public discussion, 7 days of voting by Community Share holders and the Genesis Creator, and a 14-day notice period before enactment. Proposals can be binding, executing on-chain function calls when enacted, or advisory. The forum is the off-chain discussion layer that complements this on-chain governance system.

---

## What the Forum Does

The forum provides a threaded discussion interface where authenticated users can create posts, reply to threads, upvote and downvote content, and engage in structured conversation across multiple categories. It serves as the discussion layer for the Fetch Quest Proposal lifecycle, giving Community Share holders and the broader community a place to debate proposals during the 14-day discussion period before voting begins on-chain.

The forum also consolidates several features that previously existed as separate pages on the main platform. The Wiki section provides comprehensive developer documentation, smart contract references, and integration guides, all rendered from the existing documentation and made searchable and commentable. The ANORAK section displays token metrics, engagement minting history, milestone progress, tribute activity, and rank standings, pulling data from the FetchQuestsToken and FetchQuestsOracleV2 contracts. The Oracle section surfaces leaderboard data, reputation snapshots, seasonal analytics, and protocol-wide statistics aggregated by the FetchQuestsOracleV2 contract. The Community DAO section displays active and historical proposals, Community Share holder information, treasury balances, and voting records pulled from the Governance contract.

Users earn ANORAK tokens for meaningful participation on the forum, including posting quality content, contributing to proposal discussions, and maintaining positive engagement over time. This creates a direct link between community participation and governance power, since ANORAK balance is required to submit proposals (100 ANORAK minimum) and to vote on them (10 ANORAK minimum) through the on-chain Governance contract.

---

## Platform Architecture

The forum is a standalone Next.js application deployed on Vercel that shares authentication and on-chain identity with the main Fetch Quests platform. The backend consists of Vercel serverless functions backed by a PostgreSQL database for forum-specific data such as posts, comments, votes, and user activity, while all blockchain state is read directly from the deployed smart contracts on Base through viem and wagmi.

Authentication uses the same Sign-In with Ethereum (SIWE) flow as the main platform. The user connects their Coinbase Smart Wallet or MetaMask wallet, signs a message containing a server-generated nonce, and receives a JWT token that authenticates all subsequent API requests. No passwords are involved, and the user's Ethereum address serves as their identity across all Fetch Quests applications.

The forum reads from the following deployed smart contracts on Base Sepolia (testnet) to surface governance and platform data.

**Core Protocol Contracts**

FetchQuestsProtocol is deployed at 0x5Ede79Fbf66f01F4Eb41a2b136365CE72aE5A98C and manages quest creation, fee routing, and treasury operations including the incentive pool and community pool.

Governance is deployed at 0x9432004BEe8d7A787173ca54e903a43C37Aa507f and manages FQP proposals, Community Shares, voting mechanics, and proposal enactment.

FetchQuestsToken (ANORAK) is deployed at 0x00CBf4b0989770d8F1d168AE10e3Ed91b79E2d95 and is the ERC-20 engagement token with 18 decimals, engagement minting, milestone tracking, tribute burning, and rank status computation.

FetchQuestsOracleV2 is deployed at 0x8e5bCC14bc35D194aC4D81bc6c59189562867d70 and is the read-only aggregator that provides cross-contract snapshots, user profiles with 43 fields, quest queries, TVL analytics, and role inspection.

ReputationRegistry is deployed at 0x7438F07939E81c0087d9F0d8d73A493A95a1346C and manages on-chain reputation scores from 0 to 10000 basis points, benevolent tier progression, and incentive share probability computation.

SeasonController is deployed at 0x5aCa988B95B374E263A8f3DaD9b074e637Fe2B54 and manages deterministic 14-day season windows, Dreyfus skill ranks, quest caps, and Doubling Season mechanics.

GuildRegistry is deployed at 0xa8673050b7554F568B4b30ba8B02Dc07b9087779 and manages guild creation, soulbound membership NFTs, member and guild-level ranks, and treasury operations.

BadgeNFT is deployed at 0xE4164cb5A214d78131a4D34B4eAaF6dC5afdE756 and manages ERC-721 skill badges across six categories with EIP-712 signature-gated minting.

ReviewRegistry is deployed at 0x56BBF12f351F8f0FA0fd578EB235C60eDF1F5ABF and manages bilateral reviews, IPFS content hashes, and reputation hooks.

---

## Tech Stack

The forum is built with the following technologies, chosen to match the existing Fetch Quests ecosystem and ensure consistency across all platform surfaces.

**Frontend**: React 18 with TypeScript 5, built with Next.js for server-side rendering and static generation, styled with Tailwind CSS 3 using the exact same design tokens, color palette, typography, and glass panel system as the main Fetch Quests application.

**Blockchain Integration**: wagmi 3 for React hooks, viem 2 for low-level Ethereum interactions, and @coinbase/wallet-sdk 4 for Coinbase Smart Wallet support with gasless transactions via the Coinbase Developer Platform Paymaster.

**Backend**: Vercel serverless functions running Node.js 20 or later with jose for JWT signing and verification, communicating with a PostgreSQL database for forum-specific data.

**Database**: PostgreSQL hosted on Vercel Postgres (Neon) for forum posts, comments, votes, user forum profiles, moderation logs, and notification state. Blockchain state is not duplicated in the database and is instead read directly from contracts.

**Deployment**: Vercel with automatic deployments from the main branch, environment-based configuration for testnet and mainnet contract addresses, and CDN-cached static assets.

**Network**: Base Layer 2 on Ethereum, using Base Sepolia (chain ID 84532) for testnet and Base (chain ID 8453) for mainnet.

---

## Design System

The forum adheres to the Fetch Quests design system exactly. The visual identity is built on a glass-panel aesthetic with semi-transparent, backdrop-blurred surfaces floating over a static canvas background. There are no bright accent colors. The palette is exclusively grays and whites, with visual depth created through opacity, blur, shadow, and subtle metallic sheen.

**Typography** uses Playfair Display (serif) for all headings and display text, and Inter (sans-serif) for all body text, labels, and UI controls. Both are loaded from Google Fonts.

**Color palette** extends Tailwind with a custom gray scale: 50 (#f8f9fb), 100 (#f0f1f5), 200 (#e2e4ea), 300 (#c8cbd5), 400 (#9196a5), 500 (#6b7186), 600 (#535970), 700 (#414659), 800 (#2d3147), 900 (#1b1e2e). Light mode uses a canvas background of #f0f1f5 with glass panels at rgba(255,255,255,0.82) and 12px backdrop blur. Dark mode uses a canvas background of #000000 with glass panels at rgba(255,255,255,0.05).

**Corner treatment** uses the signature asymmetric rounded corners on all panels, cards, and dropdowns: border-radius 0 on top-left and bottom-right, 1rem on top-right and bottom-left, achieved with Tailwind classes rounded-tr-2xl and rounded-bl-2xl.

**Interaction model** is flat-first. Standard glass panels have no hover animation. Interactive elements opt into hover behavior through a glass-interactive class that adds scale(1.02) transform and a pulseGlow shadow animation on hover.

**Responsive design** targets both desktop and mobile from the start. The forum uses a mobile-first Tailwind approach with responsive breakpoints, a collapsible sidebar for category navigation on mobile, and touch-friendly interaction targets throughout.

---

## Authentication

Users authenticate by connecting their Coinbase Smart Wallet or MetaMask wallet and signing a message using the Sign-In with Ethereum (SIWE) standard. The flow proceeds as follows: the frontend requests a nonce from the server, the user signs a structured message containing the nonce in their wallet, and the server verifies the signature and issues a JWT token valid for 24 hours. No passwords, email addresses, or personal information are required. The user's Ethereum address is their identity.

Coinbase Smart Wallet is the primary connector, offering account creation via passkey (Face ID, fingerprint, or security key) with no browser extension required and gasless transactions sponsored by the Coinbase Developer Platform Paymaster. MetaMask is available as a fallback for users with existing wallets. Both wallet types are subject to the same authentication flow and receive the same JWT token structure.

The forum validates that the authenticated wallet exists in the Fetch Quests ecosystem by checking for a registered profile. Users who have not yet registered on the main platform are directed to do so before accessing forum features that require authentication.

---

## Repository Structure

```
fetch-quest-forum/
  assets/
    favicon/           Favicon for the forum site
    icons/             Wallet provider logos (MetaMask)
    logo/              Fetch Quests wordmark, map logo, mail icon
    nav/               Orb navigation button icon
    platform-icons/    Platform iconography (governance, wiki, treasury, etc.)
    public-icons/      SVG icons (chain, code, git-branch, layers, lock, sliders)
  README.md            This file
  development-todo-list.md   Development plan and deployment checklist
```

---

## Local Development

Instructions for setting up the development environment will be documented here once the project is initialized. The general approach follows the same patterns as the main Fetch Quests application: install dependencies with pnpm, configure environment variables for the database connection and JWT secret, set the target chain ID and contract addresses, and run the development server.

---

## Deployment

The forum will be deployed through Vercel at a subdomain of fetchquests.org (such as forum.fetchquests.org). Deployment configuration will mirror the main platform's Vercel setup with SPA rewrites, static asset caching, and serverless function routing for API endpoints. Environment variables for database credentials, JWT secrets, and contract addresses are managed through the Vercel dashboard.

---

## Related Repositories

The fetch-quests repository at github.com/97115104/fetch-quests contains the main platform frontend and API, including the existing authentication flow, wallet integration, design system, and component library that the forum builds upon.

The fetch-quests-smart-contracts repository contains all 20 deployed Solidity contracts including the Governance, FetchQuestsToken (ANORAK), FetchQuestsOracleV2, ReputationRegistry, and all other contracts that the forum reads from.

The fetch-quests-docs repository contains the VitePress documentation site at docs.fetchquests.org, which includes the developer wiki, smart contract documentation, and integration guides that the forum's Wiki section will surface.

---

## License

All rights reserved. This project is proprietary to Fetch Quests.
