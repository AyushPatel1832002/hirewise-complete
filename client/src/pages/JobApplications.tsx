import { useAuth } from "@/_core/hooks/useAuth";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { trpc } from "@/lib/trpc";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpDown,
  Clock,
  GraduationCap,
  History,
  Mail,
  MapPin,
  MessageCircle,
  Plus,
  Send,
  UserCheck,
} from "lucide-react";
import { Link, useRoute } from "wouter";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const COLUMNS = ["applied", "screening", "interview", "offered", "accepted", "rejected"] as const;
type Stage = (typeof COLUMNS)[number];

const STAGE_STYLES: Record<string, string> = {
  applied: "bg-secondary text-secondary-foreground",
  screening: "bg-sky-100 text-sky-800",
  interview: "bg-amber-100 text-amber-800",
  offered: "bg-emerald-100 text-emerald-800",
  accepted: "bg-emerald-100 text-emerald-800",
  rejected: "bg-rose-100 text-rose-700",
  withdrawn: "bg-muted text-muted-foreground",
};

const PROFI_ORDER: Record<string, number> = { beginner: 0, intermediate: 1, advanced: 2, expert: 3 };

function matchPct(a: any, job: any): number {
  const reqNames = new Set((job?.skills ?? []).filter((s: any) => s.weight === "required").map((s: any) => s.name));
  const haveNames = new Set((a.topSkills ?? []).map((s: any) => s.name));
  const covered = reqNames.size === 0 ? 1 : Array.from(reqNames).filter((r) => haveNames.has(r)).length / reqNames.size;
  return Math.round(covered * 100);
}

