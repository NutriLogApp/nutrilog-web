import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { applyTheme, type ThemeName } from "@/themes/themes";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";
import ErrorBoundary from "@/components/ErrorBoundary";
import "@/i18n";

// Lazy load pages
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const PendingPage = lazy(() => import("@/pages/PendingPage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const MyDayPage = lazy(() => import("@/pages/MyDayPage"));
const ContestPage = lazy(() => import("@/pages/ContestPage"));
const TrendsPage = lazy(() => import("@/pages/TrendsPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const AdminPage = lazy(() => import("@/pages/AdminPage"));
const GroupLeaderboardPage = lazy(() => import("@/pages/GroupLeaderboardPage"));
const CreateGroupPage = lazy(() => import("@/pages/CreateGroupPage"));

import { queryClient } from "@/lib/queryConfig";

function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const saved = localStorage.getItem("nutrilog-theme") as ThemeName | null;
    applyTheme(saved ?? "ocean");
    const dm = localStorage.getItem("nutrilog-dark-mode");
    if (dm === "dark") document.documentElement.classList.add("force-dark");
    else if (dm === "light") document.documentElement.classList.add("force-light");
  }, []);
  return <>{children}</>;
}

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
           style={{ borderColor: "var(--border)", borderTopColor: "var(--theme-start)" }} />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider>
            <BrowserRouter>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/pending" element={<PendingPage />} />
                  <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/myday" element={<MyDayPage />} />
                    <Route path="/contest" element={<ContestPage />} />
                    <Route path="/contest/groups/new" element={<CreateGroupPage />} />
                    <Route path="/contest/groups/:groupId" element={<GroupLeaderboardPage />} />
                    <Route path="/trends" element={<TrendsPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/admin" element={<AdminPage />} />
                  </Route>
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
