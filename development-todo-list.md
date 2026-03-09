# Fetch Quests Forum -- Development Plan

This document describes the full development and deployment plan for the Fetch Quests Forum. Each phase builds on the previous one and is designed to be delivered incrementally so that the forum can be tested and deployed at each milestone. The architecture is modular, with clear separation between the forum's own data layer, the blockchain integration layer, and the presentation layer, so that each concern can be developed and scaled independently.

---

## Phase 1 -- Project Initialization and Infrastructure

The first phase establishes the repository structure, development tooling, deployment pipeline, and database infrastructure. Nothing user-facing is built in this phase, but everything that follows depends on it.

Initialize the Next.js project with TypeScript, Tailwind CSS, and the App Router. Configure the Tailwind theme to match the exact Fetch Quests design system: the custom gray scale (50 through 900), the Playfair Display and Inter font families, the asymmetric corner radius utility classes, and the glass panel CSS custom properties for both light and dark mode. Import and configure the canvas background, glass panel, glass-interactive, and window panel CSS classes from the main platform's index.css. Verify that the dark mode toggle works correctly using the class-based strategy.

Set up pnpm as the package manager with a lockfile, configure ESLint and Prettier to match the conventions used across the Fetch Quests repositories, and add TypeScript strict mode. Create the Vercel project and link it to the repository with automatic deployments from the main branch. Configure the vercel.json with the SPA rewrite rule, static asset cache headers, and serverless function routing.

Provision a PostgreSQL database on Vercel Postgres (Neon). Create the initial database schema for the forum. The schema should include the following tables, each with appropriate indexes, foreign keys, and constraints.

The forum_users table stores forum-specific profile data keyed by wallet address. It includes the wallet address as the primary key, a display name pulled from the main platform on first authentication, an avatar reference, a join timestamp, a role field for moderator or admin designation, a post count, a comment count, a reputation score derived from upvotes and downvotes received, a last active timestamp, and a boolean indicating whether the account is suspended.

The categories table stores forum categories such as General Discussion, Fetch Quest Proposals, Wiki, ANORAK, Oracle, Community DAO, Bug Reports, Feature Requests, and Guild Talk. Each category has an id, a name, a slug, a description, a display order, an icon reference, and a boolean indicating whether only moderators can create threads in it.

The threads table stores forum threads. Each thread has an id, a category id, an author wallet address, a title, a body stored as sanitized markdown, a created timestamp, an updated timestamp, an upvote count, a downvote count, a comment count, a view count, a boolean for whether the thread is pinned, a boolean for whether the thread is locked, and an optional FQP proposal id for threads that are linked to an on-chain governance proposal.

The comments table stores replies to threads. Each comment has an id, a thread id, an author wallet address, a body stored as sanitized markdown, a created timestamp, an updated timestamp, an upvote count, a downvote count, and an optional parent comment id for nested replies.

The votes table tracks upvotes and downvotes on threads and comments. Each vote has a composite key of the voter wallet address and the target id (thread or comment), a vote direction (up or down), and a timestamp. A unique constraint on voter plus target prevents duplicate voting.

The proposal_discussions table links on-chain FQP proposals to their forum discussion threads. Each record has the on-chain proposal id, the forum thread id, the proposal status mirrored from the contract, and timestamps for status transitions.

The notifications table stores user notifications for replies, mentions, votes on their content, and proposal status changes. Each notification has an id, a recipient wallet address, a type, a reference id pointing to the relevant thread or comment, a read boolean, and a timestamp.

The moderation_log table stores all moderation actions (thread locks, comment deletions, user suspensions) with the moderator's wallet address, the action taken, the target, a reason, and a timestamp.

Write database migration scripts using a migration tool compatible with Vercel Postgres (such as Drizzle ORM or Prisma) and run the initial migration. Seed the categories table with the default forum categories.

Set up environment variable management for local development and Vercel deployment. The required environment variables include the database connection string, the JWT secret (shared with or compatible with the main platform), the SIWE domain, the target chain ID, and all contract addresses for the relevant deployed contracts.

---

## Phase 2 -- Authentication and User Identity

The second phase implements wallet connection, SIWE authentication, and user identity resolution so that the forum can identify users and gate access to authenticated features.

