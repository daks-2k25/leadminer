import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { SearchHistory } from "../models/searchHistory";
import { Lead } from "../models/lead";

const dbPath = path.join(process.cwd(), "data", "leads.db");
mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new DatabaseSync(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS search_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    termoBusca TEXT NOT NULL,
    cidade TEXT,
    bairro TEXT,
    categoria TEXT,
    quantidadeLeads INTEGER NOT NULL,
    criadoEm TEXT NOT NULL
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS search_history_leads (
    search_history_id INTEGER NOT NULL,
    lead_id INTEGER NOT NULL,
    PRIMARY KEY (search_history_id, lead_id)
  )
`);

// Garante a existência da tabela "leads" (definida em storage/leads.ts) para
// o JOIN abaixo funcionar mesmo se este módulo carregar antes daquele.
db.exec(`
  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT,
    telefone TEXT,
    website TEXT,
    endereco TEXT,
    cidade TEXT,
    categoria TEXT,
    urlMaps TEXT UNIQUE,
    capturadoEm TEXT
  )
`);

const registrarStmt = db.prepare(`
  INSERT INTO search_history (termoBusca, cidade, bairro, categoria, quantidadeLeads, criadoEm)
  VALUES (?, ?, ?, ?, ?, ?)
`);

export function registrarBuscaHistorico(busca: SearchHistory): SearchHistory {
  const criadoEm = busca.criadoEm ?? new Date().toISOString();

  const resultado = registrarStmt.run(
    busca.termoBusca,
    busca.cidade,
    busca.bairro,
    busca.categoria,
    busca.quantidadeLeads,
    criadoEm
  );

  return {
    id: Number(resultado.lastInsertRowid),
    termoBusca: busca.termoBusca,
    cidade: busca.cidade,
    bairro: busca.bairro,
    categoria: busca.categoria,
    quantidadeLeads: busca.quantidadeLeads,
    criadoEm,
  };
}

const listarStmt = db.prepare(`
  SELECT id, termoBusca, cidade, bairro, categoria, quantidadeLeads, criadoEm
  FROM search_history
  ORDER BY id DESC
`);

export function listarHistoricoBuscas(): SearchHistory[] {
  return listarStmt.all() as unknown as SearchHistory[];
}

const removerStmt = db.prepare(`
  DELETE FROM search_history WHERE id = ?
`);

const removerVinculosStmt = db.prepare(`
  DELETE FROM search_history_leads WHERE search_history_id = ?
`);

export function removerHistoricoBusca(id: number) {
  removerVinculosStmt.run(id);
  removerStmt.run(id);
}

const vincularLeadStmt = db.prepare(`
  INSERT OR IGNORE INTO search_history_leads (search_history_id, lead_id)
  VALUES (?, ?)
`);

export function vincularLeadsABusca(searchHistoryId: number, leadIds: number[]) {
  for (const leadId of leadIds) {
    vincularLeadStmt.run(searchHistoryId, leadId);
  }
}

const listarLeadsDaBuscaStmt = db.prepare(`
  SELECT leads.nome, leads.telefone, leads.website, leads.endereco, leads.cidade, leads.categoria, leads.urlMaps, leads.capturadoEm
  FROM search_history_leads
  JOIN leads ON leads.id = search_history_leads.lead_id
  WHERE search_history_leads.search_history_id = ?
  ORDER BY leads.id DESC
`);

export function listarLeadsDaBusca(searchHistoryId: number): Lead[] {
  return listarLeadsDaBuscaStmt.all(searchHistoryId) as unknown as Lead[];
}
