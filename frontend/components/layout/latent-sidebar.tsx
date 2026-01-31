"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, Variants, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Radio, Pin, PinOff } from "lucide-react";
import { useSidebar } from "@/context/sidebar-context";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { name: "Research Agent", icon: Radio, href: "/agent" },
];

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -10, filter: "blur(5px)" },
  visible: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

export function LatentSidebar() {
  const pathname = usePathname();
  const { isPinned, isExpanded, togglePin, setHovered } = useSidebar();

  return (
    <>
      {/* 1. GLASS SEAMS */}
      <AnimatePresence>
        {!isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.2, 0.6, 0.2], scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{
              opacity: { duration: 6, repeat: Infinity, ease: "easeInOut" },
            }}
            className="fixed left-2 top-1/2 -translate-y-1/2 z-40 pointer-events-none flex gap-[3px]"
          >
            <div className="w-[1px] h-14 bg-white/40 shadow-[0_0_30px_rgba(16,185,129,0.6)] rounded-full backdrop-blur-md" />
            <div className="w-[1px] h-14 bg-white/20 shadow-[0_0_20px_rgba(16,185,129,0.3)] rounded-full backdrop-blur-md" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. TRIGGER ZONE */}
      {!isPinned && (
        <div
          onMouseEnter={() => setHovered(true)}
          className="fixed left-0 top-0 w-6 h-full z-50 bg-transparent"
        />
      )}

      {/* 3. THE PANEL */}
      <motion.div
        initial={false}
        animate={{
          width: isExpanded ? 280 : 0,
          backdropFilter: isExpanded ? "blur(24px)" : "blur(0px)",
          backgroundColor: isExpanded ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0)",
          borderRightColor: isExpanded
            ? "rgba(255,255,255,0.08)"
            : "rgba(255,255,255,0)",
        }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        onMouseLeave={() => setHovered(false)}
        className="fixed left-0 top-0 h-full z-50 overflow-hidden flex flex-col border-r border-transparent"
      >
        <div className="w-[280px] h-full flex flex-col p-6 relative">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

          <motion.div
            initial="hidden"
            animate={isExpanded ? "visible" : "hidden"}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1, delayChildren: 0.1 },
              },
            }}
            className="flex-1 flex flex-col space-y-8 pt-20"
          >
            {/* PIN TOGGLE */}
            <motion.div
              variants={itemVariants}
              className="flex justify-end pr-2"
            >
              <button
                onClick={togglePin}
                className="text-zinc-600 hover:text-emerald-400 transition-colors p-2 rounded-full hover:bg-white/5"
              >
                {isPinned ? (
                  <PinOff className="w-4 h-4" />
                ) : (
                  <Pin className="w-4 h-4" />
                )}
              </button>
            </motion.div>

            {/* NAV ITEMS */}
            <div className="space-y-2">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link key={item.name} href={item.href}>
                    <motion.div
                      variants={itemVariants}
                      className={`group flex items-center gap-4 p-3 rounded-xl transition-all duration-300 border border-transparent ${
                        isActive
                          ? "bg-white/5 border-white/5 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                          : "text-zinc-500 hover:text-zinc-200 hover:bg-white/5"
                      }`}
                    >
                      <item.icon
                        className={`w-5 h-5 transition-colors ${isActive ? "text-emerald-500" : "group-hover:text-emerald-400"}`}
                      />
                      <span className="font-medium tracking-wide text-sm">
                        {item.name}
                      </span>
                      {isActive && (
                        <motion.div
                          layoutId="active-pill"
                          className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]"
                        />
                      )}
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </motion.div>

          {/* SYSTEM STATUS */}
          <motion.div
            variants={itemVariants}
            className="mt-auto pt-6 border-t border-white/5"
          >
            <div className="flex items-center gap-3 text-xs text-zinc-600 font-mono">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </div>
              <span>SYSTEM ONLINE</span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}
