import { NextRequest, NextResponse } from 'next/server';
import { Buffer } from 'buffer';
import { gerarPropostaPdf } from '@/lib/pdf';
import { enviarProposta } from '@/lib/email';
import { GERENTES } from '@/lib/schema';

export async function POST(request: NextRequest) {
  try {
    const dados = await request.json();

    // Gera o PDF preenchido
    const pdfBuffer = await gerarPropostaPdf(dados);

    const emailGerente = GERENTES.find((g) => g.nome === dados.gerenteResponsavel)?.email;

    const destinatarios = [dados.emailDestinatario, emailGerente].filter(
      (email): email is string => Boolean(email)
    );

    await enviarProposta(
      destinatarios,
      Buffer.from(pdfBuffer),
      dados.imovel,
      dados.cheque?.corretor
    );

    return NextResponse.json({ sucesso: true });
  } catch (erro) {
    console.error('Erro ao gerar/enviar proposta:', erro);
    return NextResponse.json(
      { sucesso: false, erro: 'Falha ao gerar ou enviar a proposta.' },
      { status: 500 }
    );
  }
}