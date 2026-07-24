import { buscarEmpresasMaps } from "./maps";
import { extrairDadosEmpresa } from "./extract";
import { inserirLead } from "../storage/leads";

function limparTexto(texto: string | null) {
  if (!texto) return null;

  return texto
    .replace(/[^\p{L}\p{N}\s()+\-.,:/]/gu, "")
    .trim();
}

let scrapingEmAndamento = false;

export async function executarScraping(
  termoBusca: string,
  cidade: string,
  bairro: string,
  categoria: string
) {
  console.log("[executarScraping] Início de executarScraping()", {
    termoBusca,
    cidade,
    bairro,
    categoria,
  });

  if (scrapingEmAndamento) {
    throw new Error("Já existe um scraping em andamento");
  }

  scrapingEmAndamento = true;
  console.time("[executarScraping] Duração total de executarScraping()");

  try {
    const buscaComCidade = [termoBusca, bairro, cidade].filter(Boolean).join(" ");

    console.log("[executarScraping] Antes de buscarEmpresasMaps()");
    console.time("[executarScraping] buscarEmpresasMaps()");
    const { browser, page, results } = await buscarEmpresasMaps(buscaComCidade);
    console.timeEnd("[executarScraping] buscarEmpresasMaps()");
    console.log("[executarScraping] Depois de buscarEmpresasMaps()");

    console.log("Quantidade de resultados recebidos de buscarEmpresasMaps:", results.length);

    const empresas = [];

    for (const result of results) {
      if (!result.urlMaps) continue;

      try {
        console.log("[executarScraping] Antes de page.goto()", result.urlMaps);
        console.time(`[executarScraping] page.goto() -> ${result.urlMaps}`);
        await page.goto(result.urlMaps);
        console.timeEnd(`[executarScraping] page.goto() -> ${result.urlMaps}`);
        console.log("[executarScraping] Depois de page.goto()", result.urlMaps);

        try {
          await page.waitForSelector("h1", { timeout: 15000 });
        } catch {
          console.log("URL atual:", page.url());
        }

        console.log("[executarScraping] Antes da extração", page.url());
        console.time(`[executarScraping] extração -> ${result.urlMaps}`);
        const companyData = await extrairDadosEmpresa(page);
        console.timeEnd(`[executarScraping] extração -> ${result.urlMaps}`);
        console.log("[executarScraping] Depois da extração", companyData);

        const empresa = {
          nome: limparTexto(companyData.nome),
          telefone: limparTexto(companyData.telefone),
          website: limparTexto(companyData.website),
          endereco: limparTexto(companyData.endereco),
          cidade,
          categoria,
          urlMaps: page.url(),
          capturadoEm: new Date().toISOString(),
        };

        empresas.push(empresa);

        await inserirLead(empresa);
      } catch (erro) {
        console.log("Erro ao processar empresa. URL:", result.urlMaps, "Erro:", erro);
      }
    }

    console.log("[executarScraping] Quantidade de empresas encontradas:", empresas.length);
    console.log("Quantidade de empresas adicionadas ao array empresas:", empresas.length);

    console.log("[executarScraping] Antes de browser.close()");
    console.time("[executarScraping] browser.close()");
    await browser.close();
    console.timeEnd("[executarScraping] browser.close()");
    console.log("[executarScraping] Depois de browser.close()");

    return empresas;
  } finally {
    console.timeEnd("[executarScraping] Duração total de executarScraping()");
    scrapingEmAndamento = false;
  }
}
