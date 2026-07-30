import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import path from "node:path";

const dbPath = path.join(process.cwd(), "data", "leads.db");
mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new DatabaseSync(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nivel TEXT NOT NULL,
    origem TEXT NOT NULL,
    mensagem TEXT NOT NULL,
    contexto TEXT,
    buscaId INTEGER,
    criadoEm TEXT NOT NULL
  )
`);

const registrarLogStmt = db.prepare(`
  INSERT INTO logs (nivel, origem, mensagem, contexto, buscaId, criadoEm)
  VALUES (?, ?, ?, ?, ?, ?)
`);

export type NivelLog = "info" | "warn" | "error";

export function registrarLog(
  nivel: NivelLog,
  origem: string,
  mensagem: string,
  contexto?: Record<string, unknown>,
  buscaId?: number
) {
  registrarLogStmt.run(
    nivel,
    origem,
    mensagem,
    contexto ? JSON.stringify(contexto) : null,
    buscaId ?? null,
    new Date().toISOString()
  );
}
