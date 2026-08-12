import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Building2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

export default function CompanyCreate() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [industry, setIndustry] = useState("");
  const [website, setWebsite] = useState("");
  const [size, setSize] = useState<string>("11-50");
  const [locationId, setLocationId] = useState<string>("");

  const utils = trpc.useUtils();
  const { data: locations } = trpc.jobs.locations.useQuery(undefined, { staleTime: 10 * 60_000 });

  const create = trpc.employers.createCompany.useMutation({
    onSuccess: (c) => {
      toast.success(`Company "${c.name}" created`, { description: "You're now the owner. Post your first job." });
      utils.employers.myCompany.invalidate();
      navigate("/employer");
    },
    onError: (e) => toast.error(e.message || "Could not create company"),
  });

  if (!isAuthenticated) {
    return (
      <SiteLayout>
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold mb-3">Sign in to create a company profile</h1>
          <Button onClick={() => startLogin()}>Sign in</Button>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="container py-10 max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center">
            <Building2 className="h-5.5 w-5.5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Create company profile</h1>
            <p className="text-sm text-muted-foreground">You'll be added as the owner automatically.</p>
          </div>
        </div>
        <Card>
          <CardHeader><CardTitle>Company details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Company name *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Acme Robotics" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-24" placeholder="What does your company do?" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Industry</Label>
                <Input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="Software" />
              </div>
              <div className="space-y-2">
                <Label>Website</Label>
                <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://acme.com" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Size</Label>
                <Select value={size} onValueChange={setSize}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1–10</SelectItem>
                    <SelectItem value="11-50">11–50</SelectItem>
                    <SelectItem value="51-200">51–200</SelectItem>
                    <SelectItem value="201-1000">201–1,000</SelectItem>
                    <SelectItem value="1000+">1,000+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>HQ location</Label>
                <Select value={locationId} onValueChange={setLocationId}>
                  <SelectTrigger><SelectValue placeholder="Choose" /></SelectTrigger>
                  <SelectContent>
                    {(locations ?? []).map((l) => (
                      <SelectItem key={l.id} value={String(l.id)}>{l.city}, {l.country}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" asChild><Link href="/employer">Cancel</Link></Button>
              <Button
                onClick={() => {
                  if (!name.trim()) return toast.error("Company name is required");
                  create.mutate({
                    name: name.trim(),
                    description: description.trim() || null,
                    industry: industry.trim() || null,
                    website: website.trim() || null,
                    size: size as any,
                    locationId: locationId ? Number(locationId) : null,
                  });
                }}
                disabled={create.isPending}
              >
                {create.isPending ? "Creating…" : "Create company"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </SiteLayout>
  );
}
