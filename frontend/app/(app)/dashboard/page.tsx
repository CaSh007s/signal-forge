"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Plus, TrendingUp, Clock, ArrowUpRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// --- TYPES ---
interface Report {
  id: number;
  ticker: string;
  company_name: string;
  created_at: string;
  sentiment_score: number; // 0-100
}

// --- MOCK DATA (Until Supabase) ---
const MOCK_REPORTS: Report[] = [
  {
    id: 101,
    ticker: "NVDA",
    company_name: "NVIDIA Corp.",
    created_at: "2024-02-14T10:00:00Z",
    sentiment_score: 85,
  },
  {
    id: 102,
    ticker: "AAPL",
    company_name: "Apple Inc.",
    created_at: "2024-02-12T14:30:00Z",
    sentiment_score: 60,
  },
  {
    id: 103,
    ticker: "TSLA",
    company_name: "Tesla Inc.",
    created_at: "2024-02-10T09:15:00Z",
    sentiment_score: 45,
  },
  {
    id: 104,
    ticker: "PLTR",
    company_name: "Palantir Tech",
    created_at: "2024-02-08T16:45:00Z",
    sentiment_score: 72,
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Authentication & Data Load
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/signin");
      return;
    }

    // Simulate Network Request
    setTimeout(() => {
      setReports(MOCK_REPORTS);
      setLoading(false);
    }, 800);
  }, [router]);

  const filteredReports = reports.filter(
    (r) =>
      r.ticker.toLowerCase().includes(search.toLowerCase()) ||
      r.company_name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      {/* 1. HEADER: Restrained, Calm */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-light text-white tracking-tight"
          >
            Intelligence Archive
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-zinc-500 font-light"
          >
            Private Vault // User: 0x47...2A
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-4"
        >
          {/* SEARCH FIELD */}
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
            <input
              type="text"
              placeholder="Filter ticker..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-zinc-900/50 border border-zinc-800 focus:border-emerald-500/50 rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder:text-zinc-600 outline-none w-48 focus:w-64 transition-all duration-500"
            />
          </div>

          {/* NEW ANALYSIS BUTTON */}
          <Button
            onClick={() => router.push("/agent")}
            className="bg-white text-black hover:bg-emerald-400 hover:text-black border-none rounded-full px-6 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(52,211,153,0.4)]"
          >
            <Plus className="w-4 h-4 mr-2" /> New Analysis
          </Button>
        </motion.div>
      </div>

      {/* 2. THE ARCHIVE GRID */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 bg-zinc-900/30 rounded-2xl animate-pulse border border-white/5"
            />
          ))}
        </div>
      ) : filteredReports.length === 0 ? (
        // EMPTY STATE
        <div className="h-96 flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-3xl bg-zinc-900/10">
          <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4">
            <TrendingUp className="w-6 h-6 text-zinc-600" />
          </div>
          <p className="text-zinc-500 font-light">Your archive is empty.</p>
          <p className="text-zinc-600 text-sm mt-1">
            Your first analysis will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report, i) => (
            <ReportCard key={report.id} report={report} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

// --- SUB-COMPONENT: REPORT CARD ---
function ReportCard({ report, index }: { report: Report; index: number }) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -5, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.5)" }}
      onClick={() => router.push(`/agent?id=${report.id}`)}
      className="group relative h-52 bg-zinc-900/40 backdrop-blur-md border border-white/5 hover:border-emerald-500/30 rounded-2xl p-6 cursor-pointer overflow-hidden transition-colors duration-500"
    >
      {/* Background Gradient on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* CARD CONTENT */}
      <div className="relative z-10 flex flex-col h-full justify-between">
        {/* Top Row */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-2xl font-bold text-white tracking-tight font-brand">
              {report.ticker}
            </h3>
            <p className="text-sm text-zinc-500">{report.company_name}</p>
          </div>
          {/* Sparkline Visual (Fake CSS chart) */}
          <div className="flex items-end gap-1 h-8">
            {[40, 60, 45, 70, 50].map((h, j) => (
              <div
                key={j}
                style={{ height: `${h}%` }}
                className={`w-1 rounded-sm ${report.sentiment_score > 50 ? "bg-emerald-500/40" : "bg-red-500/40"}`}
              />
            ))}
          </div>
        </div>

        {/* Middle: Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
            <Clock className="w-3 h-3" />
            <span>{new Date(report.created_at).toLocaleDateString()}</span>
          </div>
          <div
            className={`text-xs font-mono inline-block px-2 py-1 rounded border ${
              report.sentiment_score > 70
                ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/10"
                : "text-yellow-400 border-yellow-500/20 bg-yellow-500/10"
            }`}
          >
            SENTIMENT: {report.sentiment_score}/100
          </div>
        </div>

        {/* Bottom Action Hint */}
        <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <span className="text-xs text-emerald-400 flex items-center gap-1">
            Open File <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </motion.div>
  );
}
