import { NextResponse } from "next/server";
import { executarScraping } from "@/src/scraper/service";

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
  } catch {
    return NextResponse.json(
      { error: "Erro ao executar scraping" },
      { status: 500 }
    );
  }
}
