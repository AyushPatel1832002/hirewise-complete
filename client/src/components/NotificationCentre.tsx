import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trpc } from "@/lib/trpc";
import { Bell, Check, CheckCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const EVENT_LABELS: Record<string, string> = {
  "application.stage_changed": "Application stage changed",
  "application.message": "New message",
  "profile.viewed": "Profile viewed",
  "application.received": "New application received",
  "digest.new_matches": "Digest: new matching jobs",
};

export function NotificationCentre() {
  const utils = trpc.useUtils();
  const [open, setOpen] = useState(false);

  const { data: countData, refetch: refetchCount } = trpc.notifications.unreadCount.useQuery(undefined, {
    refetchInterval: 15000,
    enabled: true,
  });
  const { data: centre, isLoading } = trpc.notifications.centre.useQuery(undefined, { enabled: open });

  const markRead = trpc.notifications.markRead.useMutation({
    onSettled: () => {
      utils.notifications.centre.invalidate();
      refetchCount();
    },
  });
  const markAll = trpc.notifications.markAllRead.useMutation({
    onSuccess: () => {
      utils.notifications.centre.invalidate();
      refetchCount();
      toast.success("All marked as read");
    },
  });

  const unread = countData?.count ?? 0;

  return (
    <>
      <Button
        variant="ghost"
        className="relative p-2 h-10 w-10"
        aria-label={`Notifications${unread > 0 ? ` (${unread} unread)` : ""}`}
        onClick={() => setOpen(true)}
      >
        <Bell className="h-4.5 w-4.5" />
        {unread > 0 && (
          <Badge className="absolute -top-1 -right-1 h-4.5 min-w-4.5 px-1 text-[10px] rounded-full bg-amber-ink text-white border-0">
            {unread > 99 ? "99+" : unread}
          </Badge>
        )}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg p-0 gap-0 max-h-[75vh] flex flex-col overflow-hidden">
          <DialogHeader className="px-5 pt-5 pb-3 border-b border-border">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <Bell className="h-4 w-4" /> Notifications
              </DialogTitle>
              {unread > 0 && (
                <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => markAll.mutate()}>
                  <CheckCheck className="h-3.5 w-3.5" /> Mark all read
                </Button>
              )}
            </div>
            <DialogDescription>Real-time events, plus a digest email summarising everything.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 px-5 py-3 overflow-y-auto">
            {isLoading || !centre ? (
              <div className="space-y-2 pt-1">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-14 rounded-lg bg-secondary/60 animate-pulse" />
                ))}
              </div>
            ) : centre.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-10">
                Nothing here yet. Application updates, messages, and profile views will appear here.
              </p>
            ) : (
              <div className="space-y-2 pt-1">
                {centre.map((n: any) => (
                  <div
                    key={n.id}
                    className={`rounded-lg border border-border px-3.5 py-3 transition-colors ${
                      !n.readAt ? "bg-secondary/50 border-primary/30" : "bg-card"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium leading-snug">{n.subject}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {EVENT_LABELS[n.eventType] ?? n.eventType} ·{" "}
                          {new Date(n.createdAt).toLocaleString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      {!n.readAt && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0 text-muted-foreground"
                          aria-label="Mark read"
                          onClick={() => markRead.mutate({ id: n.id })}
                        >
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
