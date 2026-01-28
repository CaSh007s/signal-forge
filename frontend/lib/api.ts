import { getToken } from "./auth";

const API_URL = "http://127.0.0.1:8000/api";

export async function saveReport(companyName: string, content: string) {
  const token = getToken();
  if (!token) return null;

  try {
    const res = await fetch(`${API_URL}/reports/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        company_name: companyName,
        report_content: content,
      }),
    });

    if (!res.ok) throw new Error("Failed to save report");
    return await res.json();
  } catch (error) {
    console.error("Auto-save failed:", error);
    return null;
  }
}
