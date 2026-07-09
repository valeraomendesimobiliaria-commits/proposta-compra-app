import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function enviarProposta(
  destinatarios: string[],
  pdfBuffer: Buffer,
  imovel: string,
  corretor: string
) {
  const corpoHtml = `
    <div style="font-family: sans-serif; color: #333; line-height: 1.6;">
      <p>Olá,</p>
      <p>Segue em anexo a proposta de compra referente ao imóvel 
      <strong>${imovel}</strong>, preparada por <strong>${corretor}</strong>.</p>
      <p>Qualquer dúvida, estamos à disposição.</p>
      <p>Atenciosamente,<br>
      ${corretor}<br>
      Valerão Mendes & Corretores Associados</p>
    </div>
  `;

  await resend.emails.send({
    from: 'propostas@imobiliariavaleraomendes.com.br',
    to: destinatarios,
    subject: `Proposta de compra — ${imovel}`,
    html: corpoHtml,
    attachments: [{ filename: 'proposta.pdf', content: pdfBuffer }],
  });
}