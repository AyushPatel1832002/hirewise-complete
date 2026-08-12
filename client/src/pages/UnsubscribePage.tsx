import { trpc } from "@/lib/trpc";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, XCircle } from "lucide-react";
import { Link } from "wouter";

export default function UnsubscribePage() {
  const token = typeof window !== "undefined" ? window.location.pathname.split("/unsubscribe/")[1] : undefined;
  const utils = trpc.useUtils();
  const unsub = trpc.notifications.unsubscribe.useMutation({
    onSuccess: () => {
      utils.notifications.centre.invalidate();
      utils.notifications.unreadCount.invalidate();
    },
  });

  if (!token) {
    return (
      <SiteLayout>
        <div className="max-w-xl mx-auto mt-16 text-center">
          <p className="text-muted-foreground">No unsubscribe token provided.</p>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="max-w-lg mx-auto mt-16 px-4">
        <Card>
          <CardContent className="pt-8 pb-8 text-center">
            {unsub.isPending ? (
              <Skeleton className="h-24 rounded" />
            ) : unsub.error ? (
              <>
                <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h1 className="text-xl font-bold font-display mb-2">Unsubscribe failed</h1>
                <p className="text-sm text-muted-foreground mb-6">
                  This link is invalid or has already been used. You can manage your preferences from the
                  notification centre after signing in.
                </p>
              </>
            ) : unsub.isSuccess ? (
              <>
                <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
                <h1 className="text-xl font-bold font-display mb-2">You have been unsubscribed</h1>
                <p className="text-sm text-muted-foreground mb-6">
                  Email digests have been disabled for this address. You will still see notifications in-app, which
                  can be tuned anytime from the bell menu.
                </p>
              </>
            ) : (
              <>
                <h1 className="text-xl font-bold font-display mb-2">Unsubscribe from emails?</h1>
                <p className="text-sm text-muted-foreground mb-6">
                  You are about to stop receiving email digests from HireWise for this address. In-app notifications
                  will remain available.
                </p>
              </>
            )}
            {!unsub.isSuccess && !unsub.isPending && (
              <div className="flex justify-center gap-3">
                <Button
                  onClick={() => unsub.mutate({ token })}
                  disabled={unsub.isPending}
                  variant="outline"
                  className="text-destructive border-destructive/40 hover:bg-destructive/10"
                >
                  Unsubscribe
                </Button>
                <Button asChild>
                  <Link href="/jobs">Browse jobs</Link>
                </Button>
              </div>
            )}
            {unsub.isSuccess && (
              <Button asChild>
                <Link href="/jobs">Back to jobs</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </SiteLayout>
  );
}
