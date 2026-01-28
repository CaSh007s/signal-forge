"use client";

import React, { createContext, useContext, useState } from "react";

type AuthMode = "login" | "signup";

interface AuthContextType {
  isOpen: boolean;
  mode: AuthMode;
  openAuth: (mode?: AuthMode) => void;
  closeAuth: () => void;
  toggleMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("login");

  const openAuth = (initialMode: AuthMode = "login") => {
    setMode(initialMode);
    setIsOpen(true);
    // Lock body scroll
    document.body.style.overflow = "hidden";
  };

  const closeAuth = () => {
    setIsOpen(false);
    // Unlock body scroll
    document.body.style.overflow = "unset";
  };

  const toggleMode = () => {
    setMode((prev) => (prev === "login" ? "signup" : "login"));
  };

  return (
    <AuthContext.Provider
      value={{ isOpen, mode, openAuth, closeAuth, toggleMode }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
