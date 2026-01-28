"use client";

import { useState, useEffect, useRef } from "react";
import { useAgent } from "@/lib/use-agent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Send, Terminal, FileText, ChevronRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useSearchParams } from "next/navigation";
import { getToken } from "@/lib/auth";

export default function AgentPage() {
  const { messages, report, isStreaming, startResearch } = useAgent();
  const [company, setCompany] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // New: Handle "View Report" from Dashboard
  const searchParams = useSearchParams();
  const reportId = searchParams.get("id");
  const [viewOnlyReport, setViewOnlyReport] = useState<{
    title: string;
    content: string;
  } | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load past report if ID is present
  useEffect(() => {
    if (reportId) {
      const fetchReport = async () => {
        const token = getToken();
        try {
          const res = await fetch(
            `http://127.0.0.1:8000/api/reports/${reportId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          if (res.ok) {
            const data = await res.json();
            setViewOnlyReport({
              title: data.company_name,
              content: data.report_content,
            });
          }
        } catch (e) {
          console.error(e);
        }
      };
      fetchReport();
    }
  }, [reportId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (company.trim()) {
      setViewOnlyReport(null); // Clear view-only mode
      startResearch(company);
    }
  };

  // Determine what to show: Fresh Stream or Past Report
  const displayReport = viewOnlyReport ? viewOnlyReport.content : report;
  const displayTitle = viewOnlyReport
    ? viewOnlyReport.title
    : company || "Research Output";

  return (
    <div className="h-full flex flex-col gap-6 max-w-6xl mx-auto w-full">
      {/* 1. Header / Input Section */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-brand font-bold tracking-tight text-text-primary">
            Market Analyst Agent
          </h1>
          <p className="text-text-secondary">
            Autonomous deep-dive research on any public company.
          </p>
        </div>

        <Card className="bg-surface border-border shadow-sm">
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="flex gap-4">
              <Input
                placeholder="Enter company ticker (e.g. AAPL, TSLA, NVDA)..."
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                disabled={isStreaming}
                className="font-mono text-base h-12"
              />
              <Button
                type="submit"
                disabled={isStreaming}
                className="h-12 px-8 bg-accent text-[#09090b] hover:bg-accent-hover font-medium"
              >
                {isStreaming ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Analyze
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* 2. Main Content Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        {/* LEFT COLUMN: Live Logs (The "Terminal") */}
        <div className="lg:col-span-1 flex flex-col min-h-[400px]">
          <Card className="flex-1 flex flex-col bg-[#09090b] border-border overflow-hidden">
            <CardHeader className="bg-surface-elevated/50 border-b border-border/50 py-3 px-4">
              <div className="flex items-center gap-2 text-text-muted text-xs font-mono uppercase tracking-wider">
                <Terminal className="h-3 w-3" />
                System Logs
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-3">
              {messages.length === 0 ? (
                <div className="text-text-muted/50 italic">
                  System ready. Waiting for input...
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div
                    key={i}
                    className="flex gap-2 animate-in fade-in duration-300"
                  >
                    <span className="text-accent">➜</span>
                    <span className="text-text-secondary">{msg}</span>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: The Report (The "Document") */}
        <div className="lg:col-span-2 flex flex-col min-h-[400px]">
          <Card className="flex-1 flex flex-col bg-surface border-border overflow-hidden">
            <CardHeader className="bg-surface border-b border-border py-4 px-6 flex flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-accent/10">
                  <FileText className="h-4 w-4 text-accent" />
                </div>
                <CardTitle className="text-lg font-brand">
                  {displayTitle}
                </CardTitle>
              </div>
              {isStreaming && (
                <span className="flex items-center gap-2 text-xs text-accent animate-pulse">
                  <span className="h-2 w-2 rounded-full bg-accent"></span>
                  Generating...
                </span>
              )}
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-8 prose prose-zinc dark:prose-invert max-w-none">
              {/* Using the specific REPORT FONT here */}
              <div className="font-report text-text-primary leading-relaxed">
                {displayReport ? (
                  <ReactMarkdown>{displayReport}</ReactMarkdown>
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 text-text-muted">
                    <div className="h-12 w-12 rounded-full bg-surface-elevated flex items-center justify-center mb-4">
                      <ChevronRight className="h-6 w-6 text-text-muted/50" />
                    </div>
                    <p>Report will appear here</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
