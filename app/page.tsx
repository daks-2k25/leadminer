"use client";

import { useEffect, useState } from "react";
import { Lead } from "@/src/models/lead";

export default function Home() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [termoBusca, setTermoBusca] = useState("");
  const [cidade, setCidade] = useState("");
  const [bairro, setBairro] = useState("");
  const [categoria, setCategoria] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [etapaAtual, setEtapaAtual] = useState("");
  const [progresso, setProgresso] = useState(0);

  const carregarLeads = () => {
    fetch("/api/leads")
      .then((res) => res.json())
      .then(setLeads);
  };

  useEffect(() => {
    carregarLeads();
  }, []);

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

  const handlePesquisar = async () => {
    setLoading(true);
    setStatus("");
    setEtapaAtual("Iniciando scraper");
    setProgresso(0);

    try {
      const response = await fetch("/api/scraper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ termoBusca, cidade, bairro, categoria }),
      });

      if (!response.body) {
        throw new Error("Resposta sem corpo de streaming");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const linhas = buffer.split("\n");
        buffer = linhas.pop() ?? "";

        for (const linha of linhas) {
          if (!linha.trim()) continue;

          const evento = JSON.parse(linha);

          if (evento.tipo === "status") {
            setEtapaAtual(evento.etapa);
            setProgresso(evento.progresso);
          } else if (evento.tipo === "resultado") {
            setLeads(evento.leads);
            setStatus(`${evento.leads.length} leads encontrados.`);
            setEtapaAtual("Finalizado");
            setProgresso(100);
          } else if (evento.tipo === "erro") {
            setStatus(evento.detalhe ?? evento.error ?? "Erro ao executar scraping");
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 p-8 bg-zinc-50 dark:bg-black">
      <h1 className="text-2xl font-semibold mb-4 text-black dark:text-zinc-50">
        Leads
      </h1>
      <div className="flex flex-col gap-2 mb-6 sm:flex-row">
        <input
          className="border p-2 rounded text-black dark:text-zinc-50 disabled:opacity-50"
          placeholder="Termo de busca"
          value={termoBusca}
          onChange={(e) => setTermoBusca(e.target.value)}
          disabled={loading}
        />
        <input
          className="border p-2 rounded text-black dark:text-zinc-50 disabled:opacity-50"
          placeholder="Cidade"
          value={cidade}
          onChange={(e) => setCidade(e.target.value)}
          disabled={loading}
        />
        <input
          className="border p-2 rounded text-black dark:text-zinc-50 disabled:opacity-50"
          placeholder="Bairro"
          value={bairro}
          onChange={(e) => setBairro(e.target.value)}
          disabled={loading}
        />
        <input
          className="border p-2 rounded text-black dark:text-zinc-50 disabled:opacity-50"
          placeholder="Categoria"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          disabled={loading}
        />
        <button
          className="border p-2 rounded bg-foreground text-background disabled:opacity-50"
          onClick={handlePesquisar}
          disabled={loading}
        >
          {loading ? "Buscando..." : "Pesquisar"}
        </button>
        <button
          className="border p-2 rounded text-black dark:text-zinc-50 disabled:opacity-50"
          onClick={handleExportar}
          disabled={loading}
        >
          Exportar Excel
        </button>
      </div>
      {loading && (
        <div className="mb-6">
          <p className="mb-2 text-sm text-black dark:text-zinc-50">
            {etapaAtual || "Buscando leads..."}
          </p>
          <div className="w-full h-2 rounded bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
            <div
              className="h-full bg-foreground transition-all"
              style={{ width: `${progresso}%` }}
            />
          </div>
        </div>
      )}
      {!loading && status && (
        <p className="mb-6 text-sm text-black dark:text-zinc-50">{status}</p>
      )}
      <table className="w-full text-left border-collapse text-sm text-black dark:text-zinc-50">
        <thead>
          <tr>
            <th className="border-b p-2">Nome</th>
            <th className="border-b p-2">Telefone</th>
            <th className="border-b p-2">Website</th>
            <th className="border-b p-2">Endereço</th>
            <th className="border-b p-2">Cidade</th>
            <th className="border-b p-2">Categoria</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.urlMaps}>
              <td className="border-b p-2">{lead.nome}</td>
              <td className="border-b p-2">{lead.telefone}</td>
              <td className="border-b p-2">{lead.website}</td>
              <td className="border-b p-2">{lead.endereco}</td>
              <td className="border-b p-2">{lead.cidade}</td>
              <td className="border-b p-2">{lead.categoria}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
