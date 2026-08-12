import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Check, Loader2, Plus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type SkillPick = { skillId: number; name: string; weight: "required" | "preferred" };

export function PostJobDialog({ companyId, onClose }: { companyId: number; onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [seniority, setSeniority] = useState<string>("mid");
  const [employmentType, setEmploymentType] = useState<string>("full-time");
  const [remotePolicy, setRemotePolicy] = useState<string>("hybrid");
  const [locationId, setLocationId] = useState<string>("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [picks, setPicks] = useState<SkillPick[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const utils = trpc.useUtils();

  const { data: locations } = trpc.jobs.locations.useQuery(undefined, { staleTime: 10 * 60_000 });

  useEffect(() => {
    const t = setTimeout(() => {
      const term = searchTerm.trim();
      if (term.length < 1) { setSearchResults([]); return; }
      setSearchLoading(true);
      utils.skills.search
        .fetch({ term })
        .then((r) => setSearchResults(r))
        .catch(() => setSearchResults([]))
        .finally(() => setSearchLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [searchTerm, utils]);

  const createJob = trpc.employers.createJob.useMutation({
    onSuccess: () => {
      toast.success("Job created", { description: "You can publish it from your dashboard when ready." });
      utils.employers.myJobs.invalidate();
      onClose();
    },
    onError: (e) => toast.error(e.message || "Could not create job"),
  });

  function pick(s: any, weight: "required" | "preferred") {
    if (picks.some((p) => p.skillId === s.id)) return;
    setPicks((ps) => [...ps, { skillId: s.id, name: s.name, weight }]);
    setSearchTerm("");
    setSearchOpen(false);
  }

  function submit(published: boolean) {
    if (!title.trim()) return toast.error("Give the job a title");
    if (!description.trim()) return toast.error("Describe the role");
    if (salaryMin && salaryMax && Number(salaryMin) > Number(salaryMax)) {
      return toast.error("Minimum salary cannot exceed the maximum");
    }
    createJob.mutate({
      title: title.trim(),
      description: description.trim(),
      seniority: seniority as any,
      employmentType: employmentType as any,
      remotePolicy: remotePolicy as any,
      locationId: locationId ? Number(locationId) : null,
      salaryMin: salaryMin ? Number(salaryMin) : null,
      salaryMax: salaryMax ? Number(salaryMax) : null,
      skills: picks.map((p) => ({ skillId: p.skillId, weight: p.weight })),
      published,
    });
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Post a new job</DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1 -mx-2 pr-2">
          <div className="space-y-5 px-2 pb-2">
            <div className="space-y-2">
              <Label>Job title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Senior Backend Engineer" />
            </div>
            <div className="space-y-2">
              <Label>Job description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-28"
                placeholder="Describe the role, responsibilities, and what success looks like…"
              />
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Seniority</Label>
                <Select value={seniority} onValueChange={setSeniority}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="junior">Junior</SelectItem>
                    <SelectItem value="mid">Mid-level</SelectItem>
                    <SelectItem value="senior">Senior</SelectItem>
                    <SelectItem value="lead">Lead</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={employmentType} onValueChange={setEmploymentType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Remote policy</Label>
                <Select value={remotePolicy} onValueChange={setRemotePolicy}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="remote">Fully remote</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                    <SelectItem value="onsite">On-site</SelectItem>
                    <SelectItem value="flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Location</Label>
                <Select value={locationId} onValueChange={setLocationId}>
                  <SelectTrigger><SelectValue placeholder="Anywhere" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any / flexible</SelectItem>
                    {(locations ?? []).map((l) => (
                      <SelectItem key={l.id} value={String(l.id)}>{l.city}, {l.country}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Salary min (USD)</Label>
                <Input type="number" min={0} value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} placeholder="100000" />
              </div>
              <div className="space-y-2">
                <Label>Salary max (USD)</Label>
                <Input type="number" min={0} value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} placeholder="140000" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Skills — required and preferred split</Label>
              <div className="relative">
                <Input
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setSearchOpen(true); }}
                  onFocus={() => setSearchOpen(true)}
                  onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
                  placeholder={'Search the skill taxonomy (aliases work — try "js")'}
                  className="pr-10"
                />
                {searchOpen && (
                  <div className="absolute z-20 mt-1 w-full bg-popover border border-border rounded-lg shadow-lg max-h-52 overflow-y-auto">
                    {searchLoading ? (
                      <div className="p-3 text-sm text-muted-foreground flex items-center gap-2">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Searching…
                      </div>
                    ) : searchResults.length === 0 ? (
                      <div className="p-3 text-sm text-muted-foreground">No skills found</div>
                    ) : (
                      searchResults.map((s) =>
                        picks.some((p) => p.skillId === s.id) ? (
                          <div key={s.id} className="px-3 py-2 text-sm text-muted-foreground flex items-center gap-2 border-b border-border/50">
                            <Check className="h-3.5 w-3.5" /> {s.name} (already added)
                          </div>
                        ) : (
                          <div key={s.id} className="px-3 py-2 text-sm flex items-center justify-between gap-2 border-b border-border/50 hover:bg-accent">
                            <span><span className="font-medium">{s.name}</span> <span className="text-muted-foreground text-xs">{s.category}</span></span>
                            <div className="flex gap-1 shrink-0">
                              <button type="button" onMouseDown={(e) => { e.preventDefault(); pick(s, "required"); }} className="px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20">+ Required</button>
                              <button type="button" onMouseDown={(e) => { e.preventDefault(); pick(s, "preferred"); }} className="px-2 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80">+ Preferred</button>
                            </div>
                          </div>
                        ),
                      )
                    )}
                  </div>
                )}
              </div>
              {picks.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {picks.map((p) => (
                    <span key={p.skillId} className={`skill-chip group gap-1.5 ${p.weight === "required" ? "required" : ""}`}>
                      {p.name} · {p.weight}
                      <button className="ml-0.5 opacity-60 hover:opacity-100" onClick={() => setPicks((ps) => ps.filter((x) => x.skillId !== p.skillId))} aria-label="remove">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border mt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="secondary" onClick={() => submit(false)} disabled={createJob.isPending}>
            Save as draft
          </Button>
          <Button onClick={() => submit(true)} disabled={createJob.isPending}>
            {createJob.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Plus className="h-4 w-4 mr-1.5" />}
            Create & publish
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
