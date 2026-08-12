import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { BadgeCheck, FileSearch, Layers, Search, Sparkles, Users } from "lucide-react";
import { Link } from "wouter";

const PRINCIPLES: { title: string; desc: string; evidence: string }[] = [
  {
    title: "One skill, every name",
    desc: "A 400+ skill controlled vocabulary with 650+ aliases. 'JS' matches 'JavaScript' everywhere — search, filters, matching — resolved at query time, never at write time.",
    evidence: "439 canonical entries · 658 aliases · resolve() on every query",
  },
  {
    title: "Resume parsing, with consent",
    desc: "Upload a PDF and get structured suggestions for work history, education, and skills. Nothing touches your profile until you explicitly confirm each suggestion.",
    evidence: "suggestion → explicit confirm/reject → never silent writes",
  },
  {
    title: "Profiles that are refresh-proof",
    desc: "The multi-step profile builder persists every step server-side. Refresh mid-flow, close the tab, come back — nothing is lost. A live completeness score keeps you moving.",
    evidence: "ProfileDraft table · per-step save · restore on load",
  },
  {
    title: "Jobs worth reading",
    desc: "Employers publish with required and preferred skills, salary ranges, remote policy, and seniority. Publish and unpublish on your own schedule.",
    evidence: "required/preferred split · salary range · 4 remote policies · 5 seniorities",
  },
  {
    title: "Measurable matching",
    desc: "One SQL query ranks jobs by text relevance, skill overlap, distance, recency, and salary fit into an explainable 0–100 score — with typo tolerance, keyset pagination, and facet counts. A seeded population of 5,100 candidates, 2,100 jobs, and 22,000 applications gives real signal to test relevance properly.",
    evidence: "0–100 score · breakdown bar · 'javascrpt' still works",
  },
  {
    title: "Data that earns trust",
    desc: "Extraction is unreliable, so nothing is applied silently. Every parsed resume result is a suggestion the candidate reviews. Clean data is the product.",
    evidence: "structured parse → candidate decision → verified profile",
  },
  {
    title: "A pipeline that never lies about history",
    desc: "Every stage move appends an immutable event — no overwrites, ever. Recruiters move cards on a kanban, message candidates per application, and see the complete timeline. Moderation and spam scoring keep the pool clean.",
    evidence: "ApplicationStageEvent · append-only · per-application chat",
  },
  {
    title: "Notifications that respect attention",
    desc: "A durable queue with retry, exponential backoff, and a dead-letter view; daily and weekly job-alert digests that never re-send the same job; one-click unsubscribe without login; and an in-app centre with read state.",
    evidence: "job_key idempotency · digestSent ledger · failure-rate ops view",
  },
];

function Principle({ n, title, desc, evidence }: { n: number; title: string; desc: string; evidence: string }) {
  return (
    <div className="grid md:grid-cols-12 gap-4 md:gap-8 py-7 border-b border-border last:border-0 group">
      <div className="md:col-span-1">
        <span className="font-display text-3xl text-amber-ink/80 group-hover:text-amber-ink transition-colors">{String(n).padStart(2, "0")}</span>
      </div>
      <div className="md:col-span-4">
        <h3 className="text-lg font-semibold leading-snug">{title}</h3>
      </div>
      <div className="md:col-span-5">
        <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
      </div>
      <div className="md:col-span-2">
        <span className="inline-block font-mono text-[11px] leading-relaxed text-amber-ink/80 bg-amber-ink/10 rounded px-2 py-1.5">{evidence}</span>
      </div>
    </div>
  );
}

