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
  if (scrapingEmAndamento) {
    throw new Error("Já existe um scraping em andamento");
  }

  scrapingEmAndamento = true;

  try {
    const buscaComCidade = [termoBusca, bairro, cidade].filter(Boolean).join(" ");

    const { browser, page, results } = await buscarEmpresasMaps(buscaComCidade);

    console.log("Quantidade de resultados recebidos de buscarEmpresasMaps:", results.length);

    const empresas = [];

    for (const result of results) {
      if (!result.urlMaps) continue;

      try {
        await page.goto(result.urlMaps);

        try {
          await page.waitForSelector("h1", { timeout: 15000 });
        } catch {
          console.log("URL atual:", page.url());
        }

        const companyData = await extrairDadosEmpresa(page);

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

    console.log("Quantidade de empresas adicionadas ao array empresas:", empresas.length);

    await browser.close();

    return empresas;
  } finally {
    scrapingEmAndamento = false;
  }
}
