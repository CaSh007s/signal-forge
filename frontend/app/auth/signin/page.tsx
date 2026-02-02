"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, RotateCcw, AlertTriangle } from "lucide-react"; // Added Icons
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BeamTerminal } from "@/components/auth/beam-terminal";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

export default function SignInPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState<"idle" | "success" | "restored">(
    "idle",
  ); // Track restoration state

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 1. Authenticate
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert("Login Failed: " + error.message);
      setLoading(false);
      return;
    }

    // 2. Check for "Scheduled Deletion" flag
    if (data.user?.user_metadata?.scheduled_for_deletion) {
      // 2a. Cancel Deletion (Restore Account)
      await supabase.auth.updateUser({
        data: { scheduled_for_deletion: null },
      });
      setAuthStatus("restored"); // Trigger Special UI
    } else {
      setAuthStatus("success"); // Standard UI
    }

    setLoading(false);

    // 3. Redirect after delay
    setTimeout(() => {
      router.push("/dashboard");
    }, 2000);
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
  };

  return (
    <AnimatePresence mode="wait">
      {authStatus === "idle" ? (
        <BeamTerminal
          key="signin-terminal"
          header={
            <>
              <div className="inline-flex items-center justify-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-mono tracking-widest text-emerald-500/80 uppercase">
                  SignalForge
                </span>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Access Terminal
              </h1>
              <p className="text-zinc-400 text-sm">
                Authenticate to enter the intelligence layer.
              </p>
            </>
          }
        >
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <InputWrapper>
                <Input
                  type="email"
                  placeholder="Email Address"
                  className="bg-black/20 border-zinc-800 focus:border-emerald-500/50 text-white h-12 transition-all"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </InputWrapper>
              <InputWrapper>
                <Input
                  type="password"
                  placeholder="Password"
                  className="bg-black/20 border-zinc-800 focus:border-emerald-500/50 text-white h-12 transition-all"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </InputWrapper>
            </div>

            <Button
              type="submit"
              disabled={loading || isGoogleLoading}
              className="w-full h-12 bg-zinc-900 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-black transition-all font-medium tracking-wide"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Authenticate"
              )}
            </Button>

            {/* GOOGLE & LINKS (Keeping your existing UI) */}
            <div className="pt-2 space-y-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-zinc-800" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#09090b] px-2 text-zinc-600">
                    Or continue with
                  </span>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleLogin}
                disabled={loading || isGoogleLoading}
                className="w-full h-12 bg-black/20 border-zinc-800 text-zinc-300 hover:bg-white hover:text-black transition-all"
              >
                {isGoogleLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  "Google Workspace"
                )}
              </Button>
            </div>
            <div className="text-center text-sm">
              <span className="text-zinc-500">No access key? </span>
              <Link
                href="/auth/signup"
                className="text-emerald-500 hover:underline"
              >
                Create one.
              </Link>
            </div>
          </form>
        </BeamTerminal>
      ) : authStatus === "restored" ? (
        /* ✅ RESTORATION POP-UP UI */
        <motion.div
          key="restored"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="text-center space-y-6 max-w-sm mx-auto p-8 bg-zinc-900/50 border border-amber-500/30 rounded-2xl backdrop-blur-xl"
        >
          <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto border border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
            <RotateCcw className="w-8 h-8 text-amber-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Account Restored
            </h2>
            <p className="text-zinc-400">
              Deletion sequence cancelled. <br /> Your intelligence archive has
              been recovered.
            </p>
          </div>
          <div className="h-1 w-32 bg-zinc-800 rounded-full mx-auto overflow-hidden">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2, ease: "easeInOut" }}
              className="h-full bg-amber-500"
            />
          </div>
        </motion.div>
      ) : (
        /* STANDARD SUCCESS UI */
        <motion.div
          key="success"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="text-center space-y-4"
        >
          <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-white">Access Granted</h2>
          <p className="text-zinc-400">
            Initializing SignalForge environment...
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function InputWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="group relative">
      {children}
      <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-emerald-500 group-focus-within:w-full transition-all duration-500" />
    </div>
  );
}
