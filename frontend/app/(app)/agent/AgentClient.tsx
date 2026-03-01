"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Terminal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getToken } from "@/lib/auth";
import { ByokModal } from "@/components/ByokModal";

export default function AgentPage() {
  const router = useRouter();

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

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
      getToken().then((token) => {
        if (token) {
          fetch(`${API_URL}/api/user/gemini-key`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
            keepalive: true,
          }).catch(() => {});
        }
      });
      localStorage.removeItem("hasGeminiKey");
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [API_URL]);

  const startResearch = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setLogs([
      "Initializing SignalForge Agent...",
      `Targeting: ${input.toUpperCase()}`,
    ]);

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
        setLoading(false);
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setLogs((prev) => [
          ...prev,
          "✨ Report Synthesized successfully! Redirecting...",
        ]);
        // Redirect immediately to the new dedicated report page
        setTimeout(() => {
          router.push(`/reports/${data.id}`);
        }, 800);
      } else {
        setLogs((prev) => [...prev, "❌ Error: Analysis failed."]);
        setLoading(false);
      }
    } catch {
      clearInterval(logInterval);
      setLogs((prev) => [...prev, "❌ Error: Connection failed."]);
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

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* 1. INPUT AREA */}
      {!loading && (
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
              disabled={showByok}
            />
            <Button
              size="lg"
              className="h-14 px-8 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold text-lg"
              onClick={startResearch}
              disabled={showByok}
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

      <ByokModal
        isOpen={showByok}
        loading={byokLoading}
        onSubmit={handleByokSubmit}
      />
    </div>
  );
}
