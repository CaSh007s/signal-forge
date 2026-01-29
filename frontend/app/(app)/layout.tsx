"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Terminal,
  Settings,
  LogOut,
  Menu,
  X,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { removeToken } from "@/lib/auth";
import { ThemeProvider } from "@/components/theme-provider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    // Fix: Use setTimeout to make the update asynchronous
    // This prevents the "cascading render" warning
    const timer = setTimeout(() => {
      setIsSidebarOpen(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [pathname]);

  const handleLogout = () => {
    removeToken();
    router.push("/"); // Redirects to Landing Page (Public Home)
  };

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Research Agent", href: "/agent", icon: Terminal },
    { name: "Subscription", href: "/subscription", icon: CreditCard },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-bg text-text-primary overflow-hidden font-sans">
      {/* MOBILE TRIGGER */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="bg-surface border-border shadow-md"
        >
          {isSidebarOpen ? (
            <X className="h-4 w-4" />
          ) : (
            <Menu className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* SIDEBAR */}
      <aside
        className={`
        fixed inset-y-0 left-0 z-40 w-64 transform bg-surface-elevated border-r border-border transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <div className="flex flex-col h-full">
          {/* Brand */}
          <div className="h-16 flex items-center px-6 border-b border-border/50">
            <div className="h-8 w-8 bg-accent/10 rounded-lg flex items-center justify-center border border-accent/20 mr-3">
              <Terminal className="text-accent h-4 w-4" />
            </div>
            <span className="font-brand font-bold text-lg tracking-tight">
              SignalForge
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={`
                    flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                    ${
                      isActive
                        ? "bg-accent/10 text-accent border border-accent/20 shadow-[0_0_10px_rgba(52,211,153,0.1)]"
                        : "text-text-secondary hover:text-text-primary hover:bg-surface border border-transparent"
                    }
                  `}
                  >
                    <item.icon
                      className={`mr-3 h-4 w-4 ${isActive ? "text-accent" : "text-text-muted"}`}
                    />
                    {item.name}
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* User / Logout */}
          <div className="p-4 border-t border-border/50">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-500 transition-colors"
            >
              <LogOut className="mr-3 h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto bg-bg p-4 md:p-8 pt-16 md:pt-8 relative">
        <div className="max-w-7xl mx-auto h-full">{children}</div>
      </main>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
