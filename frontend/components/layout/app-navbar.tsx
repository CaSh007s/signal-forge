"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, LogOut, Settings, ChevronDown } from "lucide-react";
import { useSidebar } from "@/context/sidebar-context";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { useUser } from "@/context/user-context";

export function AppNavbar() {
  const router = useRouter();
  const { isExpanded } = useSidebar();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, avatarUrl } = useUser();

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

  // ✅ FIX: Real Logout + Redirect to Landing Page
  const handleLogout = async () => {
    // 1. Kill the Supabase session
    await supabase.auth.signOut();

    // 2. Clear any leftover local state
    localStorage.removeItem("token");

    // 3. Return to the Public World (Landing Page)
    router.push("/");
  };

  return (
    <div
      className="fixed top-0 right-0 z-40 h-16 flex items-center justify-between px-6 md:px-8 border-b border-white/5 bg-[#09090b]/80 backdrop-blur-md transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
      style={{
        left: isExpanded ? "280px" : "0px",
        width: isExpanded ? "calc(100% - 280px)" : "100%",
      }}
    >
      {/* LEFT: ENGINEERED WORDMARK */}
      <Link href="/dashboard" className="group flex items-center gap-2">
        <div className="relative w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden transition-all duration-500 group-hover:border-emerald-500/30 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <span className="relative z-10 font-brand font-bold text-lg text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">
            S
          </span>
        </div>

        <div className="flex flex-col justify-center h-full pt-1">
          <span className="font-brand font-bold text-lg text-zinc-200 tracking-tight transition-all duration-500 group-hover:tracking-wide group-hover:text-white group-hover:-translate-y-[1px]">
            SignalForge
          </span>
          <span className="h-[1px] w-0 bg-emerald-500/50 group-hover:w-full transition-all duration-700 ease-out" />
        </div>
      </Link>

      {/* RIGHT: PROFILE CONTROL */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-3 pl-1 pr-3 py-1 rounded-full border transition-all duration-300 group overflow-hidden ${
            isOpen
              ? "border-emerald-500/50 bg-zinc-900"
              : "border-transparent hover:border-zinc-800 hover:bg-white/5"
          }`}
        >
          {/* Avatar Glyph */}
          <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-700 group-hover:border-emerald-500/50 transition-colors shadow-inner overflow-hidden relative shrink-0">
            {user ? (
              <Image
                src={avatarUrl}
                alt="Profile"
                width={32}
                height={32}
                className="w-full h-full object-cover"
                unoptimized
              />
            ) : (
              <User className="w-4 h-4 text-zinc-400 group-hover:text-emerald-400 transition-colors" />
            )}
          </div>

          {/* First Name Reveal */}
          {user?.user_metadata?.full_name && (
            <div className="max-w-0 opacity-0 group-hover:max-w-[100px] group-hover:opacity-100 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] whitespace-nowrap overflow-hidden">
              <span className="text-sm text-zinc-300 font-medium pl-1 pr-2">
                {user.user_metadata.full_name.split(" ")[0]}
              </span>
            </div>
          )}

          <ChevronDown
            className={`w-3 h-3 text-zinc-500 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

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
