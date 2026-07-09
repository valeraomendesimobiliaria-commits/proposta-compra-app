import { PropostaFormData } from "./schema";

type Endereco = {
  bairro: string;
  cidade: string;
  cep: string;
  uf: string;
};

function esc(value: string | null | undefined): string {
  if (!value) return "";
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatDate(value: string | null | undefined): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? "");
  if (!match) return esc(value);
  const [, ano, mes, dia] = match;
  return `${dia}/${mes}/${ano}`;
}

function formatEndereco(end: Endereco): string {
  const cidadeUf = end.cidade && end.uf ? `${end.cidade}/${end.uf}` : end.cidade || end.uf;
  const partes = [end.bairro, cidadeUf, end.cep].filter(Boolean);
  return partes.length ? esc(partes.join(" — ")) : "";
}

function field(label: string, rawValue: string | null | undefined, wide = false): string {
  const value = esc(rawValue);
  return `
    <div class="field${wide ? " field--wide" : ""}">
      <span class="field__label">${esc(label)}</span>
      <span class="field__value">${value || "&nbsp;"}</span>
    </div>`;
}

function fieldHtml(label: string, html: string, wide = false): string {
  return `
    <div class="field${wide ? " field--wide" : ""}">
      <span class="field__label">${esc(label)}</span>
      <span class="field__value">${html || "&nbsp;"}</span>
    </div>`;
}

function section(title: string, contentHtml: string): string {
  return `
    <section class="section">
      <h2 class="section__title">${esc(title)}</h2>
      <div class="section__body">${contentHtml}</div>
    </section>`;
}

