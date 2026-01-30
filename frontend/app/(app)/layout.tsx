"use client";

import { SidebarProvider, useSidebar } from "@/context/sidebar-context";
import { LatentSidebar } from "@/components/layout/latent-sidebar";
import { AppNavbar } from "@/components/layout/app-navbar";

// Wrapper component to consume the Context
function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isPinned } = useSidebar();

  return (
    <div className="relative min-h-screen bg-[#09090b] text-white selection:bg-emerald-500/30 font-sans overflow-x-hidden">
      {/* 1. AMBIENT BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />
      </div>

      {/* 2. NAVIGATION STRUCTURES */}
      <LatentSidebar />
      <AppNavbar />

      {/* 3. MAIN CONTENT STAGE */}
      {/* We animate padding-left based on Pin state so content pushes over smoothly */}
      <main
        style={{ paddingLeft: isPinned ? "280px" : "0px" }}
        className="relative z-10 min-h-screen pt-24 pb-12 transition-[padding] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12">{children}</div>
      </main>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <LayoutContent>{children}</LayoutContent>
    </SidebarProvider>
  );
}
