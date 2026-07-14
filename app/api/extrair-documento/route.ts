import { NextRequest, NextResponse } from "next/server";
import os from "os";
import path from "path";
import sharp from "sharp";
import { createWorker } from "tesseract.js";

const TESSDATA_PATH = path.join(process.cwd(), "tessdata");
const LARGURA_MINIMA = 1500;
const LARGURA_RAPIDA = 700;
const ROTACOES = [0, 90, 180, 270] as const;

export const runtime = "nodejs";
export const maxDuration = 60;

interface CamposExtraidos {
  nome: string;
  cpf: string;
  dataNascimento: string;
  identidade: string;
}

async function larguraEfetiva(buffer: Buffer, rotacao: number): Promise<number> {
  const metadata = await sharp(buffer).metadata();
  const largura = metadata.width ?? 0;
  const altura = metadata.height ?? 0;
  // Rotações de 90/270 graus invertem largura e altura.
  return rotacao % 180 !== 0 ? altura : largura;
}

// Pré-processamento completo, usado só na rotação já escolhida como vencedora.
async function preprocessarImagem(buffer: Buffer, rotacao: number): Promise<Buffer> {
  const largura = await larguraEfetiva(buffer, rotacao);

  let pipeline = sharp(buffer).rotate(rotacao);
  if (largura > 0 && largura < LARGURA_MINIMA) {
    pipeline = pipeline.resize({ width: LARGURA_MINIMA });
  }

  return pipeline.grayscale().normalize().sharpen().png().toBuffer();
}

// Versão leve (resolução baixa e fixa), usada só para comparar as 4 rotações rapidamente.
async function preprocessarImagemRapida(buffer: Buffer, rotacao: number): Promise<Buffer> {
  return sharp(buffer)
    .rotate(rotacao)
    .resize({ width: LARGURA_RAPIDA })
    .grayscale()
    .normalize()
    .sharpen()
    .png()
    .toBuffer();
}

function normalizarCpf(match: string): string {
  const digitos = match.replace(/\D/g, "");
  if (digitos.length !== 11) return "";
  return `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6, 9)}-${digitos.slice(9, 11)}`;
}

function extrairCpf(texto: string): string {
  const match = texto.match(/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/);
  return match ? normalizarCpf(match[0]) : "";
}

function extrairDataNascimento(texto: string): string {
  const linhas = texto.split(/\r?\n/);
  const padraoData = /\b(\d{2})\/(\d{2})\/(\d{4})\b/;

  // Prioriza uma data que apareça perto da palavra "nasc" (nascimento).
  const idxNascimento = linhas.findIndex((linha) => /nasc/i.test(linha));
  if (idxNascimento !== -1) {
    for (let i = idxNascimento; i < Math.min(idxNascimento + 2, linhas.length); i++) {
      const match = linhas[i].match(padraoData);
      if (match) return `${match[3]}-${match[2]}-${match[1]}`;
    }
  }

  // Sem contexto explícito, usa a primeira data encontrada no documento.
  const match = texto.match(padraoData);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : "";
}

function extrairIdentidade(texto: string, cpfEncontrado: string): string {
  const palavrasChave = /(registro\s+geral|identidade|\brg\b)/gi;
  const padraoNumero = /\d{1,2}\.?\d{3}\.?\d{3}[-.]?[\dXx]?/;
  const cpfDigitos = cpfEncontrado.replace(/\D/g, "");

  let match: RegExpExecArray | null;
  while ((match = palavrasChave.exec(texto)) !== null) {
    const janela = texto.slice(match.index, match.index + 60);
    const numeroMatch = janela.match(padraoNumero);
    if (numeroMatch) {
      const candidato = numeroMatch[0];
      const soDigitos = candidato.replace(/\D/g, "");
      // Evita confundir o número de RG com o CPF já identificado.
      if (soDigitos.length >= 5 && soDigitos !== cpfDigitos) {
        return candidato;
      }
    }
  }

  return "";
}

const PARTICULAS_NOME = new Set(["DA", "DE", "DO", "DOS", "DAS", "E"]);

