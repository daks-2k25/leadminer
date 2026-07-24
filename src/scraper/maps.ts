import { chromium } from "playwright";
import { writeFile } from "fs/promises";

export async function buscarEmpresasMaps(termoBusca: string = "clínicas Curitiba") {
  const browser = await chromium.launch();

  try {
    return await buscarEmpresasMapsComBrowser(browser, termoBusca);
  } catch (erro) {
    await browser.close();
    throw erro;
  }
}

async function buscarEmpresasMapsComBrowser(
  browser: Awaited<ReturnType<typeof chromium.launch>>,
  termoBusca: string
) {
  const page = await browser.newPage();

  await page.route("**/*", (route) => {
    const tipo = route.request().resourceType();

    if (tipo === "image" || tipo === "media" || tipo === "font") {
      return route.abort();
    }

    return route.continue();
  });

  await page.goto("https://maps.google.com");

  await page.waitForTimeout(5000);

  await page.screenshot({ path: "maps-debug.png" });

  const html = await page.content();
  await writeFile("maps-debug.html", html);

  const searchInput = page.locator('input[name="q"]');

  const searchInputCount = await searchInput.count();
  console.log("Campo de busca encontrado:", searchInputCount > 0);

  await searchInput.fill(termoBusca);
  console.log("Texto preenchido com sucesso");

  await page.waitForTimeout(2000);

  await searchInput.press("Enter");
  console.log("Enter pressionado");

  try {
    await page.waitForURL("**/search/**");
  } catch {
    console.log("URL atual:", page.url());
    console.log("Valor atual do input:", await searchInput.inputValue());
  }

  await page.waitForLoadState("load");
  console.log(page.url());

  await page.waitForTimeout(5000);

  await page.screenshot({ path: "maps-results-debug.png" });

  const resultsHtml = await page.content();
  await writeFile("maps-results-debug.html", resultsHtml);

  const linkCount = await page.locator("a").count();
  const buttonCount = await page.locator("button").count();
  const articleCount = await page.locator('[role="article"]').count();
  const mainCount = await page.locator('[role="main"]').count();

  console.log("Quantidade de <a>:", linkCount);
  console.log("Quantidade de <button>:", buttonCount);
  console.log('Quantidade de role="article":', articleCount);
  console.log('Quantidade de role="main":', mainCount);

  const resultsContainer = page.locator('[role="feed"]');

  const empresasMap = new Map<string, { nome: string | null; urlMaps: string | null }>();

  const coletarResultados = async () => {
    const cards = await page.$$eval('[role="article"]', (articles) =>
      articles.map((article) => {
        const link = article.querySelector("a");
        return {
          nome: link?.getAttribute("aria-label") ?? null,
          urlMaps: link?.getAttribute("href") ?? null,
        };
      })
    );

    for (const card of cards) {
      if (card.urlMaps && !empresasMap.has(card.urlMaps)) {
        empresasMap.set(card.urlMaps, card);
      }
    }
  };

  await coletarResultados();

  for (let i = 0; i < 5; i++) {
    await resultsContainer.evaluate((el) => {
      el.scrollTop = el.scrollHeight;
    });

    await page.waitForTimeout(2000);

    await coletarResultados();
  }

  const results = Array.from(empresasMap.values());

  console.log(results);

  return { browser, page, results };
}
