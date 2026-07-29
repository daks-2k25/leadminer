import { NextResponse } from "next/server";
import { executarScraping } from "@/src/scraper/service";

export const runtime = "nodejs";
export const maxDuration = 60;

const encoder = new TextEncoder();

function linhaNdjson(evento: Record<string, unknown>) {
  return encoder.encode(JSON.stringify(evento) + "\n");
}

export async function POST(request: Request) {
  const { termoBusca, cidade, bairro, categoria } = await request.json();

  if (!termoBusca) {
    return NextResponse.json({ error: "termoBusca é obrigatório" }, { status: 400 });
  }

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const leads = await executarScraping(
          termoBusca,
          cidade,
          bairro,
          categoria,
          (etapa, progresso) => {
            controller.enqueue(linhaNdjson({ tipo: "status", etapa, progresso }));
          }
        );

        controller.enqueue(linhaNdjson({ tipo: "resultado", leads }));
      } catch (erro) {
        console.error("[API /api/scraper] Erro ao executar scraping:", erro);
        const detalhe = erro instanceof Error ? erro.message : String(erro);
        controller.enqueue(
          linhaNdjson({ tipo: "erro", error: "Erro ao executar scraping", detalhe })
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8" },
  });
}
