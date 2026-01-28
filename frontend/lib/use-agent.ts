import { useState } from "react";
import { saveReport } from "@/lib/api";

export type AgentStep = {
  type: "log" | "result" | "error";
  content: string;
};

export function useAgent() {
  const [messages, setMessages] = useState<string[]>([]);
  const [report, setReport] = useState<string>("");
  const [isStreaming, setIsStreaming] = useState(false);

  const startResearch = async (company: string) => {
    setMessages([]);
    setReport("");
    setIsStreaming(true);
    let fullReport = "";

    try {
      const token = localStorage.getItem("signalforge_token");
      const response = await fetch("http://127.0.0.1:8000/api/agent/research", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ company }),
      });

      if (!response.body) return;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = JSON.parse(line.slice(6));

            if (data.type === "log") {
              setMessages((prev) => [...prev, data.content]);
            } else if (data.type === "chunk") {
              setReport((prev) => prev + data.content);
              fullReport += data.content; // Accumulate for saving
            } else if (data.type === "error") {
              setMessages((prev) => [...prev, `Error: ${data.content}`]);
            }
          }
        }
      }

      // Autosave
      if (fullReport.length > 0) {
        console.log("Agent finished. Saving report...");
        await saveReport(company, fullReport);
        console.log("Report saved to history.");
      }
    } catch (error) {
      console.error("Stream error:", error);
      setMessages((prev) => [
        ...prev,
        "System Error: Failed to connect to agent.",
      ]);
    } finally {
      setIsStreaming(false);
    }
  };

  return { messages, report, isStreaming, startResearch };
}
