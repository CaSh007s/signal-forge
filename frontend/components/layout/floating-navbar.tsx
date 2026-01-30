"use client";

import { Bell, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FloatingNavbar() {
  return (
    <div className="fixed top-0 left-0 right-0 z-40 flex justify-between items-center px-8 py-6 pointer-events-none">
      {/* LEFT: Mark (Visible only when sidebar is closed) */}
      <div className="pointer-events-auto">
        {/* We keep this subtle, the Sidebar handles main branding */}
        <div className="text-zinc-500 font-brand font-bold tracking-tight opacity-50 hover:opacity-100 transition-opacity cursor-default">
          SF // V1
        </div>
      </div>

      {/* RIGHT: Utility Cluster */}
      <div className="pointer-events-auto flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="text-zinc-500 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-full transition-all"
        >
          <Bell className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-zinc-500 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-full transition-all"
        >
          <Settings className="w-4 h-4" />
        </Button>
        <div className="h-8 w-[1px] bg-zinc-800 mx-2" />
        <Button
          variant="ghost"
          className="pl-2 pr-4 gap-3 rounded-full border border-zinc-800 bg-black/40 hover:bg-zinc-900 hover:border-zinc-700 transition-all group"
        >
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/50">
            <User className="w-3 h-3 text-emerald-500" />
          </div>
          <span className="text-sm text-zinc-400 group-hover:text-white">
            Workspace
          </span>
        </Button>
      </div>
    </div>
  );
}