export default function Home() {
  const { isAuthenticated } = useAuth();
  const { data: stats } = trpc.skills.stats.useQuery(undefined, { staleTime: 5 * 60_000 });

  const fmt = (n?: number) => (n ? n.toLocaleString() : "5,000+");

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="ink-surface">
        <div className="container py-20 md:py-28 grid md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-7 rise-in">
            <p className="font-mono text-xs tracking-[0.2em] uppercase text-amber-ink mb-4">
              Ranked matching · ATS · Notifications — the complete platform
            </p>
            <h1 className="text-4xl md:text-6xl font-bold leading-[1.05] mb-6">
              Every application, <span className="italic text-amber-ink">ranked, tracked,</span> and answered.
            </h1>
            <p className="text-lg text-white/70 max-w-xl mb-8 leading-relaxed">
              Every skill on HireWise is one canonical entry — “JS” and “JavaScript” resolve
              to the same skill everywhere. Search ranks results with an explainable 0–100
              match score, the ATS tracks every stage change as immutable history, and a
              notification engine keeps everyone in the loop.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="gap-2 text-base">
                <Link href="/jobs">
                  <Search className="h-5 w-5" /> Browse {fmt(stats?.jobs)} open jobs
                </Link>
              </Button>
              {isAuthenticated ? (
                <Button asChild size="lg" variant="outline" className="gap-2 text-base border-white/25 text-white hover:bg-white/10">
                  <Link href="/candidate">My candidate dashboard</Link>
                </Button>
              ) : (
                <Button onClick={() => startLogin()} size="lg" variant="outline" className="gap-2 text-base border-white/25 text-white hover:bg-white/10">
                  <Users className="h-5 w-5" /> Create your profile
                </Button>
              )}
            </div>
          </div>
          <div className="md:col-span-5 hidden md:block">
            <div className="relative">
              <div className="absolute -inset-6 bg-amber-ink/10 rounded-3xl rotate-2" />
              <div className="relative bg-white/[0.04] border border-white/10 rounded-2xl p-6 backdrop-blur">
                <div className="flex items-center gap-2 mb-5">
                  <Search className="h-4 w-4 text-amber-ink" />
                  <span className="font-mono text-sm text-white/80">search: &quot;js&quot;</span>
                </div>
                {["javascript", "js/jsx", "node.js", "typescript"].map((s, i) => (
                  <div key={s} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                    <span className="text-sm text-white/90">{s}</span>
                    <span className={`text-xs font-mono px-2 py-0.5 rounded ${i === 0 ? "bg-amber-ink/25 text-amber-ink" : "bg-white/10 text-white/60"}`}>
                      {i === 0 ? "canonical" : `→ javascript`}
                    </span>
                  </div>
                ))}
                <p className="text-xs text-white/50 mt-4 font-mono">
                  All aliases resolve to one canonical skill entry — even at query time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats band */}
      <section className="border-b border-border bg-card">
        <div className="container grid grid-cols-2 md:grid-cols-4 py-10 gap-6">
          {[
            { label: "Candidates", value: fmt(stats?.candidates), sub: "seeded population" },
            { label: "Open jobs", value: fmt(stats?.jobs), sub: "published listings" },
            { label: "Applications", value: fmt(stats?.applications), sub: "submitted matches" },
            { label: "Canonical skills", value: fmt(stats?.skills), sub: "aliases resolve at query time" },
          ].map((s) => (
            <div key={s.label} className="text-center md:text-left">
              <div className="text-3xl md:text-4xl font-bold font-display">{s.value}</div>
              <div className="text-sm font-medium mt-1">{s.label}</div>
              <div className="text-xs text-muted-foreground">{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="container py-20">
        <div className="max-w-2xl mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Built for relevance, not just activity.</h2>
          <p className="text-muted-foreground leading-relaxed">
            Every product decision exists so matching quality can actually be measured,
            hiring pipelines stay auditable, and no candidate data is ever quietly corrupted.
          </p>
        </div>
        <div className="bg-card card-lift rounded-2xl border border-border px-6 md:px-10">
          <div className="flex items-center gap-3 py-4 border-b border-border">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Operating principles</span>
            <span className="h-px flex-1 bg-border" />
            <span className="font-mono text-[11px] text-muted-foreground">no silent writes · consent before data · query-time resolution</span>
          </div>
          {PRINCIPLES.map((p, i) => (
            <Principle key={p.title} n={i + 1} {...p} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container pb-20">
        <div className="ink-surface rounded-2xl px-8 md:px-14 py-12 md:py-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Ready to be matched, not just indexed?</h2>
            <p className="text-white/70">Candidates and employers both start free. Set up in minutes.</p>
          </div>
          <div className="flex gap-3">
            {isAuthenticated ? (
              <>
                <Button asChild size="lg"><Link href="/candidate">Candidate flow</Link></Button>
                <Button asChild size="lg" variant="outline" className="border-white/25 text-white hover:bg-white/10"><Link href="/employer">Employer flow</Link></Button>
              </>
            ) : (
              <Button size="lg" className="gap-2" onClick={() => startLogin()}>
                <Sparkles className="h-4 w-4" /> Sign in to get started
              </Button>
            )}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
