"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ArrowRight,
  Terminal,
  Copy,
  Check,
  Download,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getToken } from "@/lib/auth";
import { StockChart } from "@/components/stock-chart";
import { ByokModal } from "@/components/ByokModal";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";

// --- TYPES ---
interface ChartData {
  symbol: string;
  currency: string;
  history: { date: string; price: number }[];
}

interface ReportState {
  title: string;
  content: string;
  chartData?: ChartData;
}

export default function AgentPage() {
  const searchParams = useSearchParams();
  const reportId = searchParams.get("id");

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [report, setReport] = useState<ReportState | null>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const [showByok, setShowByok] = useState(false);
  const [byokLoading, setByokLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // Check BYOK Status on Mount
  useEffect(() => {
    const checkByokStatus = async () => {
      // If we already know they have a key from local storage, don't check
      if (localStorage.getItem("hasGeminiKey") === "true") return;

      try {
        const token = await getToken();
        if (!token) return;
        const res = await fetch(`${API_URL}/api/user/gemini-key/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (!data.hasKey) {
            setShowByok(true);
          } else {
            localStorage.setItem("hasGeminiKey", "true");
          }
        }
      } catch (err) {
        console.error("BYOK check failed", err);
      }
    };
    checkByokStatus();
  }, [API_URL]);

  // Clear BYOK Key on Window Close
  useEffect(() => {
    const handleUnload = () => {
      // Best effort deletion of the key when the window closes
      getToken().then((token) => {
        if (token) {
          fetch(`${API_URL}/api/user/gemini-key`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
            keepalive: true,
          }).catch(() => {});
        }
      });
      // Always wipe our local cache
      localStorage.removeItem("hasGeminiKey");
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [API_URL]);

  useEffect(() => {
    if (reportId) fetchReport(reportId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportId]);

  const fetchReport = async (id: string) => {
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) return;

      const res = await fetch(`${API_URL}/api/reports/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setReport({
          title: data.company_name,
          content: data.report_content,
          chartData: data.chart_data || undefined,
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const startResearch = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setLogs([
      "Initializing SignalForge Agent...",
      `Targeting: ${input.toUpperCase()}`,
    ]);
    setReport(null);

    const logInterval = setInterval(() => {
      setLogs((prev) => [
        ...prev,
        "Analyzing market sentiment...",
        "Querying financial data...",
        "Synthesizing report...",
      ]);
    }, 1500);

    try {
      const token = await getToken();
      if (!token) throw new Error("Authentication failed");

      const res = await fetch(`${API_URL}/api/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ query: input }),
      });

      clearInterval(logInterval);

      if (res.status === 428) {
        localStorage.removeItem("hasGeminiKey");
        setShowByok(true);
        setLogs((prev) => [
          ...prev,
          "⚠️ Bring Your Own Key (BYOK) Required or Invalid.",
        ]);
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setReport({
          title: data.company_name,
          content: data.report_content,
          chartData: data.chart_data,
        });
      } else {
        setLogs((prev) => [...prev, "❌ Error: Analysis failed."]);
      }
    } catch {
      clearInterval(logInterval);
      setLogs((prev) => [...prev, "❌ Error: Connection failed."]);
    } finally {
      setLoading(false);
    }
  };

  const handleByokSubmit = async (key: string) => {
    setByokLoading(true);
    try {
      const token = await getToken();
      if (!token) return;
      const res = await fetch(`${API_URL}/api/user/gemini-key`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ api_key: key }),
      });
      if (res.ok) {
        localStorage.setItem("hasGeminiKey", "true");
        setShowByok(false);
        // Automatically start research again
        startResearch();
      } else {
        alert("Failed to save key. Please try again.");
      }
    } catch (error) {
      console.error(error);
      alert("Network error saving key.");
    } finally {
      setByokLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!report) return;
    navigator.clipboard.writeText(report.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- PDF GENERATOR ---
  const handleDownloadPDF = async () => {
    if (!report) return;
    const element = document.getElementById("print-content");
    if (!element) return;

    setDownloading(true);

    try {
      await document.fonts.ready;
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const dataUrl = await toPng(element, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });

      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgProps = pdf.getImageProperties(dataUrl);
      const imgHeight = (imgProps.height * pageWidth) / imgProps.width;

      // --- MARGIN SETTINGS ---
      const TOP_MARGIN = 20;
      const BOTTOM_MARGIN = 25;

      // We can only fit less content now because we have margins on both ends
      const USABLE_HEIGHT = pageHeight - TOP_MARGIN - BOTTOM_MARGIN;

      let heightLeft = imgHeight;
      let position = 0;
      let page = 1;

      // --- PAGE 1 ---
      pdf.addImage(
        dataUrl,
        "PNG",
        0,
        position + TOP_MARGIN,
        pageWidth,
        imgHeight,
      );
      addFooter(pdf, page);

      heightLeft -= USABLE_HEIGHT;
      position -= USABLE_HEIGHT; // Move the "camera" down the long image

      // --- SUBSEQUENT PAGES ---
      while (heightLeft > 0) {
        page++;
        pdf.addPage();
        pdf.addImage(
          dataUrl,
          "PNG",
          0,
          position + TOP_MARGIN,
          pageWidth,
          imgHeight,
        );
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, 0, pageWidth, TOP_MARGIN, "F");

        addFooter(pdf, page);

        heightLeft -= USABLE_HEIGHT;
        position -= USABLE_HEIGHT;
      }

      pdf.save(`SignalForge_Brief_${report.title}.pdf`);
    } catch (error) {
      console.error("PDF Error:", error);
      alert("PDF Generation failed.");
    } finally {
      setDownloading(false);
    }
  };

  const addFooter = (pdf: jsPDF, pageNum: number) => {
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 275, 210, 22, "F");

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(107, 114, 128);

    // Draw Divider Line
    pdf.setDrawColor(229, 231, 235); // Light Gray
    pdf.line(15, 280, 195, 280);

    // Text
    pdf.text("SignalForge Intelligence • Confidential Research", 15, 288);
    pdf.text(`Page ${pageNum}`, 195, 288, { align: "right" });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* 1. INPUT AREA */}
      {!report && !loading && (
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-8 text-center animate-fade-in">
          <div className="space-y-4">
            <div className="h-16 w-16 mx-auto bg-zinc-800 rounded-2xl flex items-center justify-center border border-zinc-700 shadow-xl">
              <Terminal className="h-8 w-8 text-emerald-400" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white">
              Market Intelligence Agent
            </h1>
            <p className="text-zinc-400 max-w-lg mx-auto text-lg">
              Enter a stock ticker (e.g., AAPL, TSLA, NVDA). The agent will
              autonomously gather data, analyze sentiment, and generate a
              briefing.
            </p>
          </div>

          <div className="flex w-full max-w-md items-center space-x-2">
            <Input
              placeholder="e.g. AAPL, TSLA..."
              className="h-14 text-lg bg-zinc-900 border-zinc-700 focus-visible:ring-emerald-500/50"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && startResearch()}
            />
            <Button
              size="lg"
              className="h-14 px-8 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold text-lg"
              onClick={startResearch}
            >
              <ArrowRight className="h-6 w-6" />
            </Button>
          </div>
        </div>
      )}

      {/* 2. LOADING STATE */}
      {loading && (
        <div className="max-w-2xl mx-auto mt-20">
          <div className="bg-zinc-950 rounded-lg border border-zinc-800 overflow-hidden shadow-2xl font-mono text-sm">
            <div className="bg-zinc-900 px-4 py-2 border-b border-zinc-800 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50" />
              </div>
              <span className="text-zinc-500 ml-2">agent_process.exe</span>
            </div>
            <div className="p-6 space-y-2 h-64 overflow-y-auto">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-3 text-zinc-300">
                  <span className="text-zinc-600 select-none">{">"}</span>
                  <span
                    className={
                      log.includes("Error")
                        ? "text-red-400"
                        : "text-emerald-400/90"
                    }
                  >
                    {log}
                  </span>
                </div>
              ))}
              <div ref={logsEndRef} />
              <div className="flex gap-3 text-zinc-500 animate-pulse">
                <span>{">"}</span>
                <span className="w-2 h-4 bg-zinc-500 block" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. REPORT VIEW */}
      {report && !loading && (
        <div className="animate-slide-up space-y-6">
          {/* HEADER (Dark Mode) */}
          <div className="sticky top-0 z-10 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 py-4 -mx-4 px-4 md:-mx-8 md:px-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-emerald-500/10 rounded-lg flex items-center justify-center border border-emerald-500/20">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white leading-none">
                  {report.title}
                </h2>
                <p className="text-xs text-zinc-400 font-mono mt-1">
                  GENERATED REPORT
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="bg-zinc-900 border-zinc-700 text-zinc-300 hover:text-white"
                onClick={copyToClipboard}
              >
                {copied ? (
                  <Check className="h-4 w-4 mr-2 text-emerald-500" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-emerald-500 text-black hover:bg-emerald-400 font-medium"
                onClick={handleDownloadPDF}
                disabled={downloading}
              >
                {downloading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Download Report
              </Button>
            </div>
          </div>

          {/*  THE INSTITUTIONAL BRIEF (Stealth Render)*/}
          <div className="overflow-hidden h-0 w-0">
            <div
              id="print-content"
              style={{
                position: "relative",
                width: "794px",
                minHeight: "1123px",
                padding: "40px 60px",
                backgroundColor: "white",
                color: "black",
                fontFamily: "serif",
              }}
            >
              {/* Load Fonts & FORCE GRAPH COLORS */}
              <style
                dangerouslySetInnerHTML={{
                  __html: `
                @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;600&family=IBM+Plex+Serif:wght@400;600&display=swap');
                
                #print-content svg path, 
                #print-content svg line,
                #print-content svg rect {
                  stroke: #374151 !important;
                }
                #print-content svg text {
                  fill: #111827 !important;
                }
              `,
                }}
              />

              {/* HEADER */}
              <div className="mb-8 border-b border-gray-300 pb-6">
                <div className="flex justify-between items-end mb-2">
                  <h1
                    style={{
                      fontFamily: "'IBM Plex Sans', sans-serif",
                      fontSize: "24pt",
                      fontWeight: "600",
                      color: "#111827",
                      lineHeight: "1",
                    }}
                  >
                    {report.title}
                  </h1>
                  <span
                    style={{
                      fontFamily: "'IBM Plex Serif', serif",
                      fontSize: "12pt",
                      color: "#6B7280",
                      fontStyle: "italic",
                    }}
                  >
                    Investment Memorandum
                  </span>
                </div>
                <div className="flex justify-between text-xs font-sans text-gray-500 uppercase tracking-widest">
                  <span>SignalForge Intelligence</span>
                  <span>{new Date().toLocaleDateString()}</span>
                </div>
              </div>

              {/* GRAPH */}
              {report.chartData && report.chartData.history && (
                <div
                  className="w-full border border-gray-200"
                  style={{ height: "300px", marginBottom: "80px" }}
                >
                  <StockChart
                    data={report.chartData.history}
                    currency={report.chartData.currency}
                  />
                </div>
              )}

              {/* BODY CONTENT */}
              <div className="prose max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ ...props }) => (
                      <h1
                        style={{
                          fontFamily: "'IBM Plex Sans', sans-serif",
                          fontSize: "16pt",
                          fontWeight: "600",
                          color: "#111827",
                          marginTop: "24px",
                          marginBottom: "12px",
                          borderBottom: "1px solid #E5E7EB",
                          paddingBottom: "4px",
                        }}
                        {...props}
                      />
                    ),
                    h2: ({ ...props }) => (
                      <h2
                        style={{
                          fontFamily: "'IBM Plex Sans', sans-serif",
                          fontSize: "14pt",
                          fontWeight: "600",
                          color: "#1F2937",
                          marginTop: "20px",
                          marginBottom: "10px",
                        }}
                        {...props}
                      />
                    ),
                    p: ({ ...props }) => (
                      <p
                        style={{
                          fontFamily: "'IBM Plex Serif', serif",
                          fontSize: "11pt",
                          lineHeight: "1.6",
                          color: "#374151",
                          marginBottom: "12px",
                          textAlign: "justify",
                        }}
                        {...props}
                      />
                    ),
                    li: ({ ...props }) => (
                      <li
                        style={{
                          fontFamily: "'IBM Plex Serif', serif",
                          fontSize: "11pt",
                          marginBottom: "4px",
                          color: "#374151",
                        }}
                        {...props}
                      />
                    ),
                    strong: ({ ...props }) => (
                      <strong
                        style={{ color: "#111827", fontWeight: "600" }}
                        {...props}
                      />
                    ),
                  }}
                >
                  {report.content}
                </ReactMarkdown>
              </div>
            </div>
          </div>

          {/* VISIBLE UI (Dark Mode) */}
          <div className="bg-bg p-4 rounded-xl">
            {report.chartData && report.chartData.history && (
              <div className="mt-6 mb-8 p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
                <StockChart
                  data={report.chartData.history}
                  currency={report.chartData.currency}
                />
              </div>
            )}
            <div className="prose prose-invert prose-emerald max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {report.content}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      )}

      <ByokModal
        isOpen={showByok}
        loading={byokLoading}
        onSubmit={handleByokSubmit}
      />
    </div>
  );
}