function limparPalavrasRuido(linha: string): string {
  return linha
    .split(/\s+/)
    .filter((palavra) => {
      if (!/^[A-ZÀ-ÖØ-Ý]+$/i.test(palavra)) return false;
      if (palavra.length <= 2 && !PARTICULAS_NOME.has(palavra.toUpperCase())) return false;
      return true;
    })
    .join(" ");
}

function extrairNome(texto: string): string {
  const linhas = texto
    .split(/\r?\n/)
    .map((linha) => linha.trim())
    .filter(Boolean);

  // Primeira tentativa: linha rotulada como "nome", pegando o texto após o rótulo
  // ou, se vazio, a linha seguinte. Remove ruído de fundo (tokens curtos e
  // caracteres soltos) antes de validar o candidato.
  const idxNome = linhas.findIndex((linha) => /\bnome\b/i.test(linha));
  if (idxNome !== -1) {
    const apósRótulo = limparPalavrasRuido(
      linhas[idxNome].replace(/.*\bnome\b[:\s]*/i, "").trim()
    );
    if (apósRótulo.length >= 5) {
      return apósRótulo;
    }
    const próximaLinha = linhas[idxNome + 1];
    if (próximaLinha) {
      const próximaLimpa = limparPalavrasRuido(próximaLinha);
      if (próximaLimpa.length >= 5) {
        return próximaLimpa;
      }
    }
  }

  // Alternativa: a maior sequência de palavras em maiúsculas do texto.
  const padraoMaiusculas = /^[A-ZÀ-ÖØ-Ý][A-ZÀ-ÖØ-Ý'-]*(\s+[A-ZÀ-ÖØ-Ý][A-ZÀ-ÖØ-Ý'-]*)+$/;
  let melhorCandidato = "";
  for (const linha of linhas) {
    if (padraoMaiusculas.test(linha) && linha.length > melhorCandidato.length) {
      melhorCandidato = linha;
    }
  }

  return melhorCandidato;
}

function extrairCampos(texto: string): CamposExtraidos {
  const cpf = extrairCpf(texto);
  return {
    nome: extrairNome(texto),
    cpf,
    dataNascimento: extrairDataNascimento(texto),
    identidade: extrairIdentidade(texto, cpf),
  };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const arquivo = formData.get("imagem");

    if (!arquivo || !(arquivo instanceof Blob)) {
      return NextResponse.json(
        { sucesso: false, erro: "Nenhuma imagem enviada." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await arquivo.arrayBuffer());

    const worker = await createWorker("por", undefined, {
      langPath: TESSDATA_PATH,
      cachePath: os.tmpdir(),
    });

    try {
      // Passada rápida (baixa resolução) nas 4 rotações, só para decidir qual
      // orientação tem o melhor "confidence" do Tesseract.
      let melhorRotacao: (typeof ROTACOES)[number] = 0;
      let melhorConfidence = -1;

      for (const rotacao of ROTACOES) {
        const imagemRapida = await preprocessarImagemRapida(buffer, rotacao);
        // `text: true` é necessário para o Tesseract efetivamente rodar o
        // reconhecimento (e calcular o confidence); só os formatos mais
        // pesados (hocr/tsv/blocks) são desligados na passada rápida.
        const { data } = await worker.recognize(
          imagemRapida,
          {},
          { blocks: false, text: true, hocr: false, tsv: false }
        );

        if (data.confidence > melhorConfidence) {
          melhorConfidence = data.confidence;
          melhorRotacao = rotacao;
        }
      }

      // Passada completa (resolução total + pré-processamento já existente)
      // só na rotação vencedora.
      const imagemFinal = await preprocessarImagem(buffer, melhorRotacao);
      const { data } = await worker.recognize(imagemFinal);
      const campos = extrairCampos(data.text);
      return NextResponse.json({ sucesso: true, campos });
    } finally {
      await worker.terminate();
    }
  } catch (erro) {
    console.error("Erro ao extrair documento:", erro);
    return NextResponse.json(
      { sucesso: false, erro: "Falha ao processar o documento." },
      { status: 500 }
    );
  }
}
