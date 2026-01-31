"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BeamTerminal } from "@/components/auth/beam-terminal";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

export default function SignUpPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const strength =
    password.length > 8 ? "strong" : password.length > 4 ? "medium" : "low";

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
        },
      },
    });

    if (error) {
      alert("Error: " + error.message);
      setLoading(false);
      return;
    }

    // SUCCESS RITUAL
    setLoading(false);
    setSuccess(true);

    // Redirect to Login instead of Dashboard
    setTimeout(() => {
      router.push("/auth/signin");
    }, 2500);
  };

  return (
    <AnimatePresence mode="wait">
      {!success ? (
        <BeamTerminal
          key="signup-terminal"
          header={
            <>
              <div className="mb-8 border-l-2 border-emerald-500 pl-4 text-left">
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  Provision New Workspace
                </h1>
                <p className="text-zinc-400 text-sm">
                  You’re creating a private intelligence environment.
                </p>
              </div>
            </>
          }
        >
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InputWrapper>
                <Input
                  placeholder="Full Name"
                  required
                  className="bg-black/20 border-zinc-800 text-white h-11 focus:border-emerald-500/50 transition-all"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </InputWrapper>
              <InputWrapper>
                <Input
                  placeholder="Role (e.g. Analyst)"
                  required
                  className="bg-black/20 border-zinc-800 text-white h-11 focus:border-emerald-500/50 transition-all"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                />
              </InputWrapper>
            </div>

            <InputWrapper>
              <Input
                type="email"
                placeholder="Work Email"
                required
                className="bg-black/20 border-zinc-800 text-white h-11 focus:border-emerald-500/50 transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </InputWrapper>

            <div className="space-y-2">
              <InputWrapper>
                <Input
                  type="password"
                  placeholder="Master Password"
                  required
                  className="bg-black/20 border-zinc-800 text-white h-11 focus:border-emerald-500/50 transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </InputWrapper>

              <div className="flex gap-1 h-1">
                <div
                  className={`flex-1 rounded-full transition-colors duration-500 ${password.length > 0 ? (strength === "low" ? "bg-red-500" : strength === "medium" ? "bg-yellow-500" : "bg-emerald-500") : "bg-zinc-800"}`}
                />
                <div
                  className={`flex-1 rounded-full transition-colors duration-500 ${password.length > 0 && strength !== "low" ? (strength === "medium" ? "bg-yellow-500" : "bg-emerald-500") : "bg-zinc-800"}`}
                />
                <div
                  className={`flex-1 rounded-full transition-colors duration-500 ${password.length > 0 && strength === "strong" ? "bg-emerald-500" : "bg-zinc-800"}`}
                />
              </div>
              <p className="text-xs text-right text-zinc-500 capitalize">
                {strength} Strength
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 mt-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg hover:shadow-emerald-500/20 transition-all duration-300"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Provisioning...
                </div>
              ) : (
                "Initialize Workspace"
              )}
            </Button>

            <div className="text-center text-sm pt-4">
              <span className="text-zinc-500">Already have a key? </span>
              <Link
                href="/auth/signin"
                className="text-emerald-500 hover:text-emerald-400 hover:underline underline-offset-4 transition-colors"
              >
                Authenticate here.
              </Link>
            </div>
          </form>
        </BeamTerminal>
      ) : (
        /* SUCCESS STATE - Updated Text */
        <motion.div
          key="signup-success"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping" />
            <div className="relative w-full h-full bg-zinc-900 border border-emerald-500/50 rounded-full flex items-center justify-center">
              <ShieldCheck className="w-10 h-10 text-emerald-500" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Workspace Provisioned
            </h2>
            <p className="text-zinc-400 max-w-xs mx-auto">
              Identity confirmed. Redirecting to access terminal...
            </p>
          </div>
          <div className="h-1 w-48 bg-zinc-800 rounded-full mx-auto overflow-hidden">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2, ease: "easeInOut" }}
              className="h-full bg-emerald-500"
            />
          </div>
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
