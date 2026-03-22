import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { applyTheme } from "@/themes/themes";
import LoginPage from "@/pages/LoginPage";
import PendingPage from "@/pages/PendingPage";
import ProtectedRoute from "@/components/ProtectedRoute";
import "@/i18n";

function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    applyTheme("ocean");
  }, []);
  return <>{children}</>;
}

export default function App() {
  return (
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
  );
}
