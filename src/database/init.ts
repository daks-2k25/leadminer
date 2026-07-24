// Garante que a tabela "leads" exista no banco de dados.
// Basta importar este arquivo para que a criação seja executada automaticamente.

import { db } from "./database";

const CREATE_LEADS_TABLE = `
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
`;

db.exec(CREATE_LEADS_TABLE);
