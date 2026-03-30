import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

const DEV_TOKEN_KEY = "mealriot_dev_token";

interface AuthContextValue {
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => void;
  signOut: () => void;
  devLogin: (email: string, name?: string) => Promise<void>;
  isDevSession: boolean;
  signUp: (email: string, password: string, publicName?: string) => Promise<{ error?: string; needsVerification?: boolean }>;
  signInWithPassword: (email: string, password: string) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDevSession, setIsDevSession] = useState(false);

  useEffect(() => {
    // Check for dev token first
    const devToken = localStorage.getItem(DEV_TOKEN_KEY);
    if (devToken) {
      // Create a fake session-like object so ProtectedRoute works
      setSession({ access_token: devToken } as unknown as Session);
      setIsDevSession(true);
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const signInWithGoogle = () =>
    supabase.auth.signInWithOAuth({ provider: "google" });

  const signOut = () => {
    localStorage.removeItem(DEV_TOKEN_KEY);
    setIsDevSession(false);
    setSession(null);
    supabase.auth.signOut();
  };

  const signUp = async (email: string, password: string, publicName?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        ...(publicName ? { data: { full_name: publicName } } : {}),
      },
    });
    if (error) return { error: error.message };
    if (data.user && !data.session) return { needsVerification: true };
    return {};
  };

  const signInWithPassword = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return {};
  };

  const devLogin = async (email: string, name = "Test User") => {
    const apiUrl = import.meta.env.VITE_API_URL as string;
    const res = await fetch(`${apiUrl}/api/v1/dev/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name }),
    });
    if (!res.ok) throw new Error("Dev login failed");
    const data = await res.json();
    localStorage.setItem(DEV_TOKEN_KEY, data.token);
    setSession({ access_token: data.token } as unknown as Session);
    setIsDevSession(true);
  };

  return (
    <AuthContext.Provider value={{ session, loading, signInWithGoogle, signOut, devLogin, isDevSession, signUp, signInWithPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
