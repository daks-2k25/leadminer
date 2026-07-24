import { readFile, writeFile, mkdir } from "fs/promises";
import { Lead } from "../models/lead";
import { db } from "../database/database";

const LEADS_PATH = "data/leads.json";

export async function carregarLeads(): Promise<Lead[]> {
  try {
    const conteudo = await readFile(LEADS_PATH, "utf-8");
    return JSON.parse(conteudo);
  } catch {
    return [];
  }
}

export async function salvarLeads(leads: Lead[]) {
  await mkdir("data", { recursive: true });
  await writeFile(LEADS_PATH, JSON.stringify(leads, null, 2));
}

export async function adicionarLeads(novosLeads: Lead[]) {
  const leadsExistentes = await carregarLeads();

  const leadsMap = new Map<string, Lead>();

  for (const lead of leadsExistentes) {
    leadsMap.set(lead.urlMaps, lead);
  }

  for (const lead of novosLeads) {
    leadsMap.set(lead.urlMaps, lead);
  }

  await salvarLeads(Array.from(leadsMap.values()));
}

export function inserirLead(lead: Lead) {
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO leads (nome, telefone, website, endereco, cidade, categoria, urlMaps, capturadoEm)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
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

export function listarLeads(): Lead[] {
  const leads = db.prepare("SELECT * FROM leads ORDER BY id DESC").all();
  return leads as unknown as Lead[];
}
