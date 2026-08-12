import { SiteLayout } from "@/components/SiteLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import {
  ArrowRight,
  Building2,
  Check,
  DollarSign,
  Gauge,
  MapPin,
  Search,
  Sparkles,
  Wifi,
  X,
  Zap,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useCallback, useEffect, useMemo, useState } from "react";

const REMOTE_LABELS: Record<string, string> = {
  onsite: "On-site",
  hybrid: "Hybrid",
  remote: "Remote",
  flexible: "Flexible",
};

const SENIORITY_LABELS: Record<string, string> = {
  junior: "Junior",
  mid: "Mid-level",
  senior: "Senior",
  lead: "Lead",
  staff: "Staff",
};

const SALARY_BUCKETS = ["under-50k", "50k-100k", "100k-150k", "over-150k"] as const;
const SALARY_LABELS: Record<string, string> = {
  "under-50k": "Under $50k",
  "50k-100k": "$50k – $100k",
  "100k-150k": "$100k – $150k",
  "over-150k": "Over $150k",
};

/** Search state kept in the URL so results are shareable & back-button correct. */
function readUrlState() {
  const p = new URLSearchParams(window.location.search);
  const v = p.get("v") ?? "ranked";
  const q = p.get("q") ?? "";
  const remote = p.get("remote")?.split(",") ?? [];
  const seniority = p.get("seniority")?.split(",") ?? [];
  const buckets = p.get("bucket")?.split(",") ?? [];
  const lat = p.get("lat");
  const lng = p.get("lng");
  return {
    v,
    q,
    remote,
    seniority,
    buckets,
    candidateLat: lat ? Number(lat) : undefined,
    candidateLng: lng ? Number(lng) : undefined,
  };
}

