import { Fragment } from "react";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trpc } from "@/lib/trpc";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Eye,
  FileText,
  GraduationCap,
  History,
  MapPin,
  Play,
  Plus,
  Save,
  Search,
  Trash2,
  UserCheck,
} from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

const STATUS_STYLES: Record<string, string> = {
  applied: "bg-secondary text-secondary-foreground",
  screening: "bg-sky-100 text-sky-800",
  interview: "bg-amber-100 text-amber-800",
  offered: "bg-emerald-100 text-emerald-800",
  accepted: "bg-emerald-100 text-emerald-800",
  rejected: "bg-rose-100 text-rose-700",
  withdrawn: "bg-muted text-muted-foreground",
};

export default function CandidateDashboard() {
  const { isAuthenticated, user } = useAuth();
  const { data: snapshot, isLoading } = trpc.candidates.snapshot.useQuery(undefined, { enabled: isAuthenticated });
  const { data: applications } = trpc.applications.myApplications.useQuery(undefined, { enabled: isAuthenticated });
  const { data: savedSearches } = trpc.savedSearches.list.useQuery(undefined, { enabled: isAuthenticated });
  const [viewHist, setViewHist] = useState<any>(null);

  if (!isAuthenticated) {
    return (
      <SiteLayout>
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold mb-3">Sign in to see your candidate dashboard</h1>
          <Button onClick={() => startLogin()}>Sign in</Button>
        </div>
      </SiteLayout>
    );
  }

  const completeness = snapshot?.completeness;
  const score = completeness?.score ?? 0;

  return (
    <SiteLayout>
      <div className="container py-10 max-w-5xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Candidate dashboard</h1>
            <p className="text-muted-foreground mt-1">Your profile, applications, and next steps.</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" className="gap-1.5">
              <Link href="/jobs"><Building2 className="h-4 w-4" /> Browse jobs</Link>
            </Button>
            <Button asChild className="gap-1.5">
              <Link href="/profile-builder">
                {snapshot?.profile ? "Continue building profile" : "Build my profile"} <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Completeness card */}
        <Card className="mb-8 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="relative h-28 w-28 shrink-0">
                <svg viewBox="0 0 36 36" className="h-28 w-28 -rotate-90">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="oklch(0.93 0.015 85)" strokeWidth="3" />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="oklch(0.62 0.13 65)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={`${score}, 100`}
                    style={{ transition: "stroke-dasharray 500ms cubic-bezier(0.23,1,0.32,1)" }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold font-display">{score}%</span>
                </div>
              </div>
              <div className="flex-1 w-full">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-semibold">Profile completeness</h2>
                  <span className="text-xs text-muted-foreground">
                    {completeness?.sections.filter((s) => s.done).length}/{completeness?.sections.length ?? 0} sections done
                  </span>
                </div>
                <Progress value={score} className="h-2 mb-4" />
                <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5">
                  {completeness?.sections.map((s) => (
                    <div key={s.key} className="flex items-center gap-2 text-sm">
                      {s.done ? (
                        <BadgeCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                      ) : (
                        <Plus className="h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                      <span className={s.done ? "text-foreground" : "text-muted-foreground"}>{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Snapshot summary */}
        {isLoading ? (
          <Skeleton className="h-40 rounded-xl" />
        ) : !snapshot?.profile ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Welcome — let's build your profile</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Your profile unlocks applications. The builder persists every step, so refreshing never loses your progress.
              </p>
              <Button asChild><Link href="/profile-builder">Start the profile builder <ArrowRight className="h-4 w-4" /></Link></Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg">At a glance</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground"><UserCheck className="h-4 w-4" /> {snapshot.skills.length} skills</div>
              <div className="flex items-center gap-2 text-muted-foreground"><BadgeCheck className="h-4 w-4" /> {snapshot.workHistory.length} roles</div>
              <div className="flex items-center gap-2 text-muted-foreground"><GraduationCap className="h-4 w-4" /> {snapshot.education.length} education</div>
              <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4" /> {(snapshot.profile as any).remotePolicy ?? "—"} policy</div>
            </CardContent>
          </Card>
        )}

        {/* Employer interest: profile views */}
        {snapshot?.profile && <ProfileViewsCard profileId={snapshot.profile.id} />}

        {/* Saved searches */}
        {isAuthenticated && <SavedSearchesPanel />}

        {/* Applications */}
        <h2 className="text-xl font-bold mb-4 mt-10">Your applications</h2>
        {applications && applications.length > 0 ? (
          <div className="space-y-3">
            {applications.map((a) => (
              <Link key={a.id} href={`/jobs/${a.jobId}`} className="block bg-card card-lift rounded-xl border border-border p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{a.job?.title ?? `Job #${a.jobId}`}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                      <Building2 className="h-3.5 w-3.5" /> {a.company?.name ?? "Company"}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-muted-foreground font-mono">{new Date(a.createdAt).toLocaleDateString()}</span>
                    <Badge className={STATUS_STYLES[a.status] ?? "bg-secondary"}>{a.status}</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2"
                      onClick={(e) => {
                        e.preventDefault();
                        setViewHist(a);
                      }}
                      aria-label="Application timeline"
                    >
                      <History className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 pb-6 flex items-center gap-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="font-medium">No applications yet</p>
                <p className="text-sm text-muted-foreground">Browse {""}
                  <Link href="/jobs" className="text-primary underline underline-offset-2">open jobs</Link> and apply in one click.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Application stage timeline dialog */}
        <Dialog open={!!viewHist} onOpenChange={(o) => !o && setViewHist(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Application history</DialogTitle>
              <DialogDescription>
                {viewHist?.job?.title ?? `Job #${viewHist?.jobId ?? ""}`} — every stage change is an immutable record.
              </DialogDescription>
            </DialogHeader>
            <StageTimeline applicationId={viewHist?.id} />
          </DialogContent>
        </Dialog>
      </div>
    </SiteLayout>
  );
}

function ProfileViewsCard({ profileId }: { profileId: number }) {
  const { data } = trpc.ats.profileViewCount.useQuery({ profileId }, { enabled: !!profileId });
  return (
    <Card className="mb-8 bg-secondary/40">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Eye className="h-5 w-5 text-amber-ink" /> Employer interest
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div>
          <div className="text-3xl font-bold font-display">{data?.count ?? 0}</div>
          <p className="text-sm text-muted-foreground">profile views by employers</p>
        </div>
        <div>
          <div className="text-3xl font-bold font-display text-amber-ink">{data?.count != null && data.count > 0 ? "Yes" : "—"}</div>
          <p className="text-sm text-muted-foreground">being noticed by recruiters</p>
        </div>
      </CardContent>
    </Card>
  );
}

function SavedSearchesPanel() {
  const utils = trpc.useUtils();
  const { data: searches, isLoading } = trpc.savedSearches.list.useQuery();
  const [runId, setRunId] = useState<number | null>(null);
  const [saveName, setSaveName] = useState("");
  const { data: runResult, isLoading: runLoading } = trpc.savedSearches.run.useQuery(
    { id: runId ?? 0 },
    { enabled: !!runId },
  );
  const del = trpc.savedSearches.delete.useMutation({
    onSuccess: () => {
      utils.savedSearches.list.invalidate();
      toast.success("Saved search deleted");
    },
  });
  const save = trpc.savedSearches.save.useMutation({
    onSuccess: () => {
      utils.savedSearches.list.invalidate();
      toast.success("Search saved — new matching jobs will be delivered in your digest");
    },
  });
  const params = new URLSearchParams(window.location.search);
  const q = params.get("q") ?? undefined;
  const remotePolicy = (params.get("remote") ?? undefined) as any;
  const seniority = (params.get("seniority") ?? undefined) as any;
  const minSalary = params.get("minSalary") ?? undefined;
  const maxSalary = params.get("maxSalary") ?? undefined;
  const canSave = Boolean(q || remotePolicy || seniority || minSalary || maxSalary);
  const saveQuery = {
    query: q,
    remotePolicy,
    seniority,
    minSalary: minSalary ? Number(minSalary) : undefined,
    maxSalary: maxSalary ? Number(maxSalary) : undefined,
  };

  return (
    <Card className="mb-8">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Search className="h-5 w-5 text-amber-ink" /> Saved searches
        </CardTitle>
      </CardHeader>
      <CardContent>
        {canSave && (
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <Input
              value={saveName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSaveName(e.target.value)}
              placeholder={`${q ?? "Filtered"} jobs`}
              maxLength={120}
              className="max-w-52 h-8 text-sm"
            />
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              disabled={save.isPending}
              onClick={() =>
                save.mutate({
                  name: (saveName || (q ? `${q} jobs` : "Filtered jobs")).slice(0, 120),
                  query: saveQuery,
                })
              }
            >
              <Save className="h-3.5 w-3.5" /> Save current search
            </Button>
          </div>
        )}
        {isLoading ? (
          <Skeleton className="h-10 rounded" />
        ) : !searches || searches.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No saved searches. Set filters on{" "}
            <Link href="/jobs" className="text-primary underline underline-offset-2">Browse Jobs</Link> and save a search to
            get it included in your digest emails.
          </p>
        ) : (
          <div className="space-y-2">
            {searches.map((s: any) => (
              <Fragment key={s.id}>
              <div className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2">
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{s.name}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {s.query?.query ? `“${s.query.query}”` : "All jobs"}
                    {s.query?.remotePolicy ? ` · ${s.query.remotePolicy}` : ""}
                    {s.query?.seniority ? ` · ${s.query.seniority}` : ""}
                    {s.query?.minSalary || s.query?.maxSalary
                      ? ` · $${s.query.minSalary ?? 0}–$${s.query.maxSalary ?? "∞"}`
                      : ""}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1.5 text-muted-foreground hover:text-primary"
                    onClick={() => setRunId(runId === s.id ? null : s.id)}
                    aria-label="Re-run saved search"
                  >
                    <Play className="h-3.5 w-3.5" /> Run
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => del.mutate({ id: s.id })}
                    disabled={del.isPending}
                    aria-label="Delete saved search"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              {runId === s.id && (
                <div className="border-t border-border px-3 py-3">
                  {runLoading || !runResult ? (
                    <Skeleton className="h-10 rounded" />
                  ) : (runResult as any).totalExact != null ? (
                    <>
                      <p className="text-xs text-muted-foreground mb-2">
                        {(runResult as any).totalExact} matching job{(runResult as any).totalExact === 1 ? "" : "s"} — latest
                        matches shown first
                      </p>
                      <div className="space-y-1.5">
                        {((runResult as any).results ?? []).slice(0, 5).map((j: any) => (
                          <div key={j.id} className="flex items-center justify-between gap-2 text-sm">
                            <Link href={`/jobs/${j.id}`} className="underline underline-offset-2 min-w-0 truncate hover:text-primary">
                              {j.title}
                            </Link>
                            <span className="text-xs text-muted-foreground shrink-0">{j.companyName ?? ""}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground">No results for this search right now.</p>
                  )}
                </div>
              )}
              </Fragment>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StageTimeline({ applicationId }: { applicationId?: number }) {
  const { data: events, isLoading } = trpc.ats.history.useQuery(
    { applicationId: applicationId ?? 0 },
    { enabled: !!applicationId },
  );
  if (!applicationId) return null;
  if (isLoading || !events) return <Skeleton className="h-32 rounded" />;
  const st: Record<string, string> = {
    applied: "bg-secondary text-secondary-foreground",
    screening: "bg-sky-100 text-sky-800",
    interview: "bg-amber-100 text-amber-800",
    offered: "bg-emerald-100 text-emerald-800",
    accepted: "bg-emerald-100 text-emerald-800",
    rejected: "bg-rose-100 text-rose-700",
    withdrawn: "bg-muted text-muted-foreground",
  };
  return (
    <ScrollArea className="max-h-72">
      <ol className="relative border-l border-border ml-2 space-y-4 py-1">
        {events.map((e: any) => (
          <li key={e.id} className="ml-4">
            <span className="absolute -left-1.5 mt-1 h-3 w-3 rounded-full border-2 border-background bg-amber-ink" />
            <div className="flex items-baseline gap-2 flex-wrap">
              <Badge className={st[e.fromStatus ?? ""]}>{e.fromStatus ?? "start"}</Badge>
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
              <Badge className={st[e.toStatus] ?? "bg-secondary"}>{e.toStatus}</Badge>
              <span className="text-xs text-muted-foreground font-mono">{new Date(e.createdAt).toLocaleString()}</span>
            </div>
            {e.note && <p className="text-sm text-muted-foreground mt-1 border-l-2 border-border pl-2">“{e.note}”</p>}
          </li>
        ))}
      </ol>
    </ScrollArea>
  );
}
