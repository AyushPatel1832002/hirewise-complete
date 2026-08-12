import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Building2, Globe, MapPin, Users } from "lucide-react";
import { Link, useRoute } from "wouter";

const SIZE_LABELS: Record<string, string> = { "1-10": "1–10", "11-50": "11–50", "51-200": "51–200", "201-1000": "201–1,000", "1000+": "1,000+" };

export default function CompanyPublic() {
  const [, params] = useRoute("/company/:id");
  const companyId = Number(params?.id);

  const { data: company, isLoading } = trpc.employers.getCompany.useQuery({ companyId }, { enabled: !!companyId });
  const { data: jobs } = trpc.employers.companyJobs.useQuery({ companyId }, { enabled: !!companyId && !isLoading });

  return (
    <SiteLayout>
      <div className="container py-10 max-w-4xl">
        <Link href="/jobs" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to jobs
        </Link>

        {isLoading || !company ? (
          <div className="space-y-4">
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
        ) : (
          <>
            <div className="bg-card rounded-xl border border-border p-6 md:p-8">
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">{company.name}</h1>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
                    {company.industry && <span>{company.industry}</span>}
                    {company.size && <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {SIZE_LABELS[company.size] ?? company.size} employees</span>}
                    {company.location?.city && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {company.location.city}, {company.location.country}</span>}
                    {company.website && <span className="flex items-center gap-1"><Globe className="h-3.5 w-3.5" /> {company.website}</span>}
                  </div>
                </div>
              </div>
              {company.description && (
                <p className="mt-6 leading-relaxed whitespace-pre-line">{company.description}</p>
              )}
            </div>

            <h2 className="text-xl font-bold mt-10 mb-4">
              Open roles {jobs && jobs.length > 0 && <span className="text-muted-foreground font-normal">({jobs.length})</span>}
            </h2>
            {jobs && jobs.length > 0 ? (
              <div className="space-y-3">
                {jobs.map((j: any) => (
                  <Link key={j.id} href={`/jobs/${j.id}`} className="block bg-card card-lift rounded-xl border border-border p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-semibold truncate">{j.title}</h3>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge variant="secondary">{j.seniority}</Badge>
                          <Badge variant="outline">{j.remotePolicy}</Badge>
                          {j.location?.city && <Badge variant="outline" className="gap-1"><MapPin className="h-3 w-3" /> {j.location.city}</Badge>}
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="shrink-0">View</Button>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{isLoading ? "" : "No open roles right now."}</p>
            )}
          </>
        )}
      </div>
    </SiteLayout>
  );
}