export default function Jobs() {
  const [, navigate] = useLocation();
  const [urlState, setUrlState] = useState(readUrlState);
  const [input, setInput] = useState(urlState.q);
  const [showBreakdown, setShowBreakdown] = useState<Record<number, boolean>>({});

  // Debounce query input → URL state (shareable URL)
  useEffect(() => {
    const t = setTimeout(() => {
      setUrlState((s) => ({ ...s, q: input }));
    }, 350);
    return () => clearTimeout(t);
  }, [input]);

  // Sync URL state back to the URL (but don't loop on hash changes)
  useEffect(() => {
    const p = new URLSearchParams();
    if (urlState.q) p.set("q", urlState.q);
    if (urlState.v !== "ranked") p.set("v", urlState.v);
    if (urlState.remote.length) p.set("remote", urlState.remote.join(","));
    if (urlState.seniority.length) p.set("seniority", urlState.seniority.join(","));
    if (urlState.buckets.length) p.set("bucket", urlState.buckets.join(","));
    const s = p.toString();
    const target = s ? `/jobs?${s}` : "/jobs";
    if (window.location.pathname + window.location.search !== target) {
      window.history.replaceState(null, "", target);
    }
  }, [urlState]);

  // Listen for browser back/forward
  useEffect(() => {
    const onPop = () => setUrlState(readUrlState());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Keyset pagination state (opaque cursor from server)
  const [cursor, setCursor] = useState<[number, number] | null>(null);
  const [accRows, setAccRows] = useState<any[]>([]);
  const [more, setMore] = useState(false);
  const prevQuery = `${urlState.v}|${urlState.q}|${urlState.remote.join(",")}|${urlState.seniority.join(",")}|${urlState.buckets.join(",")}`;
  const prevKeyRef = useMemo(() => ({ key: "" }), []);
  const keyChanged = prevKeyRef.key !== prevQuery;
  prevKeyRef.key = prevQuery;

  const remoteSet = new Set(urlState.remote);
  const senioritySet = new Set(urlState.seniority);
  const bucketSet = new Set(urlState.buckets);

  // Map salary bucket selection to min/max salary for the ranked query
  const salaryRange = useMemo(() => {
    let min: number | undefined;
    let max: number | undefined;
    if (bucketSet.has("under-50k")) { max = 50000; }
    if (bucketSet.has("50k-100k")) { min = 50000; max = 100000; }
    if (bucketSet.has("100k-150k")) { min = 100000; max = 150000; }
    if (bucketSet.has("over-150k")) { min = 150000; }
    // multi-bucket → widen range to union
    if (bucketSet.size > 1) {
      min = bucketSet.has("under-50k") || bucketSet.has("50k-100k") ? undefined : min;
      max = bucketSet.has("over-150k") || bucketSet.has("100k-150k") ? undefined : max;
      if (bucketSet.has("under-50k") && bucketSet.has("over-150k")) { min = undefined; max = undefined; }
    }
    return { min, max };
  }, [bucketSet]);

  const rankedInput = useMemo(
    () => ({
      query: urlState.q.trim() || undefined,
      remotePolicy: urlState.remote.length === 1 ? (urlState.remote[0] as any) : undefined,
      seniority: urlState.seniority.length === 1 ? (urlState.seniority[0] as any) : undefined,
      locationId: undefined as number | undefined,
      minSalary: salaryRange.min,
      maxSalary: salaryRange.max,
      candidateLat: urlState.candidateLat,
      candidateLng: urlState.candidateLng,
      cursor,
      pageSize: 20,
    }),
    [urlState.q, urlState.remote, urlState.seniority, salaryRange, urlState.candidateLat, urlState.candidateLng, cursor],
  );

  const { data: ranked, isLoading, isFetching } = trpc.jobs.ranked.useQuery(rankedInput, {
    placeholderData: (prev) => (keyChanged ? undefined : prev),
    refetchOnWindowFocus: false,
  });

  // Client-side multi-select facet filtering (server ranks everything; facets slice).
  const rows = useMemo(() => {
    const raw = (ranked?.rows ?? []).filter((r) => {
      if (remoteSet.size && !remoteSet.has(r.remotePolicy ?? "")) return false;
      if (senioritySet.size && !senioritySet.has(r.seniority ?? "")) return false;
      return true;
    });
    return raw;
  }, [ranked?.rows, remoteSet, senioritySet]);

  useEffect(() => {
    if (keyChanged) {
      setCursor(null);
      setAccRows([]);
      setShowBreakdown({});
    }
  }, [keyChanged]);

  const loadMore = useCallback(() => {
    if (!ranked?.nextCursor || more) return;
    setMore(true);
    setCursor(ranked.nextCursor);
  }, [ranked?.nextCursor, more]);

  // Accumulate pages when cursor advances
  useEffect(() => {
    if (!ranked?.rows) return;
    setAccRows((prev) => {
      const ids = new Set(prev.map((r) => r.id));
      const fresh = ranked.rows.filter((r) => !ids.has(r.id));
      const next = cursor === null ? ranked.rows : [...prev, ...fresh];
      return next;
    });
    setMore(false);
  }, [ranked?.rows, cursor, keyChanged]);

  const { data: locations } = trpc.jobs.locations.useQuery(undefined, { staleTime: 10 * 60_000 });

  // Facet counts are server-computed for the current query + active filters (each facet excludes its own dimension).
  const facetInput = useMemo(() => {
    // Each facet counts with its OWN dimension excluded; the union range of other salary buckets is included.
    const sRemote = remoteSet.size === 1 ? Array.from(remoteSet)[0] : undefined;
    const sSeniority = senioritySet.size === 1 ? Array.from(senioritySet)[0] : undefined;
    let min = salaryRange.min;
    let max = salaryRange.max;
    if (bucketSet.size > 1) {
      // widen to union so the salary facet is counted across all selected buckets
      min = bucketSet.has("under-50k") || bucketSet.has("50k-100k") ? undefined : min;
      max = bucketSet.has("over-150k") || bucketSet.has("100k-150k") ? undefined : max;
      if (bucketSet.has("under-50k") && bucketSet.has("over-150k")) { min = undefined; max = undefined; }
    }
    return {
      query: urlState.q.trim() || undefined,
      remotePolicy: sRemote as any,
      seniority: sSeniority as any,
      minSalary: min,
      maxSalary: max,
    };
  }, [urlState.q, remoteSet, senioritySet, bucketSet, salaryRange]);
  const { data: facets } = trpc.jobs.facetCounts.useQuery(facetInput, { placeholderData: (prev) => prev });

  const { data: resolvedSkills } = trpc.skills.namesByIds.useQuery(
    { ids: [] as number[] },
    { enabled: false, staleTime: 10 * 60_000 },
  );

  // Resolve names of skill terms typed in the search box (alias breadcrumbs)
  const [terms, setTerms] = useState<string[]>([]);
  useEffect(() => {
    const t = urlState.q.trim().split(/[\s,;]+/).filter(Boolean).slice(0, 5);
    const tt = setTimeout(() => setTerms(t), 350);
    return () => clearTimeout(tt);
  }, [urlState.q]);
  const { data: skillNames } = trpc.skills.namesByIds.useQuery(
    { ids: [] },
    { enabled: false, staleTime: 10 * 60_000 },
  );

  const facetCount = (kind: "remote" | "seniority" | "salaryBucket") =>
    kind === "salaryBucket" ? facets?.salaryBucket ?? {} : kind === "remote" ? (facets?.remote ?? {}) : (facets?.seniority ?? {});

  const toggleFacet = (kind: "remote" | "seniority" | "bucket", value: string) => {
    setUrlState((s) => {
      const list = kind === "remote" ? s.remote : kind === "seniority" ? s.seniority : s.buckets;
      const next = list.includes(value) ? list.filter((x) => x !== value) : [...list, value];
      return { ...s, [kind === "bucket" ? "buckets" : kind]: next };
    });
  };

  const clearAll = () => {
    setUrlState((s) => ({ ...s, q: "", remote: [], seniority: [], buckets: [] }));
    setInput("");
  };

  const filterCount = urlState.remote.length + urlState.seniority.length + urlState.buckets.length;

  return (
    <SiteLayout>
      <div className="ink-surface">
        <div className="container py-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Find your next role</h1>
              <p className="text-white/70 max-w-xl text-sm md:text-base">
                Every result carries an explainable match score (0–100) computed in a single SQL
                pass: text relevance, required/preferred skill overlap, distance, recency and
                salary compatibility.
              </p>
            </div>
            <div className="flex gap-2">
              <Badge variant={urlState.v === "ranked" ? "default" : "outline"} className="cursor-pointer" onClick={() => setUrlState((s) => ({ ...s, v: "ranked" }))}>
                <Gauge className="h-3 w-3 mr-1" /> Ranked
              </Badge>
              <Badge variant={urlState.v !== "ranked" ? "default" : "outline"} className="cursor-pointer" onClick={() => setUrlState((s) => ({ ...s, v: "browse" }))}>
                <Zap className="h-3 w-3 mr-1" /> Browse
              </Badge>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3 mt-6">
            <div className="relative md:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder='Try "js" or "javascrpt" (typo-tolerant)…'
                className="pl-10 bg-card"
              />
            </div>
            <Select value={urlState.candidateLat ? `${urlState.candidateLat},${urlState.candidateLng}` : "any"} onValueChange={(v) => {
              if (v === "any") setUrlState((s) => ({ ...s, candidateLat: undefined, candidateLng: undefined }));
              else {
                const [lat, lng] = v.split(",").map(Number);
                setUrlState((s) => ({ ...s, candidateLat: lat, candidateLng: lng }));
              }
            }}>
              <SelectTrigger className="w-full md:w-52 bg-card"><SelectValue placeholder="My location" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any location</SelectItem>
                {(locations ?? []).slice(0, 30).map((l) => (
                  <SelectItem key={l.id} value={`${l.latitude},${l.longitude}`}>{l.displayName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAll} className="gap-1">
                <X className="h-3.5 w-3.5" /> Clear filters ({filterCount})
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container py-8 flex flex-col lg:flex-row gap-8">
        {/* Facet sidebar */}
        <aside className="lg:w-64 shrink-0 space-y-6">
          <FacetGroup title="Remote policy" counts={facetCount("remote")} labels={REMOTE_LABELS} selected={urlState.remote} onToggle={(v) => toggleFacet("remote", v)} />
          <FacetGroup title="Seniority" counts={facetCount("seniority")} labels={SENIORITY_LABELS} selected={urlState.seniority} onToggle={(v) => toggleFacet("seniority", v)} />
          <div>
            <h4 className="text-sm font-semibold mb-3 text-foreground">Salary band</h4>
            <div className="space-y-2">
              {SALARY_BUCKETS.map((b) => (
                <label key={b} className="flex items-center gap-2 text-sm cursor-pointer group">
                  <Checkbox
                    checked={bucketSet.has(b)}
                    onCheckedChange={() => toggleFacet("bucket", b)}
                  />
                  <span className="text-muted-foreground group-hover:text-foreground transition-colors">{SALARY_LABELS[b]}</span>
                  <span className="ml-auto text-xs font-mono text-muted-foreground">{facets?.salaryBucket?.[b] ?? 0}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="text-[11px] font-mono text-muted-foreground border-t border-border pt-3">
            Counts reflect the current keyword match, with each facet's own dimension excluded.
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1 min-w-0">
          {urlState.v !== "ranked" ? (
            <BrowseMode urlState={urlState} />
          ) : isLoading ? (
            <div className="grid gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-36 rounded-xl" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <div className="text-center py-20">
              <Sparkles className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-1">No jobs match this search</h3>
              <p className="text-sm text-muted-foreground">
                {ranked && ranked.totalWithTypo > 0
                  ? "Try a different keyword, or clear some filters."
                  : "Try a broader term — mistyped keywords still fall back to fuzzy matching."}
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-4 flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-foreground">{ranked?.totalExact ?? rows.length}</span>
                <span>exact matches</span>
                {ranked && ranked.totalWithTypo > ranked.totalExact && (
                  <>
                    <span className="text-border">·</span>
                    <span className="font-semibold text-amber">{ranked.totalWithTypo - ranked.totalExact}</span>
                    <span>fuzzy (typo-tolerant) matches included</span>
                  </>
                )}
              </p>

              <div className="grid gap-4">
                {rows.map((job: any) => (
                  <div key={job.id} className="bg-card card-lift rounded-xl border border-border p-5 md:p-6">
                    <div className="flex items-start justify-between gap-3">
                      <Link href={`/jobs/${job.id}`} className="block min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-medium text-sm text-muted-foreground flex items-center gap-1.5">
                            <Building2 className="h-3.5 w-3.5" /> {job.companyName}
                          </span>
                          <Badge variant={job.seniority === "senior" || job.seniority === "lead" || job.seniority === "staff" ? "default" : "secondary"}>
                            {SENIORITY_LABELS[job.seniority]}
                          </Badge>
                          <Badge variant="outline" className="gap-1">
                            <Wifi className="h-3 w-3" /> {REMOTE_LABELS[job.remotePolicy]}
                          </Badge>
                        </div>
                        <h3 className="text-lg font-semibold leading-tight truncate">{job.title}</h3>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" /> {job.locationName ?? "Location flexible"}
                          </span>
                          <span className="flex items-center gap-1 font-mono">
                            <DollarSign className="h-3.5 w-3.5" />
                            {job.salaryMin != null
                              ? `$${Number(job.salaryMin).toLocaleString()} – $${Number(job.salaryMax).toLocaleString()}`
                              : "Salary not disclosed"}
                          </span>
                          <span>{job.postedDaysAgo ?? 0}d ago</span>
                        </div>
                      </Link>
                      <div className="text-right shrink-0">
                        <div className="flex items-center gap-2 justify-end">
                          <ScorePill score={job.score} />
                        </div>
                        <button
                          onClick={() => setShowBreakdown((m) => ({ ...m, [job.id]: !m[job.id] }))}
                          className="text-[11px] font-mono text-muted-foreground hover:text-amber underline-offset-2 hover:underline mt-1"
                        >
                          {showBreakdown[job.id] ? "hide breakdown" : "score breakdown"}
                        </button>
                      </div>
                    </div>
                    {showBreakdown[job.id] && <ScoreBreakdown job={job} />}
                    <div className="mt-3">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/jobs/${job.id}`}>View & apply</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {ranked?.nextCursor && (
                <div className="flex justify-center mt-8">
                  <Button variant="outline" onClick={loadMore} disabled={more || isFetching}>
                    {more || isFetching ? "Loading…" : "Load more results"}
                  </Button>
                </div>
              )}
              {!ranked?.nextCursor && rows.length > 0 && (
                <p className="text-center text-xs text-muted-foreground mt-8">You've reached the end — all matching jobs shown.</p>
              )}
            </>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}

function FacetGroup({
  title,
  counts,
  labels,
  selected,
  onToggle,
}: {
  title: string;
  counts: Record<string, number>;
  labels: Record<string, string>;
  selected: string[];
  onToggle: (value: string) => void;
}) {
  const entries = Object.entries(counts).filter(([, c]) => c > 0).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) return null;
  return (
    <div>
      <h4 className="text-sm font-semibold mb-3 text-foreground">{title}</h4>
      <div className="space-y-2">
        {entries.map(([k, c]) => (
          <label key={k} className="flex items-center gap-2 text-sm cursor-pointer group">
            <Checkbox checked={selected.includes(k)} onCheckedChange={() => onToggle(k)} />
            <span className="text-muted-foreground group-hover:text-foreground transition-colors">{labels[k] ?? k}</span>
            <span className="ml-auto text-xs font-mono text-muted-foreground">{c}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function ScorePill({ score }: { score: number }) {
  const tone =
    score >= 70 ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/30"
    : score >= 40 ? "text-amber bg-amber/10 border-amber/30"
    : "text-muted-foreground bg-secondary border-border";
  return (
    <span className={`inline-flex items-center gap-1.5 font-mono text-sm font-semibold px-2.5 py-1 rounded-md border ${tone}`}>
      <Gauge className="h-3.5 w-3.5" /> {score}
    </span>
  );
}

function ScoreBreakdown({ job }: { job: any }) {
  const parts = [
    { label: "Text match", value: job.text },
    { label: "Skill overlap", value: job.skills },
    { label: "Location fit", value: job.distance },
    { label: "Recency", value: job.recency },
    { label: "Salary fit", value: job.salary },
  ];
  return (
    <div className="mt-4 pt-4 border-t border-border">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {parts.map((p) => (
          <div key={p.label}>
            <div className="flex justify-between text-[11px] font-mono text-muted-foreground mb-1">
              <span>{p.label}</span>
              <span>{p.value}/100</span>
            </div>
            <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
              <div className="h-full rounded-full bg-amber transition-all duration-500" style={{ width: `${p.value}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Fallback: keep the original simple browse view when the toggle is off. */
function BrowseMode({ urlState }: { urlState: any }) {
  const [page, setPage] = useState(1);
  const { data, isLoading } = trpc.jobs.browse.useQuery({
    page,
    pageSize: 20,
    query: urlState.q.trim() || undefined,
    remotePolicy: urlState.remote.length === 1 ? urlState.remote[0] : undefined,
    seniority: urlState.seniority.length === 1 ? urlState.seniority[0] : undefined,
  });
  const rows = data?.rows ?? [];
  const total = data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / 20));
  return (
    <>
      <p className="text-sm text-muted-foreground mb-4">{total.toLocaleString()} job{total === 1 ? "" : "s"} · page {page} of {pages}</p>
      {isLoading ? (
        <div className="grid gap-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-xl" />)}</div>
      ) : rows.length === 0 ? (
        <div className="text-center py-20">
          <Sparkles className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-1">No jobs match this search</h3>
          <p className="text-sm text-muted-foreground">Try a broader term or remove a filter.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4">
            {rows.map((job: any) => (
              <Link key={job.id} href={`/jobs/${job.id}`} className="block bg-card card-lift rounded-xl border border-border p-5 md:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-medium text-sm text-muted-foreground flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5" /> {job.companyName}
                      </span>
                      <Badge variant="outline" className="gap-1"><Wifi className="h-3 w-3" /> {REMOTE_LABELS[job.remotePolicy]}</Badge>
                    </div>
                    <h3 className="text-lg font-semibold leading-tight truncate">{job.title}</h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                      <span>{job.locationLabel ?? "Location flexible"}</span>
                      <span className="font-mono">{job.salaryMin != null ? `$${Number(job.salaryMin).toLocaleString()} – $${Number(job.salaryMax).toLocaleString()}` : "Salary not disclosed"}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="shrink-0">View & apply</Button>
                </div>
              </Link>
            ))}
          </div>
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <span className="text-sm text-muted-foreground px-2">Page {page} of {pages}</span>
            <Button variant="outline" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </>
      )}
    </>
  );
}
