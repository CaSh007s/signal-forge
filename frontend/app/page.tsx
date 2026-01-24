import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BarChart3, Globe, Zap, ShieldCheck } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500/30">
      {/* Navigation */}
      <nav className="border-b border-slate-800/60 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-emerald-500/10 rounded-lg flex items-center justify-center border border-emerald-500/20">
              <BarChart3 className="text-emerald-400 h-5 w-5" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white">
              SignalForge
            </span>
          </div>
          <div className="flex gap-4">
            <Link href="/login">
              <Button
                variant="ghost"
                className="text-slate-400 hover:text-white"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/agent">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Launch Agent <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <Badge
            variant="outline"
            className="border-emerald-500/30 text-emerald-400 bg-emerald-500/5 px-4 py-1.5 rounded-full text-sm"
          >
            v1.0 Public Beta • Powered by Gemini 2.5
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white">
            Autonomous Market <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              Research Agent
            </span>
          </h1>

          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            SignalForge is an AI analyst that researches companies, analyzes
            market sentiment, and generates investment-grade reports in seconds.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link href="/agent">
              <Button
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-700 text-white h-12 px-8 text-lg w-full sm:w-auto"
              >
                Start Researching
              </Button>
            </Link>
            <Link
              href="https://github.com/CaSh007s/signal-forge"
              target="_blank"
            >
              <Button
                size="lg"
                variant="outline"
                className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white h-12 px-8 text-lg w-full sm:w-auto"
              >
                View on GitHub
              </Button>
            </Link>
          </div>
        </div>

        {/* Abstract Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-emerald-500/10 blur-[120px] -z-10 rounded-full opacity-50 pointer-events-none" />
      </section>

      {/* Feature Grid (Bento Style) */}
      <section className="py-24 px-6 border-t border-slate-900 bg-slate-950/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              Why SignalForge?
            </h2>
            <p className="text-slate-400">
              Built for speed, accuracy, and depth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl hover:border-emerald-500/30 transition-colors">
              <div className="h-12 w-12 bg-slate-800 rounded-lg flex items-center justify-center mb-6">
                <Globe className="text-emerald-400 h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Live Web Search
              </h3>
              <p className="text-slate-400 leading-relaxed">
                The agent actively crawls the latest news and market data. No
                outdated training data limits.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl hover:border-emerald-500/30 transition-colors">
              <div className="h-12 w-12 bg-slate-800 rounded-lg flex items-center justify-center mb-6">
                <Zap className="text-emerald-400 h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Gemini 2.5 Flash
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Powered by Google&apos;s latest high-throughput model for
                sub-second reasoning and synthesis.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl hover:border-emerald-500/30 transition-colors">
              <div className="h-12 w-12 bg-slate-800 rounded-lg flex items-center justify-center mb-6">
                <ShieldCheck className="text-emerald-400 h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Transparent Logic
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Watch the agent think. View the &quot;Chain of Thought&quot;
                logs as it researches and decides.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-12 border-t border-slate-900 text-center text-slate-500 text-sm">
        <p>© 2026 SignalForge. Built by Kalash Pratap Gaur.</p>
      </footer>
    </div>
  );
}
