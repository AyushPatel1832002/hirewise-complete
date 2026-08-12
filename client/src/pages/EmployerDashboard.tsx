import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { SiteLayout } from "@/components/SiteLayout";
import { PostJobDialog } from "@/components/PostJobDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { Building2, Building, FileCheck2, Loader2, Pencil, Plus, Trash2, Users } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

export default function EmployerDashboard() {
  const { isAuthenticated, user } = useAuth();
  const [postOpen, setPostOpen] = useState(false);

  const utils = trpc.useUtils();
  const { data: myCompanyData, isLoading } = trpc.employers.myCompany.useQuery(undefined, { enabled: isAuthenticated });
  const company = myCompanyData?.companies[0] ?? null;
  const companyId = company?.id;

  const { data: myJobs, isLoading: jobsLoading } = trpc.employers.myJobs.useQuery(undefined, { enabled: isAuthenticated && !!companyId });
  const statMap = new Map<number, number>();

  const togglePublish = trpc.employers.setPublished.useMutation({
    onMutate: async (vars) => {
      await utils.employers.myJobs.cancel();
      const prev = utils.employers.myJobs.getData();
      utils.employers.myJobs.setData(undefined, (old) =>
        old?.map((j) => (j.id === vars.jobId ? { ...j, published: vars.published } : j)),
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) utils.employers.myJobs.setData(undefined, ctx.prev);
      toast.error("Could not update job visibility");
    },
    onSettled: () => utils.employers.myJobs.invalidate(),
  });

  const deleteJob = trpc.employers.deleteJob.useMutation({
    onMutate: async (vars) => {
      await utils.employers.myJobs.cancel();
      const prev = utils.employers.myJobs.getData();
      utils.employers.myJobs.setData(undefined, (old) => old?.filter((j) => j.id !== vars.jobId));
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) utils.employers.myJobs.setData(undefined, ctx.prev);
      toast.error("Could not delete job");
    },
    onSettled: () => utils.employers.myJobs.invalidate(),
  });

  if (!isAuthenticated) {
    return (
      <SiteLayout>
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold mb-3">Sign in to access employer tools</h1>
          <Button onClick={() => startLogin()}>Sign in</Button>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="container py-10 max-w-5xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Employer dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage your company profile, jobs, and incoming applications.</p>
          </div>
          <Button onClick={() => setPostOpen(true)} className="gap-1.5" disabled={!company}>
            <Plus className="h-4 w-4" /> Post a job
          </Button>
        </div>

        {!company ? (
          isLoading ? (
            <Skeleton className="h-44 rounded-xl" />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Set up your company profile</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your company profile to start posting jobs and receiving applications.
                </p>
                <Button asChild>
                  <Link href="/company/create"><Building className="h-4 w-4 mr-1.5" /> Create company profile</Link>
                </Button>
              </CardContent>
            </Card>
          )
        ) : (
          <>
            {/* Company header */}
            <Card className="mb-8">
              <CardContent className="pt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{company.name}</h2>
                    <p className="text-sm text-muted-foreground max-w-xl line-clamp-2">
                      {company.description ?? "Add a description to attract candidates."}
                    </p>
                  </div>
                </div>
                <Button asChild variant="outline" className="gap-1.5 shrink-0">
                  <Link href={`/company/${company.id}`}>
                    <Pencil className="h-4 w-4" /> Edit company profile
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* My jobs */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Your jobs ({(myJobs ?? []).length})</h2>
            </div>
            {jobsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-24 rounded-xl" />
                <Skeleton className="h-24 rounded-xl" />
              </div>
            ) : !myJobs || myJobs.length === 0 ? (
              <Card>
                <CardContent className="pt-6 pb-6 flex items-center gap-4">
                  <Building2 className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="font-medium">No jobs posted yet</p>
                    <p className="text-sm text-muted-foreground">Post your first role to start receiving applications.</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {myJobs.map((j) => (
                  <Card key={j.id} className="transition-all">
                    <CardContent className="pt-5 pb-5">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Link href={`/jobs/${j.id}`} className="font-semibold hover:text-primary truncate">
                              {j.title}
                            </Link>
                            <Badge variant={j.published ? "default" : "secondary"}>
                              {j.published ? "Published" : "Unpublished"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-1.5 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {statMap.get(j.id) ?? 0} applications</span>
                            <span className="flex items-center gap-1"><FileCheck2 className="h-3.5 w-3.5" /> {j.remotePolicy} · {j.seniority}</span>
                            <span className="font-mono">{new Date(j.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => togglePublish.mutate({ jobId: j.id, published: !j.published })}
                          >
                            {j.published ? "Unpublish" : "Publish"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-muted-foreground"
                            onClick={() => {
                              if (confirm(`Delete "${j.title}"? This cannot be undone.`)) {
                                deleteJob.mutate({ jobId: j.id });
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/employer/job/${j.id}/applications`}>
                              {j.published ? "Review applications" : "Unpublished — no applications"}
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            {!company && <p className="text-xs text-muted-foreground mt-2">Create a company first to post jobs.</p>}
          </>
        )}

        {postOpen && company && <PostJobDialog companyId={company.id} onClose={() => setPostOpen(false)} />}
      </div>
    </SiteLayout>
  );
}
