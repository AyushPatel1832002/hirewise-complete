import { useAuth } from "@/_core/hooks/useAuth";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { AlertTriangle, Ban, CheckCircle2, ShieldAlert, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminPage() {
  const { isAuthenticated, user } = useAuth();
  const isAdmin = user?.role === "admin";

  if (!isAuthenticated) {
    return (
      <SiteLayout>
        <div className="max-w-xl mx-auto mt-16 text-center">
          <p className="text-muted-foreground">Sign in to access the admin console.</p>
        </div>
      </SiteLayout>
    );
  }
  if (!isAdmin) {
    return (
      <SiteLayout>
        <div className="max-w-xl mx-auto mt-16 text-center">
          <p className="text-muted-foreground">This area is restricted to administrators.</p>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="max-w-4xl mx-auto px-4 pt-10">
        <div className="flex items-center gap-3 mb-8">
          <ShieldAlert className="h-7 w-7 text-amber-ink" />
          <h1 className="text-2xl font-bold font-display">Admin console</h1>
        </div>

        <Tabs defaultValue="moderation">
          <TabsList>
            <TabsTrigger value="moderation">Moderation queue</TabsTrigger>
            <TabsTrigger value="queue">Notification queue</TabsTrigger>
          </TabsList>

          <TabsContent value="moderation">
            <ModerationTab />
          </TabsContent>
          <TabsContent value="queue">
            <QueueTab />
          </TabsContent>
        </Tabs>
      </div>
    </SiteLayout>
  );
}

function ModerationTab() {
  const utils = trpc.useUtils();
  const [status, setStatus] = useState<"pending" | "resolved" | "dismissed">("pending");
  const { data: reports, isLoading } = trpc.ats.reports.useQuery({ status }, { enabled: status === "pending" });
  const resolve = trpc.ats.resolveReport.useMutation({
    onSuccess: (_, vars) => {
      utils.ats.reports.invalidate();
      toast.success(vars.status === "resolved" ? "Report resolved" : "Report dismissed");
    },
  });

  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-ink" /> Reported content
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-32 rounded" />
        ) : !reports || reports.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            Nothing pending. Reported jobs and candidate profiles appear here for review.
          </p>
        ) : (
          <div className="space-y-3">
            {reports.map((r: any) => (
              <div key={r.id} className="rounded-lg border border-border p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                <div className="min-w-0">
                  <div className="text-sm font-medium flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{r.targetType}</Badge>
                    #{r.targetId}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">“{r.reason}”</p>
                  <p className="text-xs text-muted-foreground/70 mt-1 font-mono">{new Date(r.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-emerald-700 border-emerald-600/40 hover:bg-emerald-600/10"
                    onClick={() => resolve.mutate({ id: r.id, status: "resolved" })}
                    disabled={resolve.isPending}
                  >
                    <Ban className="h-3.5 w-3.5" /> Remove
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    onClick={() => resolve.mutate({ id: r.id, status: "dismissed" })}
                    disabled={resolve.isPending}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Dismiss
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function QueueTab() {
  const utils = trpc.useUtils();
  const { data: stats, isLoading } = trpc.queue.queueStats.useQuery();
  const { data: dead, isLoading: deadLoading } = trpc.queue.deadLetters.useQuery();

  return (
    <div className="space-y-4 mt-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Queue overview</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-6 gap-4">
          {isLoading || !stats ? (
            Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 rounded" />)
          ) : (
            <>
              {["pending", "processing", "sent", "failed", "dead"].map((k) => (
                <div key={k} className="rounded-lg border border-border px-4 py-3">
                  <div className="text-2xl font-bold font-display">{Number((stats as any)[k])}</div>
                  <p className="text-xs text-muted-foreground capitalize">{k}</p>
                </div>
              ))}
              <div className="rounded-lg border border-border px-4 py-3">
                <div className="text-2xl font-bold font-display">{stats.failureRate}%</div>
                <p className="text-xs text-muted-foreground">failure rate (failed+dead / {stats.total})</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Trash2 className="h-4 w-4 text-destructive" /> Dead letters
          </CardTitle>
        </CardHeader>
        <CardContent>
          {deadLoading ? (
            <Skeleton className="h-24 rounded" />
          ) : !dead || dead.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No dead-lettered notifications.</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {dead.map((d: any) => (
                <div key={d.id} className="rounded-lg border border-border p-3 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono">#{d.id} · {d.channel}</span>
                    <span className="text-muted-foreground">{d.eventType}</span>
                  </div>
                  <p className="font-medium mt-1">{d.subject ?? d.payload?.subject ?? ""}</p>
                  <p className="text-destructive/80 mt-1">{d.lastError ?? "unknown error"}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Queue processing and digests are triggered by scheduled heartbeat jobs (every minute and daily/weekly).
        Admins can also run them manually from the employer dashboard actions.
      </p>
    </div>
  );
}
