"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, Variants } from "framer-motion"; // Fixed: Added Variants type
import { X, Terminal, Check } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; // Fixed: This will work now
import { cn } from "@/lib/utils";
import { login, register } from "@/lib/auth"; // Fixed: This will work now
import { useRouter } from "next/navigation";

// --- ANIMATION VARIANTS (Typed) ---
const overlayVariants: Variants = {
  hidden: { opacity: 0, backdropFilter: "blur(0px)" },
  visible: {
    opacity: 1,
    backdropFilter: "blur(8px)",
    transition: { duration: 0.3 },
  },
  exit: {
    opacity: 0,
    backdropFilter: "blur(0px)",
    transition: { duration: 0.2 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", damping: 25, stiffness: 300 },
  },
  exit: {
    opacity: 0,
    y: 40,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
};

export function AuthModal() {
  const { isOpen, mode, closeAuth, toggleMode } = useAuth();
  const router = useRouter();

  // Form States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [org, setOrg] = useState("");
  const [role, setRole] = useState("Analyst");

  useEffect(() => {
    if (isOpen) {
      setError("");
      setSuccess(false);
    }
  }, [isOpen, mode]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAuth();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [closeAuth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(email, password);
      }

      setSuccess(true);
      setTimeout(() => {
        closeAuth();
        router.push("/dashboard");
      }, 1000);
    } catch (err: unknown) {
      // Fixed: Removed 'any'
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Authentication failed");
      }
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    "Investor",
    "Student / Researcher",
    "Founder",
    "Analyst",
    "Developer",
    "Other",
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-black/55"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={closeAuth}
          />

          <motion.div
            className={cn(
              "relative w-full max-w-md bg-surface/70 border border-border rounded-2xl p-8 shadow-2xl backdrop-blur-xl",
              success &&
                "border-accent ring-1 ring-accent/50 shadow-[0_0_30px_rgba(52,211,153,0.2)] transition-all duration-500",
            )}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <button
              onClick={closeAuth}
              className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-8 text-center space-y-2">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="h-8 w-8 bg-accent/10 rounded-lg flex items-center justify-center border border-accent/20">
                  <Terminal className="text-accent h-4 w-4" />
                </div>
              </div>
              <h2 className="text-2xl font-brand font-bold tracking-tight text-text-primary">
                {mode === "login" ? "SignalForge" : "Create Workspace"}
              </h2>
              <p className="text-sm text-text-secondary">
                {mode === "login"
                  ? "Sign in to continue your research"
                  : "Build intelligent market research reports in seconds."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-text-secondary">
                        Full Name
                      </Label>
                      <Input
                        placeholder="Jane Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-surface/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-text-secondary">
                        Org (Optional)
                      </Label>
                      <Input
                        placeholder="Acme Inc."
                        value={org}
                        onChange={(e) => setOrg(e.target.value)}
                        className="bg-surface/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-text-secondary">
                      Role
                    </Label>
                    <select
                      className="flex h-10 w-full rounded-lg border border-input bg-surface/50 px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent/50 transition-all"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    >
                      {roles.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label className="text-xs font-medium text-text-secondary">
                  Email Address
                </Label>
                <Input
                  type="email"
                  required
                  placeholder={
                    mode === "signup" ? "work@company.com" : "name@example.com"
                  }
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={cn(
                    "bg-surface/50",
                    error && "border-red-400 focus-visible:ring-red-400",
                  )}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-medium text-text-secondary">
                    Password
                  </Label>
                  {mode === "login" && (
                    <span className="text-xs text-accent cursor-pointer hover:underline">
                      Forgot?
                    </span>
                  )}
                </div>
                <Input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={cn(
                    "bg-surface/50",
                    error && "border-red-400 focus-visible:ring-red-400",
                  )}
                />
              </div>

              {error && (
                <div className="text-xs text-red-400 bg-red-400/10 p-2 rounded flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-red-400" />
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading || success}
                className="w-full h-11 bg-accent text-[#09090b] hover:bg-accent-hover hover:shadow-[0_0_15px_rgba(52,211,153,0.3)] transition-all duration-300 font-medium"
              >
                {loading ? (
                  "Processing..."
                ) : success ? (
                  <span className="flex items-center gap-2">
                    <Check className="h-4 w-4" /> Success
                  </span>
                ) : mode === "login" ? (
                  "Sign In"
                ) : (
                  "Create Workspace"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-text-secondary">
              {mode === "login" ? (
                <>
                  Don&apos;t have an account? {/* Fixed Quote */}
                  <button
                    onClick={toggleMode}
                    className="text-text-primary hover:text-accent font-medium transition-colors"
                  >
                    Create one
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    onClick={toggleMode}
                    className="text-text-primary hover:text-accent font-medium transition-colors"
                  >
                    Sign in
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
