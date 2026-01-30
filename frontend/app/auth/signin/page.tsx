"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BeamTerminal } from "@/components/auth/beam-terminal";
import { motion, AnimatePresence } from "framer-motion";

export default function SignInPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate Auth Delay
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        router.push("/agent");
      }, 1500);
    }, 1500);
  };

  return (
    <AnimatePresence mode="wait">
      {!success ? (
        <BeamTerminal
          key="signin-terminal" // Key ensures React remounts/re-animates on route change
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
                  className="bg-black/20 border-zinc-800 focus:border-emerald-500/50 text-white placeholder:text-zinc-600 h-12 transition-all duration-300"
                  required
                />
              </InputWrapper>
              <InputWrapper>
                <Input
                  type="password"
                  placeholder="Password"
                  className="bg-black/20 border-zinc-800 focus:border-emerald-500/50 text-white placeholder:text-zinc-600 h-12 transition-all duration-300"
                  required
                />
              </InputWrapper>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-zinc-900 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-black hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all duration-300 font-medium tracking-wide"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Authenticate"
              )}
            </Button>

            {/* DIVIDER & OAUTH */}
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
                className="w-full h-12 bg-black/20 border-zinc-800 text-zinc-300 hover:bg-white hover:text-black hover:border-white transition-all duration-300"
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google Workspace
              </Button>
            </div>

            <div className="text-center text-sm">
              <span className="text-zinc-500">No access key? </span>
              <Link
                href="/auth/signup"
                className="text-emerald-500 hover:text-emerald-400 hover:underline underline-offset-4 transition-colors"
              >
                Create one.
              </Link>
            </div>
          </form>
        </BeamTerminal>
      ) : (
        /* SUCCESS STATE */
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

// Input Helper
function InputWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="group relative">
      {children}
      <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-emerald-500 group-focus-within:w-full transition-all duration-500" />
    </div>
  );
}
