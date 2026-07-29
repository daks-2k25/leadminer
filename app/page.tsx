"use client";

import { useMemo } from "react";
import { useLeads } from "@/hooks/useLeads";
import { useScraperSearch } from "@/hooks/useScraperSearch";
import { useExportLeads } from "@/hooks/useExportLeads";
import { deriveLeadStats } from "@/lib/leadStats";
import { Sidebar } from "@/components/layout/Sidebar";
import { SearchBar } from "@/components/search/SearchBar";
import { StatsStrip } from "@/components/dashboard/StatsStrip";
import { LeadsTable } from "@/components/leads/LeadsTable";
import { LoadingState } from "@/components/feedback/LoadingState";
import { EmptyState } from "@/components/feedback/EmptyState";
import { StatusBanner } from "@/components/feedback/StatusBanner";

export default function Home() {
  const { leads, setLeads } = useLeads();
  const {
    termoBusca,
    setTermoBusca,
    cidade,
    setCidade,
    bairro,
    setBairro,
    categoria,
    setCategoria,
    loading,
    status,
    etapa,
    progresso,
    handlePesquisar,
  } = useScraperSearch(setLeads);
  const { handleExportar } = useExportLeads(leads);

  const stats = useMemo(() => deriveLeadStats(leads), [leads]);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex flex-1 flex-col gap-4 p-5 md:p-6">
        <SearchBar
          termoBusca={termoBusca}
          cidade={cidade}
          bairro={bairro}
          categoria={categoria}
          onTermoBuscaChange={setTermoBusca}
          onCidadeChange={setCidade}
          onBairroChange={setBairro}
          onCategoriaChange={setCategoria}
          onPesquisar={handlePesquisar}
          onExportar={handleExportar}
          loading={loading}
          podeExportar={leads.length > 0}
        />

        <StatusBanner status={status} />

        <StatsStrip stats={stats} />

        {loading ? (
          <LoadingState etapa={etapa} progresso={progresso} />
        ) : leads.length === 0 ? (
          <EmptyState />
        ) : (
          <LeadsTable leads={leads} />
        )}
      </main>
    </div>
  );
}
