"use client";

import { useState } from "react";
import { useAgent } from "@/lib/use-agent";
import ReactMarkdown from "react-markdown";
import ProtectedRoute from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { removeToken } from "@/lib/auth";
import { Bot, Search, Terminal, TrendingUp, LogOut } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";

export default function Home() {
  const [company, setCompany] = useState("");
  const { messages, report, isStreaming, startResearch } = useAgent();
  const router = useRouter();

  const handleSearch = () => {
    if (!company) return;
    startResearch(company);
  };

  const handleLogout = () => {
    removeToken();
    router.push("/login");
  };

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans selection:bg-emerald-500/30">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <header className="flex items-center justify-between border-b border-slate-800 pb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-emerald-500/10 rounded-lg flex items-center justify-center border border-emerald-500/20">
                <TrendingUp className="text-emerald-400 h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  SignalForge
                </h1>
                <p className="text-slate-400 text-sm">
                  Autonomous Market Research Agent
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ModeToggle />
              <Badge
                variant="outline"
                className="border-emerald-500/30 text-emerald-400 bg-emerald-500/5"
              >
                v1.0.0
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
            <Badge
              variant="outline"
              className="border-emerald-500/30 text-emerald-400 bg-emerald-500/5"
            >
              v1.0.0 (Gemini 2.5)
            </Badge>
          </header>

          {/* Input Section */}
          <div className="flex gap-4 max-w-2xl">
            <Input
              placeholder="Enter company name (e.g., Apple, Tesla, NVIDIA)..."
              className="bg-slate-900 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button
              onClick={handleSearch}
              disabled={isStreaming}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium min-w-[120px]"
            >
              {isStreaming ? "Analyzing..." : "Launch Agent"}
            </Button>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Col: Live Logs */}
            <div className="lg:col-span-1 space-y-4">
              <Card className="bg-slate-900 border-slate-800 h-[600px] flex flex-col">
                <CardHeader className="pb-3 border-b border-slate-800/50">
                  <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                    <Terminal className="h-4 w-4" />
                    Agent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-0 overflow-hidden">
                  <ScrollArea className="h-full p-4">
                    <div className="space-y-4">
                      {messages.length === 0 && (
                        <div className="text-slate-600 text-sm italic text-center mt-20">
                          Ready to process...
                        </div>
                      )}
                      {messages.map((msg, i) => (
                        <div
                          key={i}
                          className="flex gap-3 text-sm animate-in fade-in slide-in-from-left-2 duration-300"
                        >
                          <Bot className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                          <span className="text-slate-300">{msg}</span>
                        </div>
                      ))}
                      {isStreaming && (
                        <div className="flex gap-3 text-sm">
                          <div className="h-4 w-4 rounded-full border-2 border-emerald-500/30 border-t-emerald-500 animate-spin" />
                          <span className="text-emerald-500/70 animate-pulse">
                            Processing...
                          </span>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Right Col: The Report */}
            <div className="lg:col-span-2">
              <Card className="bg-slate-900 border-slate-800 min-h-[600px] shadow-2xl shadow-black/40">
                <CardHeader className="pb-3 border-b border-slate-800/50">
                  <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    Research Output
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  {report ? (
                    <article className="prose prose-invert prose-emerald max-w-none prose-headings:font-semibold prose-h1:text-3xl prose-h2:text-xl prose-h2:border-b prose-h2:border-slate-800 prose-h2:pb-2 prose-h2:mt-8">
                      <ReactMarkdown>{report}</ReactMarkdown>
                    </article>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-4 opacity-50">
                      <div className="h-16 w-16 rounded-full bg-slate-800/50 flex items-center justify-center">
                        <TrendingUp className="h-8 w-8 text-slate-700" />
                      </div>
                      <p>Enter a company to generate a financial report</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
