import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { Lead } from "../models/lead";

const dbPath = path.join(process.cwd(), "data", "leads.db");
mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new DatabaseSync(dbPath);

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

const inserirStmt = db.prepare(`
  INSERT OR IGNORE INTO leads (nome, telefone, website, endereco, cidade, categoria, urlMaps, capturadoEm)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

export function inserirLead(lead: Lead) {
  inserirStmt.run(
    lead.nome,
    lead.telefone,
    lead.website,
    lead.endereco,
    lead.cidade,
    lead.categoria,
    lead.urlMaps,
    lead.capturadoEm
  );
}

export function adicionarLeads(novosLeads: Lead[]) {
  for (const lead of novosLeads) {
    inserirLead(lead);
  }
}

const listarStmt = db.prepare(`
  SELECT nome, telefone, website, endereco, cidade, categoria, urlMaps, capturadoEm
  FROM leads
  ORDER BY id DESC
`);

export function listarLeads(): Lead[] {
  return listarStmt.all() as unknown as Lead[];
}
