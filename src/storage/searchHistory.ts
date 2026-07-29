import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { SearchHistory } from "../models/searchHistory";

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

export function removerHistoricoBusca(id: number) {
  removerStmt.run(id);
}
