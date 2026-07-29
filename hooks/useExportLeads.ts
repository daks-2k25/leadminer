import { Lead } from "@/src/models/lead";

export function useExportLeads(leads: Lead[]) {
  const handleExportar = async () => {
    const response = await fetch("/api/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(leads),
    });
    const blob = await response.blob();

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leads.xlsx";
    a.click();
    URL.revokeObjectURL(url);
  };

  return { handleExportar };
}
