import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationCentre } from "@/components/NotificationCentre";
import { Building2, Briefcase, User, LogOut, Menu, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";

export function SiteLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { href: "/jobs", label: "Browse Jobs" },
    ...(isAuthenticated ? [
      { href: "/candidate", label: "Candidate" },
      { href: "/employer", label: "Employer" },
    ] : []),
  ];

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 bg-background/85 backdrop-blur border-b border-border">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-lg ink-surface flex items-center justify-center text-amber-ink font-display font-bold text-lg shadow-sm">
              H
            </div>
            <span className="font-display text-xl font-semibold tracking-tight">
              Hire<span className="amber-ink">Wise</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3.5 py-2 rounded-md text-sm font-medium transition-colors ${
                  location === l.href
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <NotificationCentre />
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 pl-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{user?.name ?? "Profile"}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{user?.name}</span>
                      <span className="text-xs text-muted-foreground">{user?.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/candidate" className="flex items-center gap-2 cursor-pointer">
                      <User className="h-4 w-4" /> Candidate dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/employer" className="flex items-center gap-2 cursor-pointer">
                      <Building2 className="h-4 w-4" /> Employer dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()} className="flex items-center gap-2 text-destructive">
                    <LogOut className="h-4 w-4" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              </>
            ) : (
              <Button onClick={() => startLogin()} className="gap-2">
                <Briefcase className="h-4 w-4" /> Sign in
              </Button>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-md hover:bg-secondary"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-border bg-background px-4 py-3 flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className={`px-3 py-2.5 rounded-md text-sm font-medium ${
                  location === l.href ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                {l.label}
              </Link>
            ))}
            {!isAuthenticated && (
              <Button onClick={() => startLogin()} className="mt-2 w-full gap-2">
                <Briefcase className="h-4 w-4" /> Sign in
              </Button>
            )}
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="ink-surface mt-auto">
        <div className="container py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-md bg-white/10 flex items-center justify-center font-display font-bold text-amber-ink">
              H
            </div>
            <span className="font-display text-lg font-semibold">
              Hire<span className="text-amber-ink">Wise</span>
            </span>
          </div>
          <p className="text-sm text-white/60">
            A recruitment platform — ranked matching, an ATS with immutable history, messaging, and a notification engine.
          </p>
          <p className="text-xs text-white/40 font-mono">© 2026 HireWise</p>
        </div>
      </footer>
    </div>
  );
}
