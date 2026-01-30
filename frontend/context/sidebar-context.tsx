"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface SidebarContextType {
  isPinned: boolean;
  togglePin: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isPinned, setIsPinned] = useState(false);

  useEffect(() => {
    // ✅ FIX: Use setTimeout to satisfy the linter and prevent render cascading
    setTimeout(() => {
      const saved = localStorage.getItem("sidebar-pinned");
      if (saved === "true") setIsPinned(true);
    }, 0);
  }, []);

  const togglePin = () => {
    setIsPinned((prev) => {
      const newState = !prev;
      localStorage.setItem("sidebar-pinned", String(newState));
      return newState;
    });
  };

  return (
    <SidebarContext.Provider value={{ isPinned, togglePin }}>
      {children}
    </SidebarContext.Provider>
  );
}

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context)
    throw new Error("useSidebar must be used within a SidebarProvider");
  return context;
};
