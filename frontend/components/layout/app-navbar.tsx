"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, LogOut, Settings, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AppNavbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/auth/signin");
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-40 h-16 flex items-center justify-between px-6 md:px-8 border-b border-white/5 bg-[#09090b]/80 backdrop-blur-md">
      {/* LEFT: Wordmark */}
      <Link href="/dashboard" className="group flex items-center gap-2">
        {/* Simple Emerald Mark */}
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-black font-bold font-brand shadow-[0_0_15px_rgba(16,185,129,0.3)] group-hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all">
          SF
        </div>
        <span className="font-brand font-bold text-lg text-zinc-200 group-hover:text-white transition-colors">
          SignalForge
        </span>
      </Link>

      {/* RIGHT: Profile Control */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 pl-1 pr-3 py-1 rounded-full border border-zinc-800 bg-black/40 hover:bg-zinc-900 hover:border-zinc-700 transition-all group"
        >
          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700 group-hover:border-emerald-500/50 transition-colors">
            <User className="w-4 h-4 text-zinc-400 group-hover:text-emerald-400" />
          </div>
          <ChevronDown
            className={`w-3 h-3 text-zinc-500 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {/* CUSTOM DROPDOWN */}
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Click backdrop to close */}
              <div
                className="fixed inset-0 z-30"
                onClick={() => setIsOpen(false)}
              />

              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl z-40 overflow-hidden"
              >
                <div className="p-1 space-y-1">
                  <button
                    onClick={() => router.push("/settings")}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <Settings className="w-4 h-4" /> Settings
                  </button>
                  <div className="h-[1px] bg-zinc-800 mx-2 my-1" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Log out
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
