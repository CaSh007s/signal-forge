"use client";

import { motion } from "framer-motion";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen w-full bg-[#050505] overflow-hidden flex items-center justify-center font-sans selection:bg-emerald-500/30">
      {/* 1. THE SLOWED, DIMMED GRID */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:60px_60px]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#050505_120%)]"></div>

        {/* Faint, Slow Moving Fog */}
        <motion.div
          animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.1, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] rounded-full bg-emerald-900/5 blur-[120px]"
        />
      </div>

      {/* 2. THE CONTENT */}
      <div className="relative z-10 w-full max-w-md px-4">{children}</div>
    </div>
  );
}
