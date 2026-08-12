import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import CandidateDashboard from "./pages/CandidateDashboard";
import ProfileBuilder from "./pages/ProfileBuilder";
import EmployerDashboard from "./pages/EmployerDashboard";
import CompanyCreate from "./pages/CompanyCreate";
import CompanyPublic from "./pages/CompanyPublic";
import JobApplications from "./pages/JobApplications";
import AdminPage from "./pages/AdminPage";
import UnsubscribePage from "./pages/UnsubscribePage";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/jobs"} component={Jobs} />
      <Route path={"/jobs/:id"} component={JobDetail} />
      <Route path={"/candidate"} component={CandidateDashboard} />
      <Route path={"/candidate/profile"} component={ProfileBuilder} />
      <Route path={"/employer"} component={EmployerDashboard} />
      <Route path={"/employer/job/:id/applications"} component={JobApplications} />
      <Route path={"/admin"} component={AdminPage} />
      <Route path={"/unsubscribe/:token"} component={UnsubscribePage} />
      <Route path={"/company/create"} component={CompanyCreate} />
      <Route path={"/company/:id"} component={CompanyPublic} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