Install and configure wagmi 3, viem 2, @coinbase/wallet-sdk 4, and @tanstack/react-query 5. Create a WalletProvider context that wraps the application and provides wallet connection state, the connected address, chain ID detection, and network switching helpers. Configure the Coinbase Smart Wallet connector as the primary option with smartWalletOnly preference and the CDP Paymaster URL for gasless operation. Configure the MetaMask (injected) connector as the fallback.

Implement the SIWE authentication flow as a set of API routes. The nonce endpoint generates a cryptographically random nonce, signs it with an HMAC using the JWT secret, and returns both the nonce and the HMAC token to the client. The verify endpoint accepts the signed message, the signature, the nonce, and the HMAC token, verifies the HMAC to confirm the nonce was issued by the server, recovers the signer address from the signature, confirms it matches the claimed address, and issues a JWT containing the wallet address with a 24-hour expiry. The JWT is stored in the client's session storage and included as a Bearer token on all subsequent API requests.

Build the authentication middleware that extracts and validates the JWT from incoming API requests, attaches the authenticated wallet address to the request context, and rejects unauthorized requests with appropriate status codes. Protected API routes will use this middleware.

Implement the forum user resolution flow. When a user authenticates for the first time, the server checks whether a forum_users record exists for their wallet address. If not, it creates one by pulling the display name and avatar from the main Fetch Quests platform API. If the main platform profile does not exist, the user is shown a message directing them to register on the main platform first. On subsequent authentications, the forum user record is updated with the last active timestamp.

Build the wallet connection UI component matching the existing Fetch Quests design: a connect button in the top navigation bar that opens a wallet selection modal offering Coinbase Smart Wallet as the primary option and MetaMask as a secondary option. After connection and SIWE authentication, the button displays the user's display name, ENS name, or truncated wallet address, along with an unread notification count. A dropdown menu provides links to the user's profile, settings, and a sign-out action.

Implement chain detection and switching. If the user is connected to the wrong network, display a banner prompting them to switch to the correct chain (Base Sepolia for testnet, Base for mainnet) and offer an automatic switch action.

---

## Phase 3 -- Core Forum Features

The third phase builds the essential forum functionality: browsing categories, reading threads, creating threads, posting comments, and voting on content.

Build the forum home page. The home page displays a list of categories, each showing its name, description, icon, thread count, and the most recent thread title and timestamp. Categories are ordered by the display order field. The layout uses the glass panel style for each category card with the signature asymmetric corners, and the page header uses Playfair Display for the forum title.

Build the category view page. Clicking a category navigates to a page listing all threads in that category, sorted by most recent activity by default with options to sort by newest, most upvoted, or most commented. Each thread card shows the title, author display name and avatar, creation time, upvote and downvote counts, comment count, and a pinned indicator if applicable. Pinned threads always appear at the top. Implement pagination or infinite scroll for thread lists.

Build the thread detail page. Clicking a thread navigates to a page showing the full thread body rendered from sanitized markdown, the author's profile summary (display name, avatar, ANORAK rank, reputation score, benevolent tier), the creation timestamp, upvote and downvote counts, and a list of comments. Comments are displayed in a nested tree structure based on parent comment references, with each comment showing the same author profile summary, body, timestamp, and vote counts. The thread and each comment have upvote and downvote buttons that require authentication.

Build the thread creation form. Authenticated users can create a new thread by selecting a category, entering a title, and writing a body in a markdown editor. The editor should support basic markdown formatting (headings, bold, italic, code blocks, links, images) with a live preview panel. Input is sanitized on the server side to prevent XSS and injection attacks before storage. Category-restricted threads (such as those in moderation-only categories) enforce the restriction on the server side regardless of what the client sends.

Build the comment creation form. Authenticated users can reply to a thread or to a specific comment within a thread. The reply form uses the same markdown editor as thread creation. Nested replies are supported to a configurable depth limit to prevent excessively deep threading.

Implement the voting system. Each authenticated user can cast one upvote or one downvote per thread and per comment. Clicking the same vote direction a second time removes the vote. Clicking the opposite direction changes the vote. Vote counts on threads and comments are updated atomically in the database. The votes table enforces uniqueness per voter per target. Upvotes and downvotes contribute to the forum-specific reputation score on the forum_users record.

