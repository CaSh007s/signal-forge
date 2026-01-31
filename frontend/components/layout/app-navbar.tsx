"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  LogOut,
  Settings,
  ChevronDown,
  Palette,
  Moon,
  Sun,
} from "lucide-react";

export function AppNavbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [showAppearance, setShowAppearance] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setShowAppearance(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/auth/signin");
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-40 h-16 flex items-center justify-between px-6 md:px-8 border-b border-white/5 bg-[#09090b]/80 backdrop-blur-md">
      {/* LEFT: Wordmark */}
      <Link href="/dashboard" className="group flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-black font-bold font-brand shadow-[0_0_15px_rgba(16,185,129,0.3)] group-hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all">
          SF
        </div>
        <span className="font-brand font-bold text-lg text-zinc-200 group-hover:text-white transition-colors">
          SignalForge
        </span>
      </Link>

      {/* RIGHT: Profile Control */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-3 pl-1 pr-3 py-1 rounded-full border bg-black/40 transition-all group ${isOpen ? "border-emerald-500/50 bg-zinc-900" : "border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700"}`}
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
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl z-40 overflow-hidden"
            >
              {/* MAIN MENU */}
              {!showAppearance ? (
                <div className="p-1 space-y-1">
                  <button
                    onClick={() => setShowAppearance(true)}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <Palette className="w-4 h-4 group-hover:text-purple-400 transition-colors" />{" "}
                      Appearance
                    </div>
                    <ChevronDown className="w-3 h-3 -rotate-90 opacity-50" />
                  </button>

                  <button
                    onClick={() => {
                      setIsOpen(false);
                      router.push("/settings");
                    }}
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
              ) : (
                /* LIGHTWEIGHT APPEARANCE PANEL */
                <div className="p-2">
                  <div className="flex items-center gap-2 px-2 pb-2 mb-2 border-b border-zinc-800 text-xs font-medium text-zinc-500">
                    <button
                      onClick={() => setShowAppearance(false)}
                      className="hover:text-white transition-colors"
                    >
                      <ChevronDown className="w-3 h-3 rotate-90" />
                    </button>
                    <span>QUICK THEME</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button className="flex flex-col items-center gap-2 p-3 rounded-lg bg-emerald-900/10 border border-emerald-500/50 text-emerald-400">
                      <Moon className="w-5 h-5" />
                      <span className="text-[10px]">Signal</span>
                    </button>
                    <button className="flex flex-col items-center gap-2 p-3 rounded-lg bg-zinc-800/50 border border-zinc-700 text-zinc-500 hover:text-zinc-300 transition-colors">
                      <Sun className="w-5 h-5" />
                      <span className="text-[10px]">Violet</span>
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
