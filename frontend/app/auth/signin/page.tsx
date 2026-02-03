"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, RotateCcw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BeamTerminal } from "@/components/auth/beam-terminal";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

// --- TYPES ---
type AuthState = "idle" | "needs_2fa" | "restored" | "success";

// ✅ FIX: Define the shape of the MFA Factor to avoid 'any'
interface MFAFactor {
  id: string;
  status: "verified" | "unverified";
  factor_type: string;
}

export default function SignInPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // State Machine
  const [authStatus, setAuthStatus] = useState<AuthState>("idle");

  // Form Data
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 1. Initial Password Authentication
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert("Authentication Failed: " + error.message);
      setLoading(false);
      return;
    }

    // 2. Check for Account Deletion Flag
    if (data.user?.user_metadata?.scheduled_for_deletion) {
      await supabase.auth.updateUser({
        data: { scheduled_for_deletion: null },
      });
      setAuthStatus("restored");
      finalizeLogin();
      return;
    }

    // 3. Check for 2FA (Level 2)
    const { data: factorsData, error: factorsError } =
      await supabase.auth.mfa.listFactors();

    if (factorsError) {
      console.error("MFA Check Error:", factorsError);
    }

    // ✅ FIX: Strongly typed iterator
    const verifiedFactor = factorsData?.all?.find(
      (f: MFAFactor) => f.status === "verified",
    );

    if (verifiedFactor) {
      // STOP! Show 2FA Screen
      setAuthStatus("needs_2fa");
      setLoading(false);
      return;
    }

    // 4. No 2FA? Proceed to Success
    setAuthStatus("success");
    finalizeLogin();
  };

  const handle2FAVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: factorsData } = await supabase.auth.mfa.listFactors();
    // ✅ FIX: Strongly typed iterator
    const factor = factorsData?.all?.find(
      (f: MFAFactor) => f.status === "verified",
    );

    if (!factor) {
      alert("Error: No 2FA factor found.");
      setLoading(false);
      return;
    }

    // Verify the code
    const { error } = await supabase.auth.mfa.challengeAndVerify({
      factorId: factor.id,
      code: twoFactorCode,
    });

    if (error) {
      alert("Verification Failed: " + error.message);
      setLoading(false);
    } else {
      setAuthStatus("success");
      finalizeLogin();
    }
  };

  const finalizeLogin = () => {
    setTimeout(() => {
      router.push("/dashboard");
    }, 2000);
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  return (
    <AnimatePresence mode="wait">
      {/* STATE 1: STANDARD LOGIN */}
      {authStatus === "idle" && (
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

            {/* GOOGLE & LINKS */}
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
                className="w-full h-12 bg-black/20 border-zinc-800 text-zinc-300 hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2"
              >
                {isGoogleLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    className="w-5 h-5"
                    aria-hidden="true"
                  >
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                )}
                Google Workspace
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
      )}

      {/* STATE 2: 2FA CHALLENGE */}
      {authStatus === "needs_2fa" && (
        <BeamTerminal
          key="2fa-terminal"
          header={
            <>
              <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/50 mb-4">
                <ShieldCheck className="w-6 h-6 text-emerald-500" />
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Security Check
              </h1>
              <p className="text-zinc-400 text-sm mt-2">
                Enter the code from your authenticator app.
              </p>
            </>
          }
        >
          <form onSubmit={handle2FAVerify} className="space-y-6">
            <InputWrapper>
              <Input
                placeholder="000 000"
                className="bg-black/20 border-zinc-800 focus:border-emerald-500/50 text-white h-14 text-center text-2xl font-mono tracking-[0.5em] transition-all"
                required
                maxLength={6}
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                autoFocus
              />
            </InputWrapper>

            <Button
              type="submit"
              disabled={loading || twoFactorCode.length < 6}
              className="w-full h-12 bg-emerald-500 text-black font-bold hover:bg-emerald-400 transition-all"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Verify Identity"
              )}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setAuthStatus("idle")}
                className="text-xs text-zinc-500 hover:text-zinc-300 underline"
              >
                Back to login
              </button>
            </div>
          </form>
        </BeamTerminal>
      )}

      {/* STATE 3: ACCOUNT RESTORED */}
      {authStatus === "restored" && (
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
      )}

      {/* STATE 4: STANDARD SUCCESS */}
      {authStatus === "success" && (
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
