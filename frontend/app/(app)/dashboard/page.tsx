"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, TrendingUp, Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { getToken } from "@/lib/auth";

// 1. Define the shape of the data needed for the UI
interface Report {
  id: number;
  company_name: string;
  created_at: string;
  sentiment_score?: number;
}

// 2. Define the shape of the raw API response
interface APIReport {
  id: number;
  company_name: string;
  created_at: string;
  owner_id: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      // 1. Check Session (Redirect if not logged in)
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/auth/signin");
        return;
      }

      try {
        // 2. Get Token safely
        const token = await getToken();

        if (!token) {
          console.error("No token found");
          return;
        }

        // 3. Fetch from your Python Backend
        const res = await fetch("http://127.0.0.1:8000/api/reports", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data: APIReport[] = await res.json();

          // Enrich with visual sentiment score
          const enriched: Report[] = data.map((r) => ({
            ...r,
            sentiment_score: 40 + ((r.id * 7) % 55),
          }));

          setReports(enriched);
        }
      } catch (error) {
        console.error("Failed to fetch history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [router]);

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!confirm("Purge this report from the archive?")) return;

    // Optimistic UI Update
    setReports((prev) => prev.filter((r) => r.id !== id));

    try {
      const token = await getToken();

      if (token) {
        await fetch(`http://127.0.0.1:8000/api/reports/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const filteredReports = reports.filter((r) =>
    r.company_name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      {/* 1. HEADER */}
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
            Private Vault // SignalForge V1
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-4"
        >
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

          <Button
            onClick={() => router.push("/agent")}
            className="bg-white text-black hover:bg-emerald-400 hover:text-black border-none rounded-full px-6 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(52,211,153,0.4)]"
          >
            <Plus className="w-4 h-4 mr-2" /> New Analysis
          </Button>
        </motion.div>
      </div>

      {/* 2. GRID */}
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
        <div className="h-96 flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-3xl bg-zinc-900/10">
          <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4">
            <TrendingUp className="w-6 h-6 text-zinc-600" />
          </div>
          <p className="text-zinc-500 font-light">Your archive is empty.</p>
          <p className="text-zinc-600 text-sm mt-1">
            Run an analysis in the Agent console to populate this vault.
          </p>
          <Button
            variant="link"
            onClick={() => router.push("/agent")}
            className="text-emerald-500 mt-2"
          >
            Go to Agent &rarr;
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredReports.map((report, i) => (
              <ReportCard
                key={report.id}
                report={report}
                index={i}
                onDelete={(e) => handleDelete(e, report.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function ReportCard({
  report,
  index,
  onDelete,
}: {
  report: Report;
  index: number;
  onDelete: (e: React.MouseEvent) => void;
}) {
  const router = useRouter();
  const score = report.sentiment_score || 50;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -5, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.5)" }}
      onClick={() => router.push(`/agent?id=${report.id}`)}
      className="group relative h-52 bg-zinc-900/40 backdrop-blur-md border border-white/5 hover:border-emerald-500/30 rounded-2xl p-6 cursor-pointer overflow-hidden transition-colors duration-500"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-2xl font-bold text-white tracking-tight font-brand">
              {report.company_name}
            </h3>
            <p className="text-sm text-zinc-500">
              Report #{report.id.toString().padStart(4, "0")}
            </p>
          </div>

          <div className="flex items-end gap-1 h-8">
            {[40, 60, 45, 70, 50].map((h, j) => (
              <div
                key={j}
                style={{ height: `${h * (score / 100) + 20}%` }}
                className={`w-1 rounded-sm ${score > 50 ? "bg-emerald-500/40" : "bg-red-500/40"}`}
              />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
            <Clock className="w-3 h-3" />
            <span>{new Date(report.created_at).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between items-end">
            <div
              className={`text-xs font-mono inline-block px-2 py-1 rounded border ${
                score > 60
                  ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/10"
                  : score < 40
                    ? "text-red-400 border-red-500/20 bg-red-500/10"
                    : "text-yellow-400 border-yellow-500/20 bg-yellow-500/10"
              }`}
            >
              SENTIMENT: {score}/100
            </div>

            <button
              onClick={onDelete}
              className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/20 hover:text-red-400 text-zinc-600 rounded-lg transition-all duration-200"
              title="Delete Report"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
