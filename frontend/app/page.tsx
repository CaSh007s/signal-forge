"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BarChart3,
  ShieldCheck,
  Zap,
  Terminal,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { motion, Variants } from "framer-motion";

// Motion Variants
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

export default function LandingPage() {
  const { openAuth } = useAuth();

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-accent/20">
      {/* 1. GLASS NAVBAR */}
      <nav className="sticky top-0 z-50 border-b border-border/40 bg-bg/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-2">
            <div className="h-8 w-8 bg-accent/10 rounded-lg flex items-center justify-center border border-accent/20 group-hover:border-accent/50 transition-colors">
              <Terminal className="text-accent h-4 w-4" />
            </div>
            <span className="font-brand font-bold text-lg tracking-tight transition-all duration-300 group-hover:-translate-y-[1px] group-hover:tracking-wide group-hover:[text-shadow:0_0_12px_rgba(52,211,153,0.3)]">
              SignalForge
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              className="text-text-secondary hover:text-text-primary"
              onClick={() => openAuth("login")}
            >
              Sign In
            </Button>

            <Button
              className="bg-surface-elevated text-text-primary hover:bg-border border border-border shadow-none"
              onClick={() => openAuth("signup")}
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* 2. HERO SECTION */}
        <section className="relative pt-32 pb-20 px-6 overflow-hidden">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="space-y-6"
            >
              <motion.div
                variants={fadeInUp}
                className="inline-flex items-center rounded-full border border-border bg-surface-elevated/50 px-3 py-1 text-sm text-text-secondary backdrop-blur-sm"
              >
                <span className="flex h-2 w-2 rounded-full bg-accent mr-2 animate-pulse"></span>
                v1.0 Public Beta
              </motion.div>

              <motion.h1
                variants={fadeInUp}
                className="font-brand text-5xl md:text-7xl font-bold tracking-tight text-text-primary"
              >
                Quiet Intelligence for <br />
                <span className="text-text-muted">Modern Markets.</span>
              </motion.h1>

              <motion.p
                variants={fadeInUp}
                className="text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed"
              >
                Autonomous financial research agents that read, analyze, and
                synthesize market data in seconds. No noise. Just signal.
              </motion.p>

              <motion.div
                variants={fadeInUp}
                className="pt-4 flex items-center justify-center gap-4"
              >
                {/* CHANGED: Main CTA Trigger */}
                <Button
                  size="lg"
                  className="h-12 px-8 text-base bg-accent text-[#09090b] hover:bg-accent-hover hover:shadow-[0_0_20px_rgba(52,211,153,0.3)] transition-all duration-300"
                  onClick={() => openAuth("signup")}
                >
                  Start Researching
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                {/* View Demo (Can stay as is or trigger login) */}
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 px-8 text-base bg-transparent border-border text-text-secondary hover:text-text-primary"
                  onClick={() => openAuth("login")}
                >
                  View Demo
                </Button>
              </motion.div>
            </motion.div>
          </div>

          {/* Abstract Grid Background */}
          <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        </section>

        {/* 3. BENTO GRID FEATURES */}
        <section className="py-24 px-6 border-t border-border/40 bg-surface/30">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {/* Feature 1 */}
              <div className="md:col-span-2 group relative overflow-hidden rounded-xl border border-border bg-surface p-8 hover:border-accent/30 transition-colors duration-300">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <BarChart3 className="h-32 w-32" />
                </div>
                <div className="relative z-10 space-y-4">
                  <div className="h-10 w-10 rounded-lg bg-surface-elevated flex items-center justify-center border border-border">
                    <Zap className="h-5 w-5 text-accent" />
                  </div>
                  <h3 className="text-xl font-bold font-brand text-text-primary">
                    Real-time Analysis
                  </h3>
                  <p className="text-text-secondary max-w-md">
                    Our agents connect directly to live market feeds, processing
                    news, earnings reports, and sentiment analysis instantly.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="md:col-span-1 group relative overflow-hidden rounded-xl border border-border bg-surface p-8 hover:border-accent/30 transition-colors duration-300">
                <div className="relative z-10 space-y-4">
                  <div className="h-10 w-10 rounded-lg bg-surface-elevated flex items-center justify-center border border-border">
                    <ShieldCheck className="h-5 w-5 text-accent" />
                  </div>
                  <h3 className="text-xl font-bold font-brand text-text-primary">
                    Institutional Grade
                  </h3>
                  <p className="text-text-secondary">
                    Security and data privacy first. Your research strategies
                    remain yours.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="md:col-span-3 group relative overflow-hidden rounded-xl border border-border bg-surface p-8 hover:border-accent/30 transition-colors duration-300">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-1 space-y-4">
                    <div className="h-10 w-10 rounded-lg bg-surface-elevated flex items-center justify-center border border-border">
                      <Terminal className="h-5 w-5 text-accent" />
                    </div>
                    <h3 className="text-xl font-bold font-brand text-text-primary">
                      Developer API
                    </h3>
                    <p className="text-text-secondary">
                      Integrate SignalForge directly into your Python or Node.js
                      workflows. Full JSON output support for automated trading
                      bots.
                    </p>
                    <div className="pt-2">
                      <span className="text-xs font-mono bg-surface-elevated px-2 py-1 rounded text-accent">
                        pip install signalforge
                      </span>
                    </div>
                  </div>
                  {/* Mock Code Block */}
                  <div className="flex-1 w-full bg-[#09090b] rounded-lg border border-border p-4 font-mono text-xs text-text-secondary shadow-2xl opacity-80">
                    <div className="flex gap-1.5 mb-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/20"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500/20"></div>
                    </div>
                    <p>
                      <span className="text-purple-400">from</span> signalforge{" "}
                      <span className="text-purple-400">import</span> Agent
                    </p>
                    <p className="mt-2">
                      agent = Agent(api_key=
                      <span className="text-green-400">&quot;sf_...&quot;</span>
                      )
                    </p>
                    <p>
                      report = agent.analyze(
                      <span className="text-green-400">&quot;AAPL&quot;</span>)
                    </p>
                    <p className="mt-2 text-text-muted">
                      # Output: Bullish divergence detected...
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* 4. FOOTER */}
      <footer className="border-t border-border/40 bg-bg py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-accent/10 rounded flex items-center justify-center border border-accent/20">
              <Terminal className="text-accent h-3 w-3" />
            </div>
            <span className="font-brand font-bold text-sm text-text-primary">
              SignalForge
            </span>
          </div>
          <p className="text-sm text-text-muted">
            © 2026 SignalForge Inc. Built for the modern analyst.
          </p>
        </div>
      </footer>
    </div>
  );
}
