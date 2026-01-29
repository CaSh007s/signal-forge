"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  FileText,
  ArrowRight,
  Calendar,
  Loader2,
  TrendingUp,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getToken } from "@/lib/auth";
import { format } from "date-fns";

// Type definition matches your Backend Report Model
interface Report {
  id: number;
  company_name: string;
  created_at: string;
  // We can add sentiment later if we update backend
}

export default function DashboardPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchReports = async () => {
      const token = getToken();
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch("http://127.0.0.1:8000/api/reports/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          // Sort by newest first
          setReports(
            data.sort(
              (a: Report, b: Report) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime(),
            ),
          );
        }
      } catch (error) {
        console.error("Failed to fetch reports", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [router]);

  // Filter logic
  const filteredReports = reports.filter((r) =>
    r.company_name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-8">
      {/* 1. TOP HEADER & ACTIONS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-brand font-bold tracking-tight text-text-primary">
            Research Hub
          </h1>
          <p className="text-text-secondary">
            Manage your intelligence reports and market insights.
          </p>
        </div>
        <Link href="/agent">
          <Button className="h-11 px-6 bg-accent text-[#09090b] hover:bg-accent-hover font-medium shadow-[0_0_15px_rgba(52,211,153,0.15)] transition-all">
            <Plus className="mr-2 h-4 w-4" />
            New Analysis
          </Button>
        </Link>
      </div>

      {/* 2. TOOLBAR (Search) */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
        <Input
          placeholder="Filter by company ticker..."
          className="pl-10 bg-surface border-border focus-visible:ring-accent/30 h-11"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* 3. THE DATA LIST (Linear Style) */}
      <div className="rounded-xl border border-border bg-surface overflow-hidden min-h-[400px]">
        {loading ? (
          // Loading Skeleton
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
            <p className="text-sm text-text-muted animate-pulse">
              Syncing intelligence...
            </p>
          </div>
        ) : filteredReports.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center h-96 text-center px-4">
            <div className="h-16 w-16 bg-surface-elevated rounded-2xl flex items-center justify-center mb-6 border border-border">
              <TrendingUp className="h-8 w-8 text-text-muted" />
            </div>
            <h3 className="text-lg font-brand font-medium text-text-primary mb-2">
              No reports found
            </h3>
            <p className="text-text-secondary max-w-sm mb-6">
              {search
                ? `No results matching "${search}"`
                : "You haven't generated any market research yet. Start your first analysis."}
            </p>
            {!search && (
              <Link href="/agent">
                <Button
                  variant="outline"
                  className="border-accent text-accent hover:bg-accent/10"
                >
                  Launch Agent
                </Button>
              </Link>
            )}
          </div>
        ) : (
          // The List
          <div className="divide-y divide-border/50">
            {/* Header Row */}
            <div className="grid grid-cols-12 gap-4 p-4 text-xs font-medium text-text-muted uppercase tracking-wider bg-surface-elevated/50">
              <div className="col-span-6 md:col-span-4">Company / Ticker</div>
              <div className="col-span-4 md:col-span-3">Date Generated</div>
              <div className="hidden md:block md:col-span-3">Status</div>
              <div className="col-span-2 text-right">Action</div>
            </div>

            {/* Data Rows */}
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="group grid grid-cols-12 gap-4 p-4 items-center hover:bg-surface-elevated/50 transition-colors duration-200 cursor-pointer"
                onClick={() => router.push(`/agent?id=${report.id}`)}
              >
                {/* Company Name */}
                <div className="col-span-6 md:col-span-4 flex items-center gap-3">
                  <div className="h-8 w-8 rounded bg-accent/10 flex items-center justify-center border border-accent/20 group-hover:border-accent/40 transition-colors">
                    <FileText className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <p className="font-brand font-medium text-text-primary group-hover:text-accent transition-colors">
                      {report.company_name}
                    </p>
                    <p className="text-xs text-text-muted font-mono hidden sm:block">
                      REPORT-ID-{report.id.toString().padStart(4, "0")}
                    </p>
                  </div>
                </div>

                {/* Date */}
                <div className="col-span-4 md:col-span-3 flex items-center gap-2 text-sm text-text-secondary font-mono">
                  <Calendar className="h-3 w-3 text-text-muted" />
                  {format(new Date(report.created_at), "MMM d, yyyy")}
                </div>

                {/* Status Badge (Mocked for now) */}
                <div className="hidden md:block md:col-span-3">
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                    Completed
                  </span>
                </div>

                {/* Action Arrow */}
                <div className="col-span-2 text-right flex justify-end">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-text-muted group-hover:text-text-primary"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