function CandidateCard({
  app,
  job,
  onMove,
  onMessage,
  onHistory,
  sortBy,
  match,
  unread,
}: {
  app: any;
  job: any;
  onMove: (to: string) => void;
  onMessage: () => void;
  onHistory: () => void;
  sortBy: "match" | "newest";
  match: number;
  unread: number;
}) {
  const target = app.status === "withdrawn" ? "applied" : app.status;
  return (
    <Card className="bg-card hover:border-foreground/20 transition-colors">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="font-semibold text-sm leading-snug">
            {app.profile?.headline ?? app.profile?.currentTitle ?? `Candidate #${app.profileId}`}
          </span>
          {unread > 0 && (
            <Badge className="bg-primary text-primary-foreground shrink-0">
              <MessageCircle className="h-3 w-3 mr-1" /> {unread}
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-2">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {app.location?.city ? `${app.location.city}, ${app.location.country}` : "Not set"}
          </span>
          <span className="flex items-center gap-1">
            <UserCheck className="h-3 w-3" /> {app.profile?.yearsOfExperience ?? 0} yrs
          </span>
          <span className="font-mono">{new Date(app.createdAt).toLocaleDateString()}</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 mb-2">
          <Badge variant="outline" className="text-xs">
            {match}% required match
          </Badge>
          <Badge className={STAGE_STYLES[app.status] ?? "bg-secondary"}>{app.status}</Badge>
        </div>
        {app.coverNote && (
          <p className="text-xs italic text-muted-foreground border-l-2 border-border pl-2.5 mb-2">“{app.coverNote}”</p>
        )}
        <div className="flex flex-wrap gap-1 mb-3">
          {(app.topSkills ?? []).slice(0, 5).map((s: any, i: number) => (
            <span key={`${s.name}-${i}`} className="skill-chip text-xs">
              {s.name} · {s.proficiency}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-1.5 border-t border-border pt-2.5 -mx-4 -mb-4 px-4 bg-secondary/30">
          {sortBy === "match" && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1 text-xs">
                  <ArrowUpDown className="h-3 w-3 mr-1" /> Move
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {(
                  app.status === "withdrawn"
                    ? (["applied", "screening", "interview", "offered", "rejected"] as const)
                    : COLUMNS.filter((s) => s !== app.status)
                ).map((s) => (
                  <DropdownMenuItem key={s} onClick={() => onMove(s)}>
                    {app.status === "withdrawn" && s === "applied" ? (
                      <span className="flex items-center gap-1">
                        <ArrowRight className="h-3.5 w-3.5" /> Reactivate ({s})
                      </span>
                    ) : (
                      s
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={onMessage}>
            <Mail className="h-3 w-3 mr-1" /> Message
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onHistory} aria-label="Stage history">
            <History className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function JobApplications() {
  const [, params] = useRoute("/employer/job/:id/applications");
  const jobId = Number(params?.id);
  const { isAuthenticated, user } = useAuth();
  const [sortBy, setSortBy] = useState<"match" | "newest">("match");
  const [moveTarget, setMoveTarget] = useState<{ app: any; to: Stage | null } | null>(null);
  const [moveNote, setMoveNote] = useState("");
  const [histApp, setHistApp] = useState<any>(null);
  const [chatApp, setChatApp] = useState<any>(null);
  const utils = trpc.useUtils();

  const { data: job } = trpc.employers.getJob.useQuery({ jobId }, { enabled: isAuthenticated && !!jobId });
  const { data: apps, isLoading } = trpc.employers.jobApplications.useQuery({ jobId }, { enabled: isAuthenticated && !!jobId });
  const unreadQuery = trpc.ats.unreadCounts.useQuery(
    { applicationIds: (apps ?? []).slice(0, 100).map((a: any) => a.id) },
    { enabled: !!apps && apps.length > 0 },
  );
  const unreadByApp = new Map((unreadQuery.data ?? []).map((u: any) => [u.applicationId, u.unread]));

  const [showCandidates, setShowCandidates] = useState(false);
  const { data: candidateResults, isLoading: candidatesLoading } = trpc.candidateSearch.run.useQuery(
    { jobId },
    { enabled: isAuthenticated && !!jobId && showCandidates },
  );

  const move = trpc.ats.move.useMutation({
    onMutate: async (vars) => {
      await utils.employers.jobApplications.cancel({ jobId });
      const prev = utils.employers.jobApplications.getData({ jobId });
      utils.employers.jobApplications.setData({ jobId }, (old) =>
        old?.map((a) => (a.id === vars.applicationId ? { ...a, status: vars.toStatus } : a)),
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) utils.employers.jobApplications.setData({ jobId }, ctx.prev);
      toast.error("Could not move application");
    },
    onSettled: () => {
      utils.employers.jobApplications.invalidate({ jobId });
      utils.ats.unreadCounts.invalidate();
    },
  });

  const startMove = (app: any, to: string) => {
    setMoveTarget({ app, to: to as Stage });
    setMoveNote("");
  };

  const confirmMove = () => {
    if (!moveTarget) return;
    move.mutate(
      {
        applicationId: moveTarget.app.id,
        jobId,
        toStatus: moveTarget.to!,
        note: moveNote.trim() || undefined,
      },
      {
        onSuccess: () => toast.success(`Moved to ${moveTarget.to}`),
      },
    );
    setMoveTarget(null);
    setMoveNote("");
  };

  const sorted = [...(apps ?? [])].sort((x: any, y: any) =>
    sortBy === "match" ? matchPct(y, job) - matchPct(x, job) : Number(y.createdAt) - Number(x.createdAt),
  );

  if (!isAuthenticated) {
    return (
      <SiteLayout>
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold mb-3">Sign in required</h1>
          <Button asChild>
            <Link href="/">Sign in</Link>
          </Button>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="container py-8">
        <Link href="/employer" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Employer dashboard
        </Link>

        {job && (
          <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold">{job.title}</h1>
              <p className="text-muted-foreground mt-1">
                {job.company?.name} · {job.seniority} · {job.remotePolicy} · {(apps ?? []).length} applications
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" size="sm" className="gap-1.5">
                <Link href={`/jobs/${jobId}`}>
                  <MessageCircle className="h-3.5 w-3.5" /> View job
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowCandidates(true)}>
                <Plus className="h-3.5 w-3.5" /> Find matching candidates
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <ArrowUpDown className="h-3.5 w-3.5" /> Sort
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSortBy("match")}>Highest skill match</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("newest")}>Newest first</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )}

        {isLoading || !apps ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {COLUMNS.map((c) => (
              <div key={c} className="space-y-2">
                <Skeleton className="h-6 w-24 rounded" />
                <Skeleton className="h-40 rounded-xl" />
              </div>
            ))}
          </div>
        ) : showCandidates ? (
          <CandidateSearchPanel
            results={candidateResults}
            isLoading={candidatesLoading}
            jobTitle={job?.title ?? ""}
            onClose={() => setShowCandidates(false)}
          />
        ) : apps.length === 0 ? (
          <Card>
            <CardContent className="pt-6 pb-6 text-center text-sm text-muted-foreground">
              No applications yet. Published jobs typically receive applications within minutes on this platform.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 items-start">
            {COLUMNS.map((stage) => {
              const col = sorted.filter((a: any) => a.status === stage);
              return (
                <div key={stage}>
                  <div className="flex items-center justify-between mb-2 px-1">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{stage}</span>
                    <Badge variant="outline" className="text-xs">
                      {col.length}
                    </Badge>
                  </div>
                  <div className="space-y-3 min-h-24">
                    {col.map((a: any) => (
                      <CandidateCard
                        key={a.id}
                        app={a}
                        job={job}
                        sortBy={sortBy}
                        match={matchPct(a, job)}
                        unread={unreadByApp.get(a.id) ?? 0}
                        onMove={(to) => startMove(a, to)}
                        onMessage={() => setChatApp(a)}
                        onHistory={() => setHistApp(a)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
            {/* Withdrawn column (collapses into an expandable row) */}
            {(() => {
              const withdrawn = sorted.filter((a: any) => a.status === "withdrawn");
              if (withdrawn.length === 0) return null;
              return (
                <div className="col-span-2 md:col-span-3 lg:col-span-6 mt-2">
                  <details className="group">
                    <summary className="text-xs font-semibold uppercase tracking-wide text-muted-foreground cursor-pointer list-none px-1 mb-2 flex items-center gap-2">
                      <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded">Withdrawn</span>
                      <Badge variant="outline" className="text-xs">
                        {withdrawn.length}
                      </Badge>
                    </summary>
                    <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
                      {withdrawn.map((a: any) => (
                        <CandidateCard
                          key={a.id}
                          app={a}
                          job={job}
                          sortBy={sortBy}
                          match={matchPct(a, job)}
                          unread={unreadByApp.get(a.id) ?? 0}
                          onMove={(to) => startMove(a, to)}
                          onMessage={() => setChatApp(a)}
                          onHistory={() => setHistApp(a)}
                        />
                      ))}
                    </div>
                  </details>
                </div>
              );
            })()}
          </div>
        )}

        {/* Move dialog */}
        <Dialog open={!!moveTarget} onOpenChange={(o) => !o && setMoveTarget(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                Move {moveTarget?.app?.profile?.headline ?? `Candidate #${moveTarget?.app?.profileId ?? ""}`}
              </DialogTitle>
              <DialogDescription>
                Moving to <strong>{moveTarget?.to}</strong>. This change is recorded in the immutable stage history and
                notifies the candidate.
              </DialogDescription>
            </DialogHeader>
            <Textarea
              value={moveNote}
              onChange={(e) => setMoveNote(e.target.value)}
              placeholder="Optional note (visible in the stage timeline)…"
              maxLength={1000}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setMoveTarget(null)}>
                Cancel
              </Button>
              <Button
                onClick={confirmMove}
                disabled={move.isPending}
                className="gap-1.5"
              >
                {move.isPending ? <Plus className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                Confirm move
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Stage history dialog */}
        <Dialog open={!!histApp} onOpenChange={(o) => !o && setHistApp(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Stage history</DialogTitle>
              <DialogDescription>Every move is an immutable event — nothing is ever deleted.</DialogDescription>
            </DialogHeader>
            <StageTimeline applicationId={histApp?.id} jobTitle={job?.title} />
          </DialogContent>
        </Dialog>

        {/* Conversation sheet */}
        <Dialog open={!!chatApp} onOpenChange={(o) => !o && setChatApp(null)}>
          <DialogContent className="sm:max-w-lg flex flex-col p-0 gap-0 max-h-[80vh] overflow-hidden">
            <div className="px-5 pt-5 pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                <span className="font-semibold text-sm">
                  {chatApp?.profile?.headline ?? `Candidate #${chatApp?.profileId ?? ""}`}
                </span>
                <Badge variant="outline" className="ml-auto">
                  {job?.title}
                </Badge>
              </div>
            </div>
            <ConversationThread applicationId={chatApp?.id} currentUserId={user?.id ?? 0} />
          </DialogContent>
        </Dialog>
      </div>
    </SiteLayout>
  );
}

function CandidateSearchPanel({
  results,
  isLoading,
  jobTitle,
  onClose,
}: {
  results: any;
  isLoading: boolean;
  jobTitle: string;
  onClose: () => void;
}) {
  const rows = (results ?? []).slice(0, 20);
  return (
    <Card>
      <CardContent className="pt-6 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold">Matching candidates for this job</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Ranked by the same engine candidates use — required skills carry the most weight, followed by
              preferred skills, salary fit, location, and recency.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            Back to board
          </Button>
        </div>
        {isLoading || !results ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No candidates match the required skills of “{jobTitle}” yet. Broaden the job’s skill list or check back
            after more candidates join.
          </p>
        ) : (
          <>
            <p className="text-xs text-muted-foreground mb-3">
              Showing top {Math.min(rows.length, 20)} of {results.total ?? rows.length} matches
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {rows.map((c: any) => (
                <Card key={c.id} className="hover:border-foreground/20 transition-colors">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="font-semibold text-sm leading-snug">
                        {c.profile?.headline ?? c.profile?.currentTitle ?? `Candidate #${c.profileId}`}
                      </span>
                      <Badge className="bg-emerald-600 text-white shrink-0">{Math.round((c.score ?? 0) * 100)}%</Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-2">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {c.location?.city ? `${c.location.city}, ${c.location.country}` : "Not set"}
                      </span>
                      <span className="flex items-center gap-1">
                        <UserCheck className="h-3 w-3" /> {c.profile?.yearsOfExperience ?? 0} yrs
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {(c.topSkills ?? []).slice(0, 5).map((s: any, i: number) => (
                        <span key={`${s.name}-${i}`} className="skill-chip text-xs">
                          {s.name} · {s.proficiency}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function StageTimeline({ applicationId, jobTitle }: { applicationId?: number; jobTitle?: string }) {
  const { data: events, isLoading } = trpc.ats.history.useQuery({ applicationId: applicationId ?? 0 }, { enabled: !!applicationId });
  if (!applicationId) return null;
  if (isLoading || !events) return <Skeleton className="h-32 rounded" />;
  return (
    <ScrollArea className="max-h-72">
      <ol className="relative border-l border-border ml-2 space-y-4 py-1">
        {events.map((e: any) => (
          <li key={e.id} className="ml-4">
            <span className="absolute -left-1.5 mt-1 h-3 w-3 rounded-full border-2 border-background bg-amber-ink" />
            <div className="flex items-baseline gap-2 flex-wrap">
              <Badge className={STAGE_STYLES[e.fromStatus ?? e.toStatus]}>{e.fromStatus ?? "start"}</Badge>
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
              <Badge className={STAGE_STYLES[e.toStatus]}>{e.toStatus}</Badge>
              <span className="text-xs text-muted-foreground font-mono">
                {new Date(e.createdAt).toLocaleString()}
              </span>
            </div>
            {e.note && <p className="text-sm text-muted-foreground mt-1 border-l-2 border-border pl-2">“{e.note}”</p>}
          </li>
        ))}
      </ol>
    </ScrollArea>
  );
}

function ConversationThread({ applicationId, currentUserId }: { applicationId?: number; currentUserId: number }) {
  const utils = trpc.useUtils();
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const { data: thread, isLoading, refetch } = trpc.ats.conversation.useQuery(
    { applicationId: applicationId ?? 0 },
    { enabled: !!applicationId },
  );

  // Polling-based refresh: chosen over SSE in ADR (simple, works behind any proxy,
  // chat is low-frequency — a 5s poll keeps threads current without infra cost).
  useEffect(() => {
    if (!applicationId) return;
    const id = setInterval(() => refetch(), 5000);
    return () => clearInterval(id);
  }, [applicationId, refetch]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread?.length]);

  const send = trpc.ats.sendMessage.useMutation({
    onMutate: async (vars) => {
      await utils.ats.conversation.cancel({ applicationId: applicationId! });
      const prev = utils.ats.conversation.getData({ applicationId: applicationId! });
      const optimistic = {
        id: -(Date.now() % 1e6),
        applicationId: applicationId!,
        senderUserId: currentUserId,
        text: vars.text,
        readAt: null,
        createdAt: new Date(),
      };
      utils.ats.conversation.setData({ applicationId: applicationId! }, (old) => [...(old ?? []), optimistic]);
      setText("");
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) utils.ats.conversation.setData({ applicationId: applicationId! }, ctx.prev);
      toast.error("Could not send message");
    },
    onSettled: () => utils.ats.conversation.invalidate({ applicationId: applicationId! }),
  });

  if (!applicationId) return null;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <ScrollArea className="flex-1 px-5 py-3 overflow-y-auto">
        {isLoading || !thread ? (
          <div className="space-y-2 pt-2">
            <Skeleton className="h-12 rounded-lg" />
            <Skeleton className="h-12 rounded-lg w-3/4" />
          </div>
        ) : thread.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No messages yet. Start the conversation — every message notifies the other party.
          </p>
        ) : (
          <div className="space-y-3 py-1">
            {thread.map((m: any) => {
              const mine = m.senderUserId === currentUserId;
              return (
                <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[78%] rounded-xl px-3.5 py-2 ${mine ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
                    <p className="text-sm whitespace-pre-wrap break-words">{m.text}</p>
                    <p className={`text-[10px] mt-1 ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      {new Date(m.createdAt).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      {mine && m.readAt ? " · read" : ""}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={endRef} />
          </div>
        )}
      </ScrollArea>
      <form
        className="border-t border-border p-3 flex items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (text.trim() && !send.isPending) send.mutate({ applicationId: applicationId!, text: text.trim() });
        }}
      >
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a message…"
          maxLength={5000}
          className="min-h-10 max-h-24 resize-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (text.trim() && !send.isPending) send.mutate({ applicationId: applicationId!, text: text.trim() });
            }
          }}
        />
        <Button type="submit" size="icon" disabled={!text.trim() || send.isPending} aria-label="Send">
          {send.isPending ? <Clock className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </form>
    </div>
  );
}
