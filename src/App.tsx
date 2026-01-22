import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import EmployeesList from "./pages/employees/EmployeesList";
import EmployeeForm from "./pages/employees/EmployeeForm";
import EmployeeView from "./pages/employees/EmployeeView";
import UsersPage from "./pages/UsersPage";
import AttendancePage from "./pages/AttendancePage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import HelpPage from "./pages/HelpPage";
import AutomationLab from "./pages/AutomationLab";

// Error Pages
import NotFoundPage from "./pages/errors/NotFoundPage";
import ForbiddenPage from "./pages/errors/ForbiddenPage";
import ServerErrorPage from "./pages/errors/ServerErrorPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Error pages */}
            <Route path="/403" element={<ForbiddenPage />} />
            <Route path="/500" element={<ServerErrorPage />} />
            
            {/* Protected routes with layout */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              
              {/* Employees - All roles */}
              <Route path="/employees" element={<EmployeesList />} />
              <Route path="/employees/new" element={<EmployeeForm />} />
              <Route path="/employees/:id" element={<EmployeeView />} />
              <Route path="/employees/:id/edit" element={<EmployeeForm />} />
              
              {/* Users - Admin only */}
              <Route
                path="/users"
                element={
                  <ProtectedRoute allowedRoles={['Admin']}>
                    <UsersPage />
                  </ProtectedRoute>
                }
              />
              
              {/* Attendance - Admin + Manager */}
              <Route
                path="/attendance"
                element={
                  <ProtectedRoute allowedRoles={['Admin', 'Manager']}>
                    <AttendancePage />
                  </ProtectedRoute>
                }
              />
              
              {/* Profile - Employee only */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute allowedRoles={['Employee']}>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              
              {/* All roles */}
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/help" element={<HelpPage />} />
              <Route path="/automation-lab" element={<AutomationLab />} />
            </Route>
            
            {/* Catch-all */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
