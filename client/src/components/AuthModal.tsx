import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Loader2, ShieldCheck, Sparkles, UserCheck } from "lucide-react";

export function AuthModal() {
  const [open, setOpen] = useState(false);
  const [showAccountCustomizer, setShowAccountCustomizer] = useState(false);
  const [email, setEmail] = useState("ayush.patel@gmail.com");
  const [name, setName] = useState("Ayush Patel");
  const [userType, setUserType] = useState<"candidate" | "employer" | "both">("candidate");

  const utils = trpc.useUtils();

  const googleLoginMutation = trpc.auth.loginWithGoogle.useMutation({
    onSuccess: async () => {
      toast.success("Successfully signed in with Google!");
      await utils.auth.me.invalidate();
      setOpen(false);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to sign in with Google");
    },
  });

  useEffect(() => {
    const handleOpen = () => {
      setOpen(true);
    };

    window.addEventListener("open-auth-modal", handleOpen);
    return () => {
      window.removeEventListener("open-auth-modal", handleOpen);
    };
  }, []);

  const handleGoogleSignIn = () => {
    googleLoginMutation.mutate({
      email,
      name,
      userType,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden rounded-2xl border border-border shadow-2xl bg-card">
        {/* Top Hero Gradient */}
        <div className="bg-gradient-to-br from-slate-900 via-zinc-900 to-amber-950 p-6 text-white text-center relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-amber-500/20 rounded-full blur-xl pointer-events-none" />
          <div className="h-12 w-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center font-display font-bold text-2xl text-amber-400 mx-auto mb-3 shadow-lg backdrop-blur-md">
            H
          </div>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold font-display text-white text-center">
              Welcome to Hire<span className="text-amber-400">Wise</span>
            </DialogTitle>
            <DialogDescription className="text-white/70 text-sm text-center mt-1">
              Sign in with your Google account to access your account & job matches
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-5">
          {/* Selected Role */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Signing in as
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setUserType("candidate")}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
                  userType === "candidate"
                    ? "border-primary bg-primary/10 text-primary font-semibold shadow-sm"
                    : "border-border hover:bg-accent text-muted-foreground"
                }`}
              >
                <UserCheck className="h-4 w-4" /> Candidate
              </button>
              <button
                type="button"
                onClick={() => setUserType("employer")}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
                  userType === "employer"
                    ? "border-primary bg-primary/10 text-primary font-semibold shadow-sm"
                    : "border-border hover:bg-accent text-muted-foreground"
                }`}
              >
                <Sparkles className="h-4 w-4" /> Employer
              </button>
            </div>
          </div>

          {/* Primary Google Sign-In Button */}
          <div className="space-y-3 pt-1">
            <Button
              onClick={handleGoogleSignIn}
              disabled={googleLoginMutation.isPending}
              size="lg"
              className="w-full h-12 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 dark:border-slate-700 shadow-sm font-medium text-base rounded-xl transition-all duration-200 hover:shadow-md flex items-center justify-center gap-3 active:scale-[0.99]"
            >
              {googleLoginMutation.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin text-slate-600" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>Continue with Google</span>
            </Button>
          </div>

          {/* Account preview / Customizer accordion */}
          <div className="rounded-xl border border-border/80 p-3 bg-muted/40 text-xs text-muted-foreground flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="h-7 w-7 rounded-full bg-amber-500/20 text-amber-600 font-semibold flex items-center justify-center text-xs flex-shrink-0">
                {name[0] ?? "G"}
              </div>
              <div className="truncate">
                <span className="font-medium text-foreground block truncate">{name}</span>
                <span className="text-muted-foreground block truncate">{email}</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAccountCustomizer((v) => !v)}
              className="text-xs h-7 px-2 text-primary hover:text-primary"
            >
              {showAccountCustomizer ? "Hide" : "Change"}
            </Button>
          </div>

          {showAccountCustomizer && (
            <div className="space-y-3 pt-1 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="space-y-1">
                <Label htmlFor="google-name" className="text-xs">
                  Google Display Name
                </Label>
                <Input
                  id="google-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="google-email" className="text-xs">
                  Google Email Address
                </Label>
                <Input
                  id="google-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>
          )}

          {/* Footer security note */}
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground pt-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>Secure 1-Click Google OAuth Authentication</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
