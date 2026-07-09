import fs from "fs/promises";
import path from "path";
import puppeteer from "puppeteer";
import { PropostaFormData } from "./schema";
import { renderPropostaHtml } from "./pdf-template";

const LOGO_PATH = path.join(process.cwd(), "public", "logo.png");

let cachedLogoDataUri: string | null = null;

async function getLogoDataUri(): Promise<string> {
  if (cachedLogoDataUri) return cachedLogoDataUri;
  const bytes = await fs.readFile(LOGO_PATH);
  cachedLogoDataUri = `data:image/png;base64,${bytes.toString("base64")}`;
  return cachedLogoDataUri;
}

/** Gera o PDF da proposta renderizando o template HTML com Puppeteer. */
export async function gerarPropostaPdf(data: PropostaFormData): Promise<Uint8Array> {
  const logoDataUri = await getLogoDataUri();
  const html = renderPropostaHtml(data, logoDataUri);

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
    return await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "12mm", bottom: "12mm", left: "12mm", right: "12mm" },
    });
  } finally {
    await browser.close();
  }
}
