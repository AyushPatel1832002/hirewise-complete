import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Building2, DollarSign, FileCheck2, MapPin, Wifi } from "lucide-react";
import { Link, useRoute } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

const REMOTE_LABELS: Record<string, string> = { onsite: "On-site", hybrid: "Hybrid", remote: "Remote", flexible: "Flexible" };
const SENIORITY_LABELS: Record<string, string> = { junior: "Junior", mid: "Mid-level", senior: "Senior", lead: "Lead", staff: "Staff" };
const TYPE_LABELS: Record<string, string> = { "full-time": "Full-time", "part-time": "Part-time", contract: "Contract", internship: "Internship" };

export default function JobDetail() {
  const [, params] = useRoute("/jobs/:id");
  const jobId = Number(params?.id);
  const { isAuthenticated, user } = useAuth();
  const [note, setNote] = useState("");
  const [applyOpen, setApplyOpen] = useState(false);

  const utils = trpc.useUtils();
  const { data: job, isLoading } = trpc.jobs.detail.useQuery({ id: jobId });
  const { data: applied } = trpc.applications.hasApplied.useQuery({ jobId }, { enabled: isAuthenticated });

  const submit = trpc.applications.submitApplication.useMutation({
    onSuccess: () => {
      toast.success("Application submitted", { description: "The employer can now review your profile." });
      setApplyOpen(false);
      utils.applications.hasApplied.invalidate({ jobId });
    },
    onError: (e) => {
      if (e.data?.code === "PRECONDITION_FAILED") {
        toast.error("Complete your profile first", {
          description: "Head to your candidate dashboard and build your profile before applying.",
        });
      } else if (e.data?.code === "UNAUTHORIZED") {
        toast.error("Sign in to apply");
      } else {
        toast.error(e.message || "Could not submit application");
      }
    },
  });

  if (!jobId) return <SiteLayout><p className="text-center py-20 text-muted-foreground">No job id.</p></SiteLayout>;

  // Job not found — rendering this as an infinite skeleton is a dead end.
  if (!isLoading && !job) {
    return (
      <SiteLayout>
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold mb-2">This job is no longer available</h1>
          <p className="text-muted-foreground mb-6">It may have been unpublished or removed.</p>
          <Link href="/jobs"><Button>Browse all jobs</Button></Link>
        </div>
      </SiteLayout>
    );
  }

  const required = (job?.skills ?? []).filter((s) => s.weight === "required");
  const preferred = (job?.skills ?? []).filter((s) => s.weight === "preferred");

  return (
    <SiteLayout>
      <div className="container py-8 max-w-4xl">
        <Link href="/jobs" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> All jobs
        </Link>

        {isLoading || !job ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4 rounded-md" />
            <Skeleton className="h-5 w-1/2 rounded-md" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
        ) : (
          <>
            <div className="bg-card rounded-xl border border-border p-6 md:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Building2 className="h-4 w-4" />
                    <span className="font-medium">{job.company?.name}</span>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold leading-tight">{job.title}</h1>
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <Badge>{SENIORITY_LABELS[job.seniority]}</Badge>
                    <Badge variant="secondary">{TYPE_LABELS[job.employmentType]}</Badge>
                    <Badge variant="outline" className="gap-1"><Wifi className="h-3 w-3" /> {REMOTE_LABELS[job.remotePolicy]}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-x-5 gap-y-1 mt-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {job.location?.city ?? "Location flexible"}, {job.location?.country ?? ""}</span>
                    {job.salaryMin != null && (
                      <span className="flex items-center gap-1.5 font-mono"><DollarSign className="h-4 w-4" /> ${Number(job.salaryMin).toLocaleString()} – ${Number(job.salaryMax).toLocaleString()}</span>
                    )}
                  </div>
                </div>
                {isAuthenticated ? (
                  applied?.applied ? (
                    <Badge className="gap-1.5 px-4 py-1.5 h-auto whitespace-normal"><FileCheck2 className="h-4 w-4" /> Applied · {applied.status}</Badge>
                  ) : (
                    <Button size="lg" onClick={() => setApplyOpen(true)}>Apply now</Button>
                  )
                ) : (
                  <Button size="lg" onClick={() => startLogin()}>Sign in to apply</Button>
                )}
              </div>

              <div className="mt-8 space-y-6">
                {required.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">Required skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {required.map((s) => <span key={s.id} className="skill-chip required">{s.name}</span>)}
                    </div>
                  </div>
                )}
                {preferred.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">Preferred skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {preferred.map((s) => <span key={s.id} className="skill-chip">{s.name}</span>)}
                    </div>
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">About the role</h3>
                  <p className="leading-relaxed whitespace-pre-line">{job.description}</p>
                </div>
              </div>
            </div>

            {applyOpen && (
              <div className="bg-card rounded-xl border border-border p-6 md:p-8 mt-6 rise-in">
                <h2 className="text-xl font-bold mb-2">Apply to {job.title}</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Your candidate profile will be sent to {job.company?.name}. Add a short note if you like.
                </p>
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={`Hi ${job.company?.name ?? "there"}, I'd love to be considered for…`}
                  className="mb-4 min-h-28"
                />
                <div className="flex gap-3">
                  <Button
                    onClick={() => submit.mutate({ jobId, coverNote: note || undefined })}
                    disabled={submit.isPending}
                  >
                    {submit.isPending ? "Submitting…" : "Submit application"}
                  </Button>
                  <Button variant="outline" onClick={() => setApplyOpen(false)}>Cancel</Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </SiteLayout>
  );
}
