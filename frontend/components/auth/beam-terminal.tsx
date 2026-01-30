"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface BeamTerminalProps {
  children: React.ReactNode;
  header: React.ReactNode;
}

export function BeamTerminal({ children, header }: BeamTerminalProps) {
  // We use this state to trigger the "Beam Fade" at the exact moment the scan finishes
  const [scanComplete, setScanComplete] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setScanComplete(true), 2000); // Matches animation duration
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* 1. THE SCANNING BEAM */}
      {/* It moves from top: 0 to top: 100% exactly alongside the reveal animation */}
      <motion.div
        initial={{ top: 0, opacity: 0 }}
        animate={{
          top: "100%",
          opacity: scanComplete ? 0 : 1, // Fade out instantly when job is done
        }}
        transition={{
          top: { duration: 2, ease: "easeInOut" },
          opacity: { duration: 0.2, delay: 0.1 }, // Slight delay to let it appear
        }}
        className="absolute left-0 right-0 h-[2px] bg-emerald-500 z-50 pointer-events-none shadow-[0_0_40px_rgba(16,185,129,0.8)]"
      >
        {/* The Halo / Glow Core */}
        <div className="absolute inset-0 bg-emerald-400 blur-[2px]" />
        <div className="absolute inset-0 bg-white/50 blur-[1px]" />
      </motion.div>

      {/* 2. THE CONTENT PANEL */}
      {/* We use clip-path to hide everything *below* the beam */}
      <motion.div
        initial={{ clipPath: "inset(0 0 100% 0)" }}
        animate={{ clipPath: "inset(0 0 0% 0)" }}
        transition={{ duration: 2, ease: "easeInOut" }}
        className="bg-zinc-900/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative"
      >
        {/* Glass Surface Shine */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

        <div className="p-8 relative z-10">
          {/* HEADER SECTION (Logo + Title) */}
          <div className="text-center space-y-2 mb-8">{header}</div>

          {/* FORM CONTENT */}
          {children}
        </div>
      </motion.div>
    </div>
  );
}
