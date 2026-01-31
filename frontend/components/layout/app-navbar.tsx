"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, LogOut, Settings, ChevronDown } from "lucide-react";
import { useSidebar } from "@/context/sidebar-context";

export function AppNavbar() {
  const router = useRouter();
  const { isExpanded } = useSidebar();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
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
    // SPATIAL CONTAINER: Moves when sidebar expands
    <div
      className="fixed top-0 right-0 z-40 h-16 flex items-center justify-between px-6 md:px-8 border-b border-white/5 bg-[#09090b]/80 backdrop-blur-md transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
      style={{
        left: isExpanded ? "280px" : "0px", // The Glide
        width: isExpanded ? "calc(100% - 280px)" : "100%", // The Compression
      }}
    >
      {/* LEFT: ENGINEERED WORDMARK */}
      <Link href="/dashboard" className="group flex items-center gap-2">
        {/* The Mark: Suspended Glass with Inner Glow */}
        <div className="relative w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden transition-all duration-500 group-hover:border-emerald-500/30 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]">
          {/* Inner "Light" */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <span className="relative z-10 font-brand font-bold text-lg text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">
            S
          </span>
        </div>

        {/* The Type: Clean, Geometric, Tracking Animation */}
        <div className="flex flex-col justify-center h-full pt-1">
          <span className="font-brand font-bold text-lg text-zinc-200 tracking-tight transition-all duration-500 group-hover:tracking-wide group-hover:text-white group-hover:-translate-y-[1px]">
            SignalForge
          </span>
          {/* Subtle underline energy that appears on hover */}
          <span className="h-[1px] w-0 bg-emerald-500/50 group-hover:w-full transition-all duration-700 ease-out" />
        </div>
      </Link>

      {/* RIGHT: PROFILE CONTROL (Simplified) */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-3 pl-1 pr-3 py-1 rounded-full border transition-all duration-300 group ${
            isOpen
              ? "border-emerald-500/50 bg-zinc-900"
              : "border-transparent hover:border-zinc-800 hover:bg-white/5"
          }`}
        >
          {/* Avatar Glyph */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-b from-zinc-800 to-zinc-900 flex items-center justify-center border border-zinc-700 group-hover:border-emerald-500/50 transition-colors shadow-inner">
            <User className="w-4 h-4 text-zinc-400 group-hover:text-emerald-400 transition-colors" />
          </div>
        </button>

        {/* GLASS DROPDOWN */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-white/10 bg-[#09090b] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] z-40 overflow-hidden backdrop-blur-xl"
            >
              <div className="p-1 space-y-1">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    router.push("/settings");
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors group"
                >
                  <Settings className="w-4 h-4 group-hover:text-emerald-400 transition-colors" />{" "}
                  Settings
                </button>

                <div className="h-[1px] bg-white/5 mx-2 my-1" />

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Log out
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