Build the API routes for all forum CRUD operations: list categories, list threads by category, get thread detail with comments, create thread, create comment, cast vote, and edit or delete own content. All mutation endpoints require authentication. Input validation and sanitization are enforced on every endpoint.

---

## Phase 4 -- Blockchain Integration and Governance

The fourth phase connects the forum to the deployed smart contracts so that on-chain governance data, ANORAK balances, reputation scores, and protocol analytics are displayed within the forum interface.

Configure contract ABIs and addresses as environment-driven constants so that switching between testnet and mainnet requires only changing environment variables. Create typed contract interaction hooks using wagmi's useReadContract and useWriteContract for each contract the forum needs to read from.

Build the Proposals section within the Community DAO category. This section pulls all active and historical proposals from the Governance contract and displays them in a list with their title, author, category, status (Discussion, Voting, Approved, Rejected, Enacted), creation date, and timeline markers showing where each proposal is in the lifecycle. Clicking a proposal opens a detail view showing the full description (resolved from the IPFS description hash), the voting breakdown (votes for and against, quorum threshold of 60%), the list of target contracts and calldatas for binding proposals, and the associated forum discussion thread.

Automatically create a forum discussion thread when a new proposal is detected on-chain. Implement a background sync mechanism (either a cron-triggered Vercel function or an event listener) that polls the Governance contract for new proposals and creates corresponding threads in the Fetch Quest Proposals category, linking them via the proposal_discussions table. The thread body is populated from the proposal's on-chain metadata and IPFS description.

Build the ANORAK section. This page displays the authenticated user's current ANORAK balance, lifetime earned total, milestone progress (Initiate at 1,000 through Anorak Benevolent at 1,000,000), current rank status (Novice through Anorak Benevolent based on current balance), and tribute statistics (total received, tribute count). It also shows a global ANORAK leaderboard pulled from the FetchQuestsOracleV2 contract and the token's total supply and supply cap.

Build the Oracle section. This page surfaces protocol-wide analytics from the FetchQuestsOracleV2 contract: total value locked, active quest count, completed quest count, total users, current season number and status (including whether it is a Doubling Season), and the seasonal leaderboard for Farmers, Givers, and Guilds. Each leaderboard entry links to the user's or guild's profile on the main platform.

Build the Wiki section. This section renders the developer documentation from the fetch-quests-docs repository as browsable, searchable pages within the forum. The content is sourced from the markdown files in the docs repository and rendered with the forum's styling. Each wiki page has a discussion thread attached so that users can comment on and discuss specific documentation pages. Implement full-text search across wiki content.

Build the Community DAO section. This page displays the Genesis Creator's address and NFT, the list of Community Share holders with their roles, income allocation percentages, and active status, the community treasury balance, and the list of treasury expenditure records. All data is read from the Governance and FetchQuestsProtocol contracts.

Display the authenticated user's governance eligibility on their forum profile: whether they hold a Community Share, their ANORAK balance relative to the proposal submission threshold (100 ANORAK) and voting threshold (10 ANORAK), and their benevolent tier from the ReputationRegistry.

---

## Phase 5 -- Notifications, Moderation, and User Profiles

The fifth phase adds the supporting features that make the forum usable at scale: notifications to keep users informed, moderation tools to maintain quality, and enriched user profiles.

Implement the notification system. Users receive notifications when someone replies to their thread, replies to their comment, upvotes their thread or comment beyond a configurable threshold, mentions their wallet address or display name in a post, or when a proposal they have participated in changes status. Notifications are stored in the notifications table and displayed in a dropdown accessible from the navigation bar, with an unread count badge. Marking notifications as read is done individually or in bulk.

Build the user profile page. Each user's forum profile displays their wallet address (linked to BaseScan), display name, avatar, ENS name if available, forum join date, post count, comment count, forum reputation score, and their on-chain identity data pulled from the contracts: ANORAK balance and rank, reputation score and benevolent tier from the ReputationRegistry, Dreyfus skill rank from the SeasonController, guild membership from the GuildRegistry, badge collection from the BadgeNFT contract, and Community Share status from the Governance contract.

Implement moderation tools. Users with the moderator role can pin and unpin threads, lock threads to prevent further comments, delete individual comments, issue temporary suspensions to user accounts, and move threads between categories. All moderation actions are logged in the moderation_log table with the moderator's address, the action, the target, and a reason. Moderator privileges are granted by updating the role field on the forum_users record, which is restricted to admin users.

