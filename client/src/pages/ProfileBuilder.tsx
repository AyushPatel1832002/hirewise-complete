import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, ArrowRight, BadgeCheck, Check, ChevronDown, FileSearch, Loader2, Trash2, Upload, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

const STEPS = [
  { id: 0, label: "Basics" },
  { id: 1, label: "Location & pay" },
  { id: 2, label: "Skills" },
  { id: 3, label: "Work history" },
  { id: 4, label: "Education" },
  { id: 5, label: "Review & resume" },
];

export default function ProfileBuilder() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  const [step, setStep] = useState(0);
  // local form state mirrors what has been saved server-side
  const [basics, setBasics] = useState({ headline: "", summary: "", currentTitle: "", yearsOfExperience: 0 });
  const [prefs, setPrefs] = useState({ locationId: "", remotePolicy: "", salaryMin: "", salaryMax: "" });
  const [skillForm, setSkillForm] = useState({ term: "", proficiency: "intermediate" as const, years: 1 });
  const [workForm, setWorkForm] = useState({ title: "", company: "", startDate: "", endDate: "", description: "" });
  const [eduForm, setEduForm] = useState({ institution: "", degree: "", fieldOfStudy: "", startYear: "", endYear: "" });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const pendingRef = useRef<HTMLInputElement>(null);

  const utils = trpc.useUtils();

  const { data: snapshot, isLoading, refetch: refetchSnapshot } = trpc.candidates.snapshot.useQuery(undefined, { enabled: isAuthenticated });
  const { data: draft } = trpc.candidates.getDraft.useQuery(undefined, { enabled: isAuthenticated });
  const { data: locations } = trpc.jobs.locations.useQuery(undefined, { staleTime: 10 * 60_000 });
  const { data: suggestions } = trpc.candidates.listSuggestions.useQuery(undefined, { enabled: isAuthenticated && snapshot?.profile != null });

  // skill search dropdown
  const [skillOpen, setSkillOpen] = useState(false);
  const [skillResults, setSkillResults] = useState<any[]>([]);
  const [skillLoading, setSkillLoading] = useState(false);

  const saveStep = trpc.candidates.saveStep.useMutation({
    onSuccess: () => utils.candidates.getDraft.invalidate(),
  });
  const saveBasics = trpc.candidates.saveBasics.useMutation({
    onSuccess: () => { refetchSnapshot(); utils.candidates.getDraft.invalidate(); },
  });
  const savePreferences = trpc.candidates.savePreferences.useMutation({
    onSuccess: () => { refetchSnapshot(); utils.candidates.getDraft.invalidate(); },
  });
  const addSkill = trpc.candidates.addSkill.useMutation({
    onSuccess: () => refetchSnapshot(),
  });
  const removeSkill = trpc.candidates.removeSkill.useMutation({
    onSuccess: () => refetchSnapshot(),
  });
  const addWork = trpc.candidates.addWorkExperience.useMutation({
    onSuccess: () => refetchSnapshot(),
  });
  const removeWork = trpc.candidates.removeWorkExperience.useMutation({
    onSuccess: () => refetchSnapshot(),
  });
  const addEdu = trpc.candidates.addEducation.useMutation({
    onSuccess: () => refetchSnapshot(),
  });
  const removeEdu = trpc.candidates.removeEducation.useMutation({
    onSuccess: () => refetchSnapshot(),
  });
  const uploadResume = trpc.candidates.uploadResume.useMutation({
    onSuccess: (r) => {
      toast.success(`Parsed your resume — ${r.suggestionCount} suggestions to review`, {
        description: "Nothing was written to your profile yet. Confirm or reject each suggestion.",
      });
      utils.candidates.listSuggestions.invalidate();
      refetchSnapshot();
    },
    onError: (e) => toast.error(e.message || "Upload failed"),
  });
  const decide = trpc.candidates.decideSuggestion.useMutation({
    onSuccess: (res, vars) => {
      toast.success(vars.decision === "confirm" ? "Suggestion applied to your profile" : "Suggestion dismissed");
      utils.candidates.listSuggestions.invalidate();
      refetchSnapshot();
    },
    onError: (e) => toast.error(e.message || "Could not decide"),
  });

  // Restore the server draft (refresh mid-flow loses nothing)
  useEffect(() => {
    if (!isAuthenticated) return;
    if (draft && draft.stepData) {
      const d = draft.stepData as Record<string, unknown>;
      if (d.basics) setBasics((prev) => ({ ...prev, ...(d.basics as any) }));
      if (d.prefs) setPrefs((prev) => ({ ...prev, ...(d.prefs as any) }));
      if (d.skillForm) setSkillForm((prev) => ({ ...prev, ...(d.skillForm as any) }));
      if (d.workForm) setWorkForm((prev) => ({ ...prev, ...(d.workForm as any) }));
      if (d.eduForm) setEduForm((prev) => ({ ...prev, ...(d.eduForm as any) }));
      if (typeof draft.currentStep === "number") setStep(draft.currentStep);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, isAuthenticated]);

  // Persist the current step server-side on every change
  useEffect(() => {
    if (!isAuthenticated) return;
    const data: Record<string, unknown> = {};
    if (step === 0) data.basics = basics;
    if (step === 1) data.prefs = prefs;
    if (step === 2) data.skillForm = skillForm;
    if (step === 3) data.workForm = workForm;
    if (step === 4) data.eduForm = eduForm;
    if (Object.keys(data).length > 0) {
      saveStep.mutate({ step, data });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [basics, prefs, skillForm, workForm, eduForm, step, isAuthenticated]);

  // Skill search — skills.search is a query, so use utils for one-off calls
  const skillSearchInputRef = useRef("");

  const mySkills = snapshot?.skills ?? [];
  const mySkillIds = useMemo(() => new Set(mySkills.map((s) => s.skillId)), [mySkills]);
  const completeness = snapshot?.completeness;

  // debounced skill search
  useEffect(() => {
    const t = setTimeout(() => {
      const term = skillForm.term.trim();
      if (term.length < 1) { setSkillResults([]); return; }
      setSkillLoading(true);
      utils.skills.search
        .fetch({ term })
        .then((r) => setSkillResults(r))
        .catch(() => setSkillResults([]))
        .finally(() => setSkillLoading(false));
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skillForm.term, utils]);

  if (!isAuthenticated) {
    return (
      <SiteLayout>
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold mb-3">Sign in to build your profile</h1>
          <Button onClick={() => startLogin()}>Sign in</Button>
        </div>
      </SiteLayout>
    );
  }

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="container py-12 space-y-4">
          <Skeleton className="h-10 w-64 rounded-md" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </SiteLayout>
    );
  }

  const score = completeness?.score ?? 0;
  const scoreSections = completeness?.sections ?? [];

  async function saveAndAdvance(next: number) {
    try {
      if (step === 0) {
        await saveBasics.mutateAsync(basics);
      } else if (step === 1) {
        await savePreferences.mutateAsync({
          locationId: prefs.locationId ? Number(prefs.locationId) : null,
          remotePolicy: (prefs.remotePolicy || null) as "onsite" | "hybrid" | "remote" | "flexible" | null,
          desiredSalaryMin: prefs.salaryMin ? Number(prefs.salaryMin) : null,
          desiredSalaryMax: prefs.salaryMax ? Number(prefs.salaryMax) : null,
        });
      } else if (step === 2) {
        if (skillForm.term.trim()) await addSkill.mutateAsync({
          skillId: Number(skillForm.term), // term holds selected skillId after pick
          proficiency: skillForm.proficiency,
          years: skillForm.years,
        });
      } else if (step === 3) {
        if (workForm.title.trim() && workForm.company.trim()) {
          await addWork.mutateAsync({
            ...workForm,
            startDate: workForm.startDate || null,
            endDate: workForm.endDate || null,
          });
          setWorkForm({ title: "", company: "", startDate: "", endDate: "", description: "" });
        }
      } else if (step === 4) {
        if (eduForm.institution.trim() && eduForm.degree.trim()) {
          await addEdu.mutateAsync({
            institution: eduForm.institution,
            degree: eduForm.degree,
            fieldOfStudy: eduForm.fieldOfStudy || null,
            startYear: eduForm.startYear ? Number(eduForm.startYear) : null,
            endYear: eduForm.endYear ? Number(eduForm.endYear) : null,
          });
          setEduForm({ institution: "", degree: "", fieldOfStudy: "", startYear: "", endYear: "" });
        }
      }
      setStep(next);
    } catch (e: any) {
      toast.error(e?.message || "Could not save this step");
    }
  }

  function pickSkill(s: any) {
    setSkillForm((f) => ({ ...f, term: String(s.id) }));
    setSkillOpen(false);
    setSkillResults([]);
  }

  function onSubmitResume(e: React.FormEvent) {
    e.preventDefault();
    if (!resumeFile) { toast.error("Choose a PDF first"); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      uploadResume.mutate({ fileName: resumeFile.name, bytesBase64: base64 });
      setResumeFile(null);
    };
    reader.readAsDataURL(resumeFile);
  }

  return (
    <SiteLayout>
      <div className="container py-10 max-w-6xl">
        <Link href="/candidate" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Candidate dashboard
        </Link>

        <div className="grid lg:grid-cols-[1fr_320px] gap-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">Build your profile</h1>
            <p className="text-sm text-muted-foreground mb-6">
              Every step is saved server-side the moment you type — refresh mid-flow and nothing is lost.
            </p>

            {/* Step tabs */}
            <div className="flex flex-wrap gap-1.5 mb-6">
              {STEPS.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setStep(s.id)}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors border ${
                    step === s.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : scoreSections[i]?.done
                        ? "bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100"
                        : "bg-card border-border text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {i + 1}. {s.label}
                  {scoreSections[i]?.done && step !== s.id && <Check className="inline h-3.5 w-3.5 ml-1" />}
                </button>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{STEPS[step]?.label}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {step === 0 && (
                  <>
                    <div className="space-y-2">
                      <Label>Headline</Label>
                      <Input
                        value={basics.headline}
                        onChange={(e) => setBasics((b) => ({ ...b, headline: e.target.value }))}
                        placeholder="Senior Frontend Engineer with 6 years of React expertise"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Summary</Label>
                      <Textarea
                        value={basics.summary}
                        onChange={(e) => setBasics((b) => ({ ...b, summary: e.target.value }))}
                        placeholder="Tell employers what makes you distinctive — at least a sentence or two."
                        className="min-h-28"
                      />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Current role</Label>
                        <Input
                          value={basics.currentTitle}
                          onChange={(e) => setBasics((b) => ({ ...b, currentTitle: e.target.value }))}
                          placeholder="Senior Software Engineer"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Years of experience</Label>
                        <Input
                          type="number"
                          min={0}
                          max={50}
                          value={basics.yearsOfExperience}
                          onChange={(e) => setBasics((b) => ({ ...b, yearsOfExperience: Number(e.target.value) }))}
                        />
                      </div>
                    </div>
                  </>
                )}

                {step === 1 && (
                  <>
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Select value={prefs.locationId} onValueChange={(v) => setPrefs((p) => ({ ...p, locationId: v }))}>
                        <SelectTrigger><SelectValue placeholder="Choose your location" /></SelectTrigger>
                        <SelectContent>
                          {(locations ?? []).map((l) => (
                            <SelectItem key={l.id} value={String(l.id)}>{l.city}, {l.country}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Remote policy preference</Label>
                      <Select value={prefs.remotePolicy} onValueChange={(v) => setPrefs((p) => ({ ...p, remotePolicy: v }))}>
                        <SelectTrigger><SelectValue placeholder="Select a preference" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="remote">Fully remote</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                          <SelectItem value="onsite">On-site</SelectItem>
                          <SelectItem value="flexible">Flexible</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Desired salary min (USD)</Label>
                        <Input
                          type="number"
                          min={0}
                          value={prefs.salaryMin}
                          onChange={(e) => setPrefs((p) => ({ ...p, salaryMin: e.target.value }))}
                          placeholder="90000"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Desired salary max (USD)</Label>
                        <Input
                          type="number"
                          min={0}
                          value={prefs.salaryMax}
                          onChange={(e) => setPrefs((p) => ({ ...p, salaryMax: e.target.value }))}
                          placeholder="130000"
                        />
                      </div>
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    <div className="space-y-2">
                      <Label>Add a skill</Label>
                      <div className="relative">
                        <Input
                          value={skillForm.term}
                          onChange={(e) => setSkillForm((f) => ({ ...f, term: e.target.value }))}
                          onFocus={() => setSkillOpen(true)}
                          onBlur={() => setTimeout(() => setSkillOpen(false), 200)}
                          placeholder={mySkillIds.has(Number(skillForm.term)) ? "Skill selected — set proficiency below" : "Search the skill taxonomy (e.g. \"js\", \"python\")"}
                          className="pr-10"
                        />
                        {skillForm.term && mySkillIds.has(Number(skillForm.term)) && (
                          <button className="absolute right-2.5 top-1/2 -translate-y-1/2" onClick={() => setSkillForm((f) => ({ ...f, term: "" }))}>
                            <X className="h-4 w-4 text-muted-foreground" />
                          </button>
                        )}
                        {skillOpen && (
                          <div className="absolute z-20 mt-1 w-full bg-popover border border-border rounded-lg shadow-lg max-h-56 overflow-y-auto">
                            {skillLoading ? (
                              <div className="p-3 text-sm text-muted-foreground flex items-center gap-2">
                                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Searching taxonomy…
                              </div>
                            ) : skillResults.length === 0 ? (
                              <div className="p-3 text-sm text-muted-foreground">No skills found — try a different term</div>
                            ) : (
                              skillResults.map((s) => (
                                <button
                                  key={s.id}
                                  type="button"
                                  onMouseDown={() => pickSkill(s)}
                                  className={`w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors border-b border-border/50 last:border-0 ${mySkillIds.has(s.id) ? "opacity-50" : ""}`}
                                >
                                  <span className="font-medium">{s.name}</span>
                                  <span className="text-muted-foreground ml-2 text-xs">{s.category}</span>
                                  {mySkillIds.has(s.id) && <Badge className="ml-2">already added</Badge>}
                                </button>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Skills come from a controlled taxonomy of 400+ entries with aliases — “JS” finds JavaScript.
                      </p>
                    </div>
                    {skillForm.term && mySkillIds.has(Number(skillForm.term)) && (
                      <div className="grid sm:grid-cols-2 gap-4 bg-secondary/60 rounded-lg p-4 border border-border">
                        <div className="space-y-2">
                          <Label>Proficiency</Label>
                          <Select value={skillForm.proficiency} onValueChange={(v) => setSkillForm((f) => ({ ...f, proficiency: v as any }))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="beginner">Beginner</SelectItem>
                              <SelectItem value="intermediate">Intermediate</SelectItem>
                              <SelectItem value="advanced">Advanced</SelectItem>
                              <SelectItem value="expert">Expert</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Years of experience</Label>
                          <Input
                            type="number"
                            min={0}
                            max={50}
                            value={skillForm.years}
                            onChange={(e) => setSkillForm((f) => ({ ...f, years: Number(e.target.value) }))}
                          />
                        </div>
                      </div>
                    )}
                    <div>
                      <Label className="mb-2 block">Your skills ({mySkills.length})</Label>
                      <div className="flex flex-wrap gap-2">
                        {mySkills.map((s) => (
                          <span key={s.skillId} className="skill-chip group gap-1.5">
                            {s.name}
                            <span className="text-muted-foreground">· {s.proficiency} · {s.years}y</span>
                            <button
                              className="ml-0.5 opacity-60 hover:opacity-100"
                              onClick={() => removeSkill.mutate({ skillId: s.skillId })}
                              aria-label={`Remove ${s.name}`}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                        {mySkills.length === 0 && (
                          <span className="text-sm text-muted-foreground">No skills added yet — pick one from the taxonomy above.</span>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {step === 3 && (
                  <>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Role title</Label>
                        <Input value={workForm.title} onChange={(e) => setWorkForm((f) => ({ ...f, title: e.target.value }))} placeholder="Senior Product Designer" />
                      </div>
                      <div className="space-y-2">
                        <Label>Company</Label>
                        <Input value={workForm.company} onChange={(e) => setWorkForm((f) => ({ ...f, company: e.target.value }))} placeholder="Acme Inc." />
                      </div>
                      <div className="space-y-2">
                        <Label>Start date</Label>
                        <Input type="date" value={workForm.startDate} onChange={(e) => setWorkForm((f) => ({ ...f, startDate: e.target.value }))} />
                      </div>
                      <div className="space-y-2">
                        <Label>End date</Label>
                        <Input type="date" value={workForm.endDate} onChange={(e) => setWorkForm((f) => ({ ...f, endDate: e.target.value }))} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Description (optional)</Label>
                      <Textarea value={workForm.description} onChange={(e) => setWorkForm((f) => ({ ...f, description: e.target.value }))} className="min-h-20" placeholder="What did you accomplish in this role?" />
                    </div>
                    <div>
                      <Label className="mb-2 block">Work history ({(snapshot?.workHistory ?? []).length})</Label>
                      <div className="space-y-2">
                        {(snapshot?.workHistory ?? []).map((w) => (
                          <div key={w.id} className="flex items-center justify-between bg-secondary/60 border border-border rounded-lg px-4 py-3 text-sm">
                            <div>
                              <span className="font-medium">{w.title}</span>
                              <span className="text-muted-foreground"> · {w.company}</span>
                              <span className="text-muted-foreground text-xs ml-2">{String(w.startDate ?? "?").slice(0, 4)} → {w.endDate ? String(w.endDate).slice(0, 4) : w.current ? "present" : "?"}</span>
                            </div>
                            <button onClick={() => removeWork.mutate({ id: w.id })} className="text-muted-foreground hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                        {(snapshot?.workHistory ?? []).length === 0 && (
                          <p className="text-sm text-muted-foreground">No roles added yet.</p>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {step === 4 && (
                  <>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Institution</Label>
                        <Input value={eduForm.institution} onChange={(e) => setEduForm((f) => ({ ...f, institution: e.target.value }))} placeholder="Stanford University" />
                      </div>
                      <div className="space-y-2">
                        <Label>Degree</Label>
                        <Input value={eduForm.degree} onChange={(e) => setEduForm((f) => ({ ...f, degree: e.target.value }))} placeholder="B.S. Computer Science" />
                      </div>
                      <div className="space-y-2">
                        <Label>Field of study</Label>
                        <Input value={eduForm.fieldOfStudy} onChange={(e) => setEduForm((f) => ({ ...f, fieldOfStudy: e.target.value }))} placeholder="Computer Science" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>Start year</Label>
                          <Input type="number" min={1950} max={2030} value={eduForm.startYear} onChange={(e) => setEduForm((f) => ({ ...f, startYear: e.target.value }))} />
                        </div>
                        <div className="space-y-2">
                          <Label>End year</Label>
                          <Input type="number" min={1950} max={2030} value={eduForm.endYear} onChange={(e) => setEduForm((f) => ({ ...f, endYear: e.target.value }))} />
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label className="mb-2 block">Education ({(snapshot?.education ?? []).length})</Label>
                      <div className="space-y-2">
                        {(snapshot?.education ?? []).map((e2) => (
                          <div key={e2.id} className="flex items-center justify-between bg-secondary/60 border border-border rounded-lg px-4 py-3 text-sm">
                            <div>
                              <span className="font-medium">{e2.degree}</span>
                              <span className="text-muted-foreground"> · {e2.institution}</span>
                              <span className="text-muted-foreground text-xs ml-2">{e2.startYear ?? "?"} – {e2.endYear ?? "?"}</span>
                            </div>
                            <button onClick={() => removeEdu.mutate({ id: e2.id })} className="text-muted-foreground hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                        {(snapshot?.education ?? []).length === 0 && (
                          <p className="text-sm text-muted-foreground">No education added yet.</p>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {step === 5 && (
                  <>
                    {/* Explicit confirm/reject of parsed resume suggestions */}
                    <div className="border border-dashed border-border rounded-xl p-5">
                      <div className="flex items-center gap-2 mb-1">
                        <FileSearch className="h-4.5 w-4.5 text-accent-foreground" />
                        <h3 className="font-semibold">Resume parsing</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        Upload your resume as a PDF. Extraction is unreliable by nature, so parsed work history,
                        education, and skills appear as <strong>suggestions</strong> — nothing is written to your
                        profile until you explicitly confirm each one.
                      </p>
                      <form onSubmit={onSubmitResume} className="flex flex-wrap items-center gap-3">
                        <input
                          ref={pendingRef}
                          type="file"
                          accept="application/pdf,.pdf"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            setResumeFile(f ?? null);
                          }}
                        />
                        <Button type="button" variant="outline" className="gap-2" onClick={() => pendingRef.current?.click()}>
                          <Upload className="h-4 w-4" /> {resumeFile ? resumeFile.name : "Choose PDF"}
                        </Button>
                        <Button type="submit" disabled={!resumeFile || uploadResume.isPending}>
                          {uploadResume.isPending ? "Extracting…" : "Parse resume"}
                        </Button>
                      </form>
                    </div>

                    {suggestions && suggestions.length > 0 && (
                      <div className="space-y-2.5">
                        <h3 className="font-semibold">Pending suggestions ({suggestions.filter((s) => s.status === "pending").length})</h3>
                        {suggestions.map((s) => (
                          <div key={s.id} className="flex items-center justify-between gap-3 bg-card border border-border rounded-lg px-4 py-3 text-sm">
                            <div className="min-w-0">
                              <Badge className="mb-1">{s.kind === "workExperience" ? "Work" : s.kind === "education" ? "Education" : "Skill"}</Badge>
                              <div className="truncate">
                                {s.kind === "workExperience" && (() => {
                                  const d = s.data as any;
                                  const start = d.startDate ? String(d.startDate).slice(0, 4) : "?";
                                  const end = d.endDate ? String(d.endDate).slice(0, 4) : "present";
                                  return <span>{d.title} · {d.company} · {start} → {end}</span>;
                                })()}
                                {s.kind === "education" && (
                                  <span>{(s.data as any).degree} · {(s.data as any).institution}{(s.data as any).endYear ? ` (${(s.data as any).endYear})` : ""}</span>
                                )}
                                {s.kind === "skill" && (
                                  <span>{(s.data as any).name} · {(s.data as any).proficiency}{(s.data as any).years ? ` · ${(s.data as any).years}y` : ""}</span>
                                )}
                              </div>
                            </div>
                            {s.status === "pending" ? (
                              <div className="flex gap-2 shrink-0">
                                <Button size="sm" onClick={() => decide.mutate({ suggestionId: s.id, decision: "confirm" })} disabled={decide.isPending}>
                                  <BadgeCheck className="h-3.5 w-3.5 mr-1" /> Confirm
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => decide.mutate({ suggestionId: s.id, decision: "reject" })} disabled={decide.isPending}>
                                  <X className="h-3.5 w-3.5 mr-1" /> Dismiss
                                </Button>
                              </div>
                            ) : (
                              <Badge variant={s.status === "confirmed" ? "default" : "secondary"}>{s.status}</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Review summary */}
                    <div className="bg-secondary/60 border border-border rounded-xl p-5">
                      <h3 className="font-semibold mb-3">Review</h3>
                      <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                        <div className="flex justify-between"><dt className="text-muted-foreground">Headline</dt><dd className="font-medium">{snapshot?.profile?.headline || "—"}</dd></div>
                        <div className="flex justify-between"><dt className="text-muted-foreground">Current role</dt><dd className="font-medium">{snapshot?.profile?.currentTitle || "—"}</dd></div>
                        <div className="flex justify-between"><dt className="text-muted-foreground">Experience</dt><dd className="font-medium">{snapshot?.profile?.yearsOfExperience ?? "—"} yrs</dd></div>
                        <div className="flex justify-between"><dt className="text-muted-foreground">Remote policy</dt><dd className="font-medium">{(snapshot?.profile as any)?.remotePolicy ?? "—"}</dd></div>
                        <div className="flex justify-between"><dt className="text-muted-foreground">Skills</dt><dd className="font-medium">{mySkills.length}</dd></div>
                        <div className="flex justify-between"><dt className="text-muted-foreground">Roles</dt><dd className="font-medium">{(snapshot?.workHistory ?? []).length}</dd></div>
                        <div className="flex justify-between"><dt className="text-muted-foreground">Education</dt><dd className="font-medium">{(snapshot?.education ?? []).length}</dd></div>
                        <div className="flex justify-between"><dt className="text-muted-foreground">Salary target</dt>
                          <dd className="font-medium">
                            {snapshot?.profile?.desiredSalaryMin
                              ? `$${Number(snapshot.profile.desiredSalaryMin).toLocaleString()} – $${Number(snapshot.profile.desiredSalaryMax ?? 0).toLocaleString()}`
                              : "—"}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <Button variant="outline" disabled={step === 0} onClick={() => setStep((s) => s - 1)} className="gap-1.5">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </Button>
                  {step < 5 ? (
                    <Button onClick={() => saveAndAdvance(step + 1)} disabled={saveBasics.isPending || savePreferences.isPending || addSkill.isPending || addWork.isPending || addEdu.isPending} className="gap-1.5">
                      Save & continue <ArrowRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button asChild className="gap-1.5">
                      <Link href="/candidate">Done — view dashboard <BadgeCheck className="h-4 w-4" /></Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Completeness sidebar */}
          <div className="lg:sticky lg:top-24 h-fit">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Completeness</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="relative h-20 w-20">
                    <svg viewBox="0 0 36 36" className="h-20 w-20 -rotate-90">
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
                      <span className="text-lg font-bold font-display">{score}%</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {score === 100
                      ? "Your profile is complete — employers can now match you accurately."
                      : "Complete every section to unlock accurate matching with employers."}
                  </p>
                </div>
                <Progress value={score} className="h-2" />
                <ul className="space-y-1.5 text-sm">
                  {scoreSections.map((s, i) => (
                    <li key={s.key} className="flex items-center justify-between">
                      <span className={s.done ? "text-foreground" : "text-muted-foreground"}>{i + 1}. {s.label}</span>
                      {s.done ? <BadgeCheck className="h-4 w-4 text-emerald-600" /> : <span className="h-4 w-4 rounded-full border border-border" />}
                    </li>
                  ))}
                </ul>
                {draft?.currentStep != null && (
                  <p className="text-xs text-muted-foreground border-t border-border pt-3 mt-3">
                    Last saved step: {STEPS[draft.currentStep]?.label} — your progress is stored server-side.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
