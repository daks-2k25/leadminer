import { NextResponse } from "next/server";
import { executarScraping } from "@/src/scraper/service";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  console.log("[API /api/scraper] Início da API");
  console.time("[API /api/scraper] Duração total da requisição");

  const { termoBusca, cidade, bairro, categoria } = await request.json();

  console.log("[API /api/scraper] Parâmetros recebidos:", {
    termoBusca,
    cidade,
    bairro,
    categoria,
  });

  if (!termoBusca) {
    console.log("[API /api/scraper] termoBusca ausente, retornando 400");
    console.timeEnd("[API /api/scraper] Duração total da requisição");
    return NextResponse.json(
      { error: "termoBusca é obrigatório" },
      { status: 400 }
    );
  }

  try {
    console.log("[API /api/scraper] Antes de executarScraping()");
    console.time("[API /api/scraper] executarScraping()");
    const leads = await executarScraping(termoBusca, cidade, bairro, categoria);
    console.timeEnd("[API /api/scraper] executarScraping()");
    console.log("[API /api/scraper] Depois de executarScraping(). Leads retornados:", leads.length);

    console.timeEnd("[API /api/scraper] Duração total da requisição");
    return NextResponse.json(leads);
  } catch (erro) {
    console.error("[API /api/scraper] Erro ao executar scraping:", erro);

    const detalhe = erro instanceof Error ? erro.message : String(erro);

    console.timeEnd("[API /api/scraper] Duração total da requisição");
    return NextResponse.json(
      { error: "Erro ao executar scraping", detalhe },
      { status: 500 }
    );
  }
}
