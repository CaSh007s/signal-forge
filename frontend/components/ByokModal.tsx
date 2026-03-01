import { useState } from "react";
import { Key, ArrowRight, Loader2, Lock, ShieldAlert } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ByokModalProps {
  isOpen: boolean;
  onSubmit: (key: string) => Promise<void>;
  loading: boolean;
}

export function ByokModal({ isOpen, onSubmit, loading }: ByokModalProps) {
  const [apiKey, setApiKey] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 space-y-6">
          <div className="space-y-2 text-center">
            <div className="h-12 w-12 mx-auto bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20 mb-4">
              <Key className="h-6 w-6 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Bring Your Own Key
            </h2>
            <p className="text-zinc-400 text-sm">
              SignalForge requires a Google Gemini API Key to run the
              intelligence agent. Your key is stored securely using AES-256
              encryption.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="AIzaSy..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="h-12 bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600 focus-visible:ring-emerald-500"
              />
              <div className="flex items-center gap-2 text-xs text-zinc-500 mt-2">
                <Lock className="h-3 w-3" />
                <span>Keys are encrypted at rest and deleted on logout.</span>
              </div>
            </div>

            <Button
              onClick={() => onSubmit(apiKey)}
              disabled={loading || !apiKey.trim()}
              className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Connect Key
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>

          <div className="flex items-start gap-3 p-3 bg-zinc-900/50 rounded-lg border border-zinc-800/50">
            <ShieldAlert className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
            <p className="text-xs text-zinc-400">
              Don&apos;t have a key? Get one for free at{" "}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 hover:underline"
              >
                Google AI Studio
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