Implement content editing and deletion. Thread authors can edit the title and body of their own threads. Comment authors can edit their own comments. Edits are timestamped and the "updated at" field is displayed on the thread or comment. Authors can delete their own comments, which soft-deletes them (the content is replaced with a "deleted" placeholder while preserving the thread structure). Thread deletion is restricted to moderators to prevent orphaning large discussion trees.

Implement rate limiting on all mutation endpoints to prevent spam. Rate limits should be configurable per endpoint and enforced at the API layer based on the authenticated wallet address.

---

## Phase 6 -- ANORAK Rewards for Forum Participation

The sixth phase integrates ANORAK token rewards for forum participation, creating a direct incentive loop between community engagement and governance power.

Design and implement the forum engagement reward rules. The reward system should mint ANORAK tokens to users who contribute meaningfully to the forum. Suggested reward triggers include creating a thread, posting a comment, receiving a threshold number of upvotes on a thread or comment, and participating in a proposal discussion thread during the active discussion period. Reward amounts should be lower than quest completion rewards to maintain the hierarchy of incentives (quest completion at 100 ANORAK, review at 25 ANORAK, benevolent action at 50 ANORAK). A reasonable starting point would be 5 ANORAK per thread created, 2 ANORAK per comment, and 10 ANORAK for a post that crosses a significant upvote threshold.

Implement the reward distribution mechanism. Since ANORAK minting requires the MINTER_ROLE on the FetchQuestsToken contract, the forum backend needs a server-side wallet with the MINTER_ROLE that can call the token contract's mint function on behalf of users earning rewards. This wallet's private key must be stored securely in Vercel environment variables and never exposed to the client. Alternatively, implement a claimable reward system where the server signs EIP-712 typed data authorizing a mint, and the user submits the claim transaction themselves (gasless via Paymaster).

Implement reward cooldowns and caps to prevent gaming. Each user should have a maximum ANORAK earnable from forum activity per season (configurable, starting at 100 ANORAK per 14-day season). Cooldowns between reward-eligible actions prevent rapid-fire posting for token farming. The system should detect and reject low-quality posts (such as those below a minimum character count or those flagged by moderators) from earning rewards.

Build a rewards dashboard in the user's forum profile showing their ANORAK earned from forum activity this season, their lifetime forum ANORAK earnings, and a breakdown by activity type.

---

## Phase 7 -- Search, Performance, and Mobile Optimization

The seventh phase focuses on search functionality, performance optimization, and ensuring the forum works well on mobile devices.

Implement full-text search across threads, comments, and wiki content. The search should use PostgreSQL's built-in full-text search capabilities with tsvector indexes on thread titles, thread bodies, and comment bodies. Search results should be ranked by relevance, filterable by category, and paginated. The search interface should be accessible from a persistent search bar in the navigation and from a dedicated search page.

Optimize database queries with appropriate indexes on frequently queried columns: category_id and created_at on threads, thread_id and created_at on comments, recipient and read status on notifications. Implement connection pooling for the PostgreSQL database. Add Redis caching (via Vercel KV or Upstash) for frequently accessed data such as category listings, hot threads, and contract read results that do not change on every block.

Optimize frontend performance. Implement code splitting so that each page route is loaded independently. Use React Server Components where appropriate for pages that do not require client-side interactivity (such as the wiki and read-only proposal views). Implement incremental static regeneration for wiki pages and proposal detail pages. Lazy-load contract data and heavy components. Optimize images with next/image for automatic format conversion and responsive sizing.

Ensure full mobile responsiveness. The forum layout should use a single-column layout on mobile with a hamburger menu for navigation, collapsible thread trees for nested comments, swipe gestures for voting, and touch-friendly button sizes (minimum 44px tap targets). Test across iOS Safari, Android Chrome, and the in-app browsers of Coinbase Wallet and MetaMask mobile applications. The navigation orb button should match the main platform's fixed-position orb in the top-left corner.

Implement accessibility standards. All interactive elements should be keyboard-navigable, ARIA labels should be applied to dynamic content regions, focus management should work correctly during modal interactions, and color contrast should meet WCAG 2.1 AA standards in both light and dark mode.

---

