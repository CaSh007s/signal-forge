"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface SidebarContextType {
  isPinned: boolean;
  isHovered: boolean;
  setHovered: (hover: boolean) => void;
  togglePin: () => void;
  isExpanded: boolean;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isPinned, setIsPinned] = useState(false);
  const [isHovered, setHovered] = useState(false);

  useEffect(() => {
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

  const isExpanded = isPinned || isHovered;

  return (
    <SidebarContext.Provider
      value={{ isPinned, isHovered, setHovered, togglePin, isExpanded }}
    >
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
