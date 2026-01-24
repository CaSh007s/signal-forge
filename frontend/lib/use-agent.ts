import { useState } from "react";

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

    try {
      const response = await fetch("http://127.0.0.1:8000/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company }),
      });

      if (!response.ok) throw new Error("Failed to start agent");
      if (!response.body) throw new Error("ReadableStream not supported");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Decode the stream chunk
        const chunk = decoder.decode(value);

        // Parse SSE format (data: {...})
        // Chunks might contain multiple lines or be split
        const lines = chunk.split("\n\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const jsonStr = line.replace("data: ", "").trim();
              if (!jsonStr) continue;

              const data: AgentStep = JSON.parse(jsonStr);

              if (data.type === "log") {
                setMessages((prev) => [...prev, data.content]);
              } else if (data.type === "result") {
                setReport((prev) => prev + data.content);
                setReport(data.content);
              }
            } catch (e) {
              console.error("Error parsing stream chunk", e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Agent Error:", error);
      setMessages((prev) => [...prev, `❌ Error: ${error}`]);
    } finally {
      setIsStreaming(false);
    }
  };

  return { messages, report, isStreaming, startResearch };
}
