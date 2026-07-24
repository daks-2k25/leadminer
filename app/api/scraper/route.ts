import { NextResponse } from "next/server";
import { executarScraping } from "@/src/scraper/service";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: Request) {
  const { termoBusca, cidade, bairro, categoria } = await request.json();

  if (!termoBusca) {
    return NextResponse.json(
      { error: "termoBusca é obrigatório" },
      { status: 400 }
    );
  }

  try {
    const leads = await executarScraping(termoBusca, cidade, bairro, categoria);

    return NextResponse.json(leads);
  } catch (erro) {
    console.error("Erro ao executar scraping:", erro);

    const detalhe = erro instanceof Error ? erro.message : String(erro);

    return NextResponse.json(
      { error: "Erro ao executar scraping", detalhe },
      { status: 500 }
    );
  }
}
