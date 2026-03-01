"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Copy,
  Check,
  Download,
  TrendingUp,
  Loader2,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
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

export default function ReportClient() {
  const params = useParams();
  const router = useRouter();
  const reportId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<ReportState | null>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

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
      } else {
        console.error("Failed to fetch report");
      }
    } catch (error) {
      console.error(error);
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

  const regenerateReport = async () => {
    if (!report) return;
    setRegenerating(true);

    try {
      const token = await getToken();
      if (!token) return;

      const res = await fetch(`${API_URL}/api/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ query: report.title, force_regenerate: true }),
      });

      if (res.status === 428) {
        alert(
          "API Key invalid or exhausted. Please return to the Agent page to provide a new key.",
        );
        router.push("/agent");
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setReport({
          title: data.company_name,
          content: data.report_content,
          chartData: data.chart_data || undefined,
        });
      } else {
        alert("Failed to regenerate report. Please try again.");
      }
    } catch (error) {
      console.error(error);
      alert("Network error regenerating report.");
    } finally {
      setRegenerating(false);
    }
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

      const TOP_MARGIN = 20;
      const BOTTOM_MARGIN = 25;
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
      position -= USABLE_HEIGHT;

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

    pdf.setDrawColor(229, 231, 235);
    pdf.line(15, 280, 195, 280);

    pdf.text("SignalForge Intelligence • Confidential Research", 15, 288);
    pdf.text(`Page ${pageNum}`, 195, 288, { align: "right" });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
        <p className="text-zinc-400">Loading Intelligence Report...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <p className="text-zinc-400">Report not found.</p>
        <Button onClick={() => router.push("/dashboard")} variant="outline">
          Return to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="animate-slide-up space-y-6">
        {/* BACK NAVIGATION */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/agent")}
          className="text-zinc-400 hover:text-white -ml-2 mb-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Agent
        </Button>

        {/* HEADER */}
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
              onClick={regenerateReport}
              disabled={regenerating || downloading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${regenerating ? "animate-spin text-emerald-500" : ""}`}
              />
              {regenerating ? "Analyzing..." : "Regenerate Data"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-zinc-900 border-zinc-700 text-zinc-300 hover:text-white"
              onClick={copyToClipboard}
              disabled={regenerating}
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

        {/* STEALTH RENDER FOR PDF */}
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

        {/* VISIBLE UI */}
        <div
          className={`bg-bg p-4 rounded-xl transition-opacity duration-300 ${regenerating ? "opacity-50 pointer-events-none" : "opacity-100"}`}
        >
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
    </div>
  );
}
