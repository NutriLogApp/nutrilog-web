import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { applyTheme, type ThemeName } from "@/themes/themes";
import { AuthProvider } from "@/contexts/AuthContext";
import LoginPage from "@/pages/LoginPage";
import PendingPage from "@/pages/PendingPage";
import ProtectedRoute from "@/components/ProtectedRoute";
import "@/i18n";

function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const saved = localStorage.getItem("nutrilog-theme") as ThemeName | null;
    applyTheme(saved ?? "ocean");
  }, []);
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/pending" element={<PendingPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <div className="p-8 text-center">Dashboard coming in Phase 2</div>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}
