"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { useRouter, usePathname } from "next/navigation";

interface UserContextType {
  user: User | null;
  refreshUser: () => Promise<void>;
  avatarUrl: string;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const getAvatarUrl = useCallback((u: User | null) => {
    if (!u) return "";
    const style = u.user_metadata?.avatar_style || "shapes";
    return `https://api.dicebear.com/9.x/${style}/svg?seed=${u.id}&backgroundColor=09090b`;
  }, []);

  const refreshUser = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // --- PHASE 10: STRICT OAUTH 2FA ENFORCEMENT ---
    // If a user exists, mathematically check their Authenticator Assurance Level (AAL)
    if (user && !pathname?.startsWith("/auth/")) {
      const { data: aalData, error: aalError } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

      if (!aalError && aalData) {
        // If they require AAL2 (MFA enrolled) but only have AAL1 (Basic Login/OAuth)
        if (aalData.currentLevel === "aal1" && aalData.nextLevel === "aal2") {
          console.warn(
            "🛡️ Security Intercept: AAL2 Required! Redirecting to MFA Check.",
          );
          setUser(null);
          router.push("/auth/signin?mfa_required=true");
          return;
        }
      }
    }

    setUser(user);
  }, [pathname, router]);

  useEffect(() => {
    const initUser = async () => {
      await refreshUser();
    };
    initUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [refreshUser]);

  return (
    <UserContext.Provider
      value={{ user, refreshUser, avatarUrl: getAvatarUrl(user) }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
};