export function renderPropostaHtml(data: PropostaFormData, logoDataUri: string): string {
  const condicoesHtml = esc(data.condicoesPagamento).replace(/\n/g, "<br>");

  const cabecalho = `
    <div class="field-row">
      ${field("Imóvel", data.imovel, true)}
      ${field("Construtora", data.construtora, true)}
    </div>`;

  const proponente1 = `
    <div class="field-row">
      ${field("Nome", data.proponente1.nome, true)}
    </div>
    <div class="field-row">
      ${field("Data de Nascimento", formatDate(data.proponente1.dataNascimento))}
      ${field("Natural de", data.proponente1.natural)}
      ${field("Estado Civil", data.proponente1.estadoCivil)}
    </div>
    <div class="field-row">
      ${field("CPF", data.proponente1.cpf)}
      ${field("Identidade", data.proponente1.identidade)}
      ${field("Celular", data.proponente1.celular)}
    </div>
    <div class="field-row">
      ${fieldHtml("Endereço Residencial", formatEndereco(data.proponente1.enderecoResidencial), true)}
    </div>
    <div class="field-row">
      ${fieldHtml("Endereço Comercial", formatEndereco(data.proponente1.enderecoComercial), true)}
    </div>
    <div class="field-row">
      ${field("Empresa", data.proponente1.empresa)}
      ${field("Cargo", data.proponente1.cargo)}
      ${field("Profissão", data.proponente1.profissao)}
    </div>
    <div class="field-row">
      ${field("Renda Mensal", data.proponente1.rendaMensal)}
      ${field("E-mail", data.proponente1.email, true)}
    </div>`;

  const proponente2 = `
    <div class="field-row">
      ${field("Nome", data.proponente2.nome, true)}
    </div>
    <div class="field-row">
      ${field("Data de Nascimento", formatDate(data.proponente2.dataNascimento))}
      ${field("CPF", data.proponente2.cpf)}
      ${field("Identidade", data.proponente2.identidade)}
      ${field("Celular", data.proponente2.celular)}
    </div>
    <div class="field-row">
      ${fieldHtml("Endereço Comercial", formatEndereco(data.proponente2.enderecoComercial), true)}
    </div>
    <div class="field-row">
      ${field("Empresa", data.proponente2.empresa)}
      ${field("Cargo", data.proponente2.cargo)}
      ${field("Profissão", data.proponente2.profissao)}
    </div>
    <div class="field-row">
      ${field("Renda Mensal", data.proponente2.rendaMensal)}
      ${field("E-mail", data.proponente2.email, true)}
    </div>`;

  const condicoes = `
    <div class="field-row">
      <div class="field field--wide field--block">
        <span class="field__label">Descrição</span>
        <span class="field__value field__value--block">${condicoesHtml || "&nbsp;"}</span>
      </div>
    </div>`;

  const resumo = `
    <div class="field-row">
      ${field("Valor Financiado", data.resumo.valorFinanciado)}
      ${field("Valor Total do Imóvel", data.resumo.valorTotalImovel)}
      ${field("Banco", data.resumo.banco)}
    </div>`;

  const cheque = `
    <div class="field-row">
      ${field("Nº do Cheque", data.cheque.numeroCheque)}
      ${field("Banco", data.cheque.banco)}
      ${field("Valor", data.cheque.valor)}
    </div>
    <div class="field-row">
      ${field("Nominal a", data.cheque.nominalA, true)}
    </div>
    <div class="field-row">
      ${field("Para Depósito em", data.cheque.paraDepositoEm, true)}
    </div>
    <div class="field-row">
      ${field("Corretor", data.cheque.corretor)}
      ${field("Creci", data.cheque.creci)}
      ${field("Gerente", data.cheque.gerente)}
    </div>`;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8" />
<style>
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: Arial, Helvetica, sans-serif;
    color: #1f2937;
    font-size: 9.5pt;
  }
  .page {
    padding: 4mm 2mm;
  }
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 2px solid #1c3d5a;
    padding-bottom: 8px;
  }
  .header__logo {
    height: 42px;
  }
  .header__creci {
    font-size: 10pt;
    font-weight: bold;
    color: #1c3d5a;
    letter-spacing: 0.5px;
  }
  .title {
    text-align: center;
    margin: 10px 0 12px;
  }
  .title__text {
    display: inline-block;
    font-size: 16pt;
    font-weight: bold;
    letter-spacing: 1.5px;
    color: #1c3d5a;
    border-bottom: 3px solid #e07b39;
    padding-bottom: 3px;
    text-transform: uppercase;
  }
  .section {
    margin-bottom: 6px;
    break-inside: avoid;
  }
  .section__title {
    background-color: #1c3d5a;
    color: #ffffff;
    font-size: 9pt;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 3px 8px;
    margin: 0 0 4px;
    border-radius: 2px;
  }
  .section__body {
    border: 1px solid #d6dde3;
    border-radius: 3px;
    padding: 4px 8px 0;
  }
  .field-row {
    display: flex;
    gap: 10px;
    margin-bottom: 4px;
  }
  .field {
    flex: 1 1 0;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  .field--wide {
    flex: 2 1 0;
  }
  .field--block {
    flex: 1 1 100%;
  }
  .field__label {
    font-size: 7pt;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    color: #6b7280;
    margin-bottom: 1px;
  }
  .field__value {
    font-size: 9pt;
    color: #111827;
    border-bottom: 1px solid #cbd5e1;
    padding-bottom: 1px;
    min-height: 12px;
    word-break: break-word;
  }
  .field__value--block {
    border-bottom: none;
    line-height: 1.4;
    min-height: 26px;
  }
</style>
</head>
<body>
  <div class="page">
    <div class="header">
      <img class="header__logo" src="${logoDataUri}" alt="Valerão Mendes" />
      <span class="header__creci">CRECI 13.333J</span>
    </div>

    <div class="title">
      <span class="title__text">Proposta de Compra</span>
    </div>

    ${section("Cabeçalho", cabecalho)}
    ${section("Proponente 1", proponente1)}
    ${section("2º Proponente", proponente2)}
    ${section("Condições de Pagamento", condicoes)}
    ${section("Resumo", resumo)}
    ${section("Cheque / Corretor", cheque)}
  </div>
</body>
</html>`;
}
