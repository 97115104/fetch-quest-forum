import { Shell } from "@/components/shell";
import Link from "next/link";

/**
 * Seed categories shown before the database is connected.
 * These mirror the categories defined in development-todo-list.md.
 */
const SEED_CATEGORIES = [
  {
    slug: "general",
    name: "General Discussion",
    description:
      "Open conversation about the Fetch Quests platform, quest strategies, and community updates.",
  },
  {
    slug: "governance",
    name: "Governance Proposals",
    description:
      "Discuss and debate active governance proposals before they go to an on-chain vote.",
  },
  {
    slug: "quests",
    name: "Quest Talk",
    description:
      "Share quest ideas, post bounties, and coordinate with other questers.",
  },
  {
    slug: "anorak",
    name: "ANORAK Token",
    description:
      "Everything about ANORAK tokenomics, staking, and Community Shares.",
  },
  {
    slug: "bugs",
    name: "Bug Reports",
    description:
      "Report bugs, UI issues, or unexpected behaviour on the platform.",
  },
];

export default function Home() {
  return (
    <Shell>
      <section className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
          Fetch Quests Forum
        </h1>
        <p className="mt-2 text-[var(--text-secondary)] text-sm leading-relaxed max-w-2xl">
          The community hub for discussing governance proposals, sharing quest
          strategies, and shaping the future of the platform together.
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        {SEED_CATEGORIES.map((cat) => (
          <Link
            key={cat.slug}
            href={`/c/${cat.slug}`}
            className="glass glass-interactive block p-5"
          >
            <h2 className="font-display text-lg font-semibold">{cat.name}</h2>
            <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">
              {cat.description}
            </p>
          </Link>
        ))}
      </div>
    </Shell>
  );
}
