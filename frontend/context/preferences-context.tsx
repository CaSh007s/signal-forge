"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { MotionConfig } from "framer-motion";

type MotionPreference = "cinematic" | "minimal";
type DensityPreference = "comfort" | "compact";

interface PreferencesContextType {
  motion: MotionPreference;
  density: DensityPreference;
  setMotion: (v: MotionPreference) => void;
  setDensity: (v: DensityPreference) => void;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(
  undefined,
);

export function PreferencesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [motion, setMotion] = useState<MotionPreference>("cinematic");
  const [density, setDensity] = useState<DensityPreference>("comfort");

  // Apply Density Class to Body
  useEffect(() => {
    document.body.setAttribute("data-density", density);
  }, [density]);

  return (
    <PreferencesContext.Provider
      value={{ motion, density, setMotion, setDensity }}
    >
      {/* Global Framer Motion Configuration */}
      <MotionConfig
        transition={motion === "minimal" ? { duration: 0 } : undefined}
      >
        {children}
      </MotionConfig>
    </PreferencesContext.Provider>
  );
}

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (!context)
    throw new Error("usePreferences must be used within a PreferencesProvider");
  return context;
};
