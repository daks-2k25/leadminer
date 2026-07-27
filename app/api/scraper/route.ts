import { executarScraping } from "@/src/scraper/service";

export const runtime = "nodejs";
export const maxDuration = 60;

const encoder = new TextEncoder();

function linhaNdjson(evento: Record<string, unknown>) {
  return encoder.encode(JSON.stringify(evento) + "\n");
}

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
    return new Response(
      linhaNdjson({ tipo: "erro", error: "termoBusca é obrigatório" }),
      { status: 400, headers: { "Content-Type": "application/x-ndjson; charset=utf-8" } }
    );
  }

  const stream = new ReadableStream({
    async start(controller) {
      const emitirStatus = (etapa: string, progresso: number) => {
        controller.enqueue(
          linhaNdjson({ tipo: "status", etapa, progresso, ativo: true })
        );
      };

      try {
        console.log("[API /api/scraper] Antes de executarScraping()");
        console.time("[API /api/scraper] executarScraping()");
        const leads = await executarScraping(
          termoBusca,
          cidade,
          bairro,
          categoria,
          emitirStatus
        );
        console.timeEnd("[API /api/scraper] executarScraping()");
        console.log("[API /api/scraper] Depois de executarScraping(). Leads retornados:", leads.length);

        console.time("[perf] geração da resposta");
        controller.enqueue(linhaNdjson({ tipo: "resultado", leads }));
        console.timeEnd("[perf] geração da resposta");
      } catch (erro) {
        console.error("[API /api/scraper] Erro ao executar scraping:", erro);

        const detalhe = erro instanceof Error ? erro.message : String(erro);

        controller.enqueue(
          linhaNdjson({ tipo: "erro", error: "Erro ao executar scraping", detalhe })
        );
      } finally {
        console.timeEnd("[API /api/scraper] Duração total da requisição");
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8" },
  });
}
