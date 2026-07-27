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
    setStatus("Buscando leads...");

    try {
      const response = await fetch("/api/scraper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ termoBusca, cidade, bairro, categoria }),
      });

      const novosLeads = await response.json();

      if (!response.ok) {
        setStatus(novosLeads.detalhe ?? novosLeads.error ?? "Erro ao executar scraping");
        return;
      }

      setStatus(`${novosLeads.length} leads encontrados.`);
      setLeads(novosLeads);
    } catch (erro) {
      setStatus(erro instanceof Error ? erro.message : "Erro ao executar scraping");
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
      {status && (
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
