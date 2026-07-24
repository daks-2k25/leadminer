// Tipos do módulo nativo node:sqlite.
// O @types/node instalado neste projeto ainda não inclui essa API (é recente),
// então declaramos aqui apenas o necessário para o TypeScript reconhecer o módulo.
declare module "node:sqlite" {
  export class StatementSync {
    run(...params: unknown[]): { changes: number; lastInsertRowid: number | bigint };
    get(...params: unknown[]): Record<string, unknown> | undefined;
    all(...params: unknown[]): Record<string, unknown>[];
  }

  export class DatabaseSync {
    constructor(path: string);
    exec(sql: string): void;
    prepare(sql: string): StatementSync;
    close(): void;
  }
}

import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";

// Garante que a pasta "data" exista antes de abrir o banco.
mkdirSync("data", { recursive: true });

// Caminho do arquivo do banco de dados.
const DATABASE_PATH = "data/leads.db";

// Abre a conexão com o banco de dados.
// Se o arquivo "data/leads.db" ainda não existir, o SQLite o cria automaticamente.
export const db = new DatabaseSync(DATABASE_PATH);
