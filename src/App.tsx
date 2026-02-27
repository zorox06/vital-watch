import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { getSession } from "@/lib/auth";
import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import DoctorDashboard from "./pages/DoctorDashboard";
import PatientPortal from "./pages/PatientPortal";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Auth guard component
function RequireAuth({ role, children }: { role: 'doctor' | 'patient'; children: React.ReactNode }) {
  const session = getSession();
  if (!session || session.role !== role) {
    return <Navigate to={`/login/${role}`} replace />;
  }
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login/doctor" element={<LoginPage role="doctor" />} />
          <Route path="/login/patient" element={<LoginPage role="patient" />} />
          <Route path="/doctor" element={
            <RequireAuth role="doctor">
              <DoctorDashboard />
            </RequireAuth>
          } />
          <Route path="/patient" element={
            <RequireAuth role="patient">
              <PatientPortal />
            </RequireAuth>
          } />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
