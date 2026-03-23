import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { applyTheme, type ThemeName } from "@/themes/themes";
import { AuthProvider } from "@/contexts/AuthContext";
import LoginPage from "@/pages/LoginPage";
import PendingPage from "@/pages/PendingPage";
import DashboardPage from "@/pages/DashboardPage";
import MyDayPage from "@/pages/MyDayPage";
import TrendsPage from "@/pages/TrendsPage";
import ProfilePage from "@/pages/ProfilePage";
import AdminPage from "@/pages/AdminPage";
import FriendsPage from "@/pages/FriendsPage";
import AddFriendPage from "@/pages/AddFriendPage";
import GroupLeaderboardPage from "@/pages/GroupLeaderboardPage";
import CreateGroupPage from "@/pages/CreateGroupPage";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";
import "@/i18n";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const saved = localStorage.getItem("nutrilog-theme") as ThemeName | null;
    applyTheme(saved ?? "ocean");
    // Restore dark mode preference
    const dm = localStorage.getItem("nutrilog-dark-mode");
    if (dm === "dark") document.documentElement.classList.add("force-dark");
    else if (dm === "light") document.documentElement.classList.add("force-light");
  }, []);
  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/pending" element={<PendingPage />} />
              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/" element={<DashboardPage />} />
                <Route path="/myday" element={<MyDayPage />} />
                <Route path="/friends" element={<FriendsPage />} />
                <Route path="/friends/add" element={<AddFriendPage />} />
                <Route path="/friends/groups/new" element={<CreateGroupPage />} />
                <Route path="/friends/groups/:groupId" element={<GroupLeaderboardPage />} />
                <Route path="/trends" element={<TrendsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/admin" element={<AdminPage />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
