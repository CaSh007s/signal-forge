"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { removeToken } from "@/lib/auth";
import ProtectedRoute from "@/components/protected-route";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  LayoutDashboard,
  Bot,
  LogOut,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils"; // Ensure you have a utility for merging classes or just use template literals

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    removeToken();
    router.push("/login");
  };

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "New Analysis", href: "/agent", icon: Bot },
  ];

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-background overflow-hidden">
        {/* SIDEBAR */}
        <aside className="w-64 border-r border-border bg-card/30 flex flex-col hidden md:flex">
          {/* Logo Area */}
          <div className="h-16 flex items-center px-6 border-b border-border/50">
            <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
              <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20">
                <TrendingUp className="text-primary h-5 w-5" />
              </div>
              <span>SignalForge</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-4 space-y-2">
            <div className="text-xs font-semibold text-muted-foreground mb-2 px-2 uppercase tracking-wider">
              Menu
            </div>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group cursor-pointer",
                      isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4",
                        isActive
                          ? "text-primary"
                          : "text-slate-500 group-hover:text-foreground",
                      )}
                    />
                    <span>{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-border/50 space-y-4">
            <div className="flex items-center justify-between px-2">
              <span className="text-sm font-medium text-muted-foreground">
                Theme
              </span>
              <ModeToggle />
            </div>

            <Button
              variant="outline"
              className="w-full justify-start text-muted-foreground hover:text-red-400 hover:border-red-900/30 hover:bg-red-950/10"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 flex flex-col h-full overflow-hidden relative">
          {/* Mobile Header (Visible only on small screens) */}
          <div className="md:hidden h-14 border-b border-border flex items-center justify-between px-4 bg-card">
            <div className="flex items-center gap-2 font-bold">
              <TrendingUp className="text-primary h-5 w-5" />
              <span>SignalForge</span>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>

          {/* Scrollable Page Content */}
          <div className="flex-1 overflow-y-auto bg-background p-4 md:p-8">
            <div className="max-w-6xl mx-auto">{children}</div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
