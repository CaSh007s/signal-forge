"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check auth status only on the client side
    const checkAuth = () => {
      if (!isAuthenticated()) {
        router.push("/login");
      } else {
        setIsAuth(true);
      }
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  // Show a loading spinner while checking
  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  // If not authenticated, render nothing
  if (!isAuth) {
    return null;
  }

  // If authenticated, show the page
  return <>{children}</>;
}
