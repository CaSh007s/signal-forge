"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

interface UserContextType {
  user: User | null;
  refreshUser: () => Promise<void>;
  avatarUrl: string;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const getAvatarUrl = (u: User | null) => {
    if (!u) return "";
    const style = u.user_metadata?.avatar_style || "shapes";
    return `https://api.dicebear.com/9.x/${style}/svg?seed=${u.id}&backgroundColor=09090b`;
  };

  const refreshUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);
  };

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
  }, []);

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
