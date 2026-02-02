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
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";

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

  const logsEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  useEffect(() => {
    if (reportId) {
      fetchReport(reportId);
    }
  }, [reportId]);

  const fetchReport = async (id: string) => {
    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch(`http://127.0.0.1:8000/api/reports/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setReport({
          title: data.company_name,
          content: data.report_content,
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

    const token = getToken();

    const logInterval = setInterval(() => {
      setLogs((prev) => [
        ...prev,
        "Analyzing market sentiment...",
        "Querying financial data...",
        "Synthesizing report...",
      ]);
    }, 1500);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ query: input }),
      });

      clearInterval(logInterval);

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
    } catch (error) {
      clearInterval(logInterval);
      setLogs((prev) => [...prev, "❌ Error: Connection failed."]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!report) return;
    navigator.clipboard.writeText(report.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = async () => {
    if (!report) return;
    const element = document.getElementById("report-content");
    if (!element) return;

    setDownloading(true);

    try {
      // 1. Capture High-Res Image
      const dataUrl = await toPng(element, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        style: {
          color: "#000000",
          fontFamily: "Georgia, serif",
          padding: "40px",
        },
      });

      // 2. Setup PDF Stats
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgProps = pdf.getImageProperties(dataUrl);
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

      // 3. Page 1 Header
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(18);
      pdf.text("SignalForge Intelligence", 10, 15);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.setTextColor(100);
      pdf.text(
        `Report: ${report.title.toUpperCase()} // ${new Date().toLocaleDateString()}`,
        10,
        22,
      );

      // 4. Add Content
      let heightLeft = imgHeight;
      let position = 30;

      // Add first page content
      pdf.addImage(dataUrl, "PNG", 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight - position; // Subtract usable space on pg 1

      // Add subsequent pages
      while (heightLeft > 0) {
        position -= pdfHeight;
        pdf.addPage();
        pdf.addImage(dataUrl, "PNG", 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(`${report.title}_Analysis.pdf`);
    } catch (error) {
      console.error("PDF Generation Error:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
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

      {/* 3. THE REPORT VIEW */}
      {report && !loading && (
        <div className="animate-slide-up space-y-6">
          {/* STICKY HEADER */}
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

          {/* REPORT CONTENT WRAPPER */}
          {/* We use specific text colors here that work in Dark Mode but get overridden in PDF generation */}
          <div id="report-content" className="bg-bg p-4 rounded-xl">
            {/* STOCK CHART SECTION */}
            {report.chartData && report.chartData.history && (
              <div className="mt-6 mb-8 p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
                <StockChart
                  data={report.chartData.history}
                  currency={report.chartData.currency}
                />
              </div>
            )}

            {/* MARKDOWN CONTENT */}
            <div
              className="prose prose-invert prose-emerald max-w-none 
              prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-zinc-800
              prose-p:text-zinc-300 prose-p:leading-relaxed prose-p:text-lg
              prose-strong:text-white prose-strong:font-semibold
              prose-ul:my-6 prose-li:my-2
              prose-blockquote:border-l-4 prose-blockquote:border-emerald-500 prose-blockquote:bg-zinc-900/50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r
            "
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {report.content}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
