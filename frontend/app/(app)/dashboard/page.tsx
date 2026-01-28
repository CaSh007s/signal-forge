"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getToken, removeToken } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  History,
  LogOut,
  TrendingUp,
  Calendar,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// Report Interface
interface Report {
  id: number;
  company_name: string;
  report_content: string;
  created_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

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
          setReports(data);
        } else if (res.status === 401) {
          removeToken();
          router.push("/login");
        }
      } catch (err) {
        console.error("Failed to fetch reports:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      <main className="max-w-5xl mx-auto px-6 py-12 space-y-8">
        {/* Hero / Welcome */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              Research Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage your reports and track market insights.
            </p>
          </div>
          <Link href="/agent">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
            >
              <Plus className="mr-2 h-4 w-4" /> New Analysis
            </Button>
          </Link>
        </div>

        {/* Reports Grid */}
        <div className="grid gap-6">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground pb-2 border-b border-border">
            <History className="h-4 w-4" />
            Recent History
          </div>

          {reports.length === 0 ? (
            // EMPTY STATE
            <Card className="bg-card/50 border-dashed border-border py-16">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                  <SearchIcon className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-medium">No research found</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto">
                    You haven&apos;t generated any reports yet. Start your first
                    analysis to see it here.
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            // LIST STATE
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reports.map((report) => (
                <Link
                  key={report.id}
                  href={`/agent?id=${report.id}`}
                  className="block group"
                >
                  <Card className="h-full bg-card hover:border-primary/50 transition-all hover:shadow-md hover:shadow-primary/5 cursor-pointer group-hover:-translate-y-1">
                    <CardHeader className="pb-3 space-y-0">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl font-bold truncate pr-4">
                          {report.company_name}
                        </CardTitle>
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-4">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {new Date(report.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// Simple Icon for Empty State
function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