## Phase 8 -- Testing and Quality Assurance

The eighth phase establishes the testing infrastructure and ensures the forum meets quality standards before production deployment.

Write unit tests for all API route handlers covering authentication, input validation, CRUD operations, voting mechanics, and error handling. Use a test framework compatible with the Next.js API route structure (such as Vitest or Jest). Mock database interactions and contract reads to test business logic in isolation.

Write integration tests for the authentication flow end to end: nonce generation, message signing (with a test wallet), signature verification, JWT issuance, and authenticated API access. Test that invalid signatures, expired nonces, and malformed requests are rejected.

Write integration tests for the governance sync mechanism: proposal detection, thread creation, status updates, and correct linking between on-chain proposals and forum threads.

Write component tests for key UI elements: the wallet connection flow, the thread creation form with markdown preview, the nested comment tree, the voting interface, and the notification dropdown. Use a component testing library such as React Testing Library.

Perform manual testing on both desktop and mobile browsers. Verify that the design matches the main Fetch Quests platform exactly, that the glass panel rendering, asymmetric corners, typography, and color system are consistent. Test wallet connection with both Coinbase Smart Wallet and MetaMask on desktop and mobile. Test the responsive layout at standard breakpoints (320px, 375px, 768px, 1024px, 1440px).

Conduct a security review of all API endpoints. Verify that all user input is sanitized before rendering to prevent XSS. Verify that SQL queries use parameterized statements to prevent injection. Verify that authentication is enforced on all protected endpoints. Verify that rate limiting is active. Verify that the server-side wallet private key (if used for ANORAK minting) is not accessible from the client.

---

## Phase 9 -- Deployment and Launch

The ninth phase covers the production deployment, domain configuration, and launch activities.

Configure the production Vercel deployment with the production database connection string (Vercel Postgres), the production JWT secret, the mainnet contract addresses (Base chain ID 8453), the production SIWE domain (forum.fetchquests.org), and the CDP Paymaster URL for mainnet gasless transactions.

Set up the forum.fetchquests.org subdomain with DNS records pointing to Vercel. Configure SSL through Vercel's automatic certificate provisioning. Verify that the SIWE message domain matches the production URL.

Run the database migrations against the production database. Seed the production categories table with the default forum categories. Verify that all contract reads against Base mainnet return correct data.

Perform a final round of end-to-end testing on the production deployment including wallet connection, authentication, thread creation, commenting, voting, proposal sync, contract data display, and notification delivery.

Configure monitoring and alerting for the production deployment. Set up error tracking (such as Sentry) for both the frontend and serverless functions. Set up database monitoring through the Vercel Postgres dashboard. Set up uptime monitoring for the forum URL.

Announce the forum launch through existing Fetch Quests communication channels. Update the main Fetch Quests application to link to the forum for governance discussions, wiki content, and community interaction. Remove or redirect the standalone Wiki, ANORAK, Oracle, and Community DAO pages on the main platform to their corresponding forum sections.

---

## Phase 10 -- Post-Launch Iteration

The tenth phase covers post-launch improvements driven by real usage data and community feedback.

Monitor forum usage patterns and adjust the ANORAK reward parameters (amounts, cooldowns, caps) based on observed behavior. If reward farming emerges as a problem, tighten cooldowns or introduce quality gates such as requiring a minimum number of upvotes before a post earns rewards.

Gather feedback from Community Share holders and active community members through the forum itself, using a dedicated Feedback category. Prioritize feature requests and bug reports based on governance relevance and user impact.

Evaluate the need for additional forum features based on community demand. Potential additions include direct messaging between forum users, thread tagging and filtering, user reputation badges specific to forum activity, embedded contract interaction widgets (such as a "vote on this proposal" button directly in the proposal discussion thread), and email or push notification delivery for users who opt in.

Iterate on the moderation tooling based on actual moderation needs. If spam or abuse becomes a problem, consider adding automated moderation rules (such as holding posts from new accounts for review) or increasing the ANORAK threshold for posting.

Maintain the forum's codebase and dependencies. Keep Next.js, wagmi, viem, and other dependencies up to date. Monitor for security advisories and apply patches promptly. Ensure that contract ABI updates from the fetch-quests-smart-contracts repository are reflected in the forum's contract configuration when new contract versions are deployed.
