import { z } from "zod";

export const ESTADO_CIVIL_OPTIONS = [
  "Solteiro(a)",
  "Casado(a)",
  "Divorciado(a)",
  "Viúvo(a)",
  "União Estável",
] as const;

export const GERENTES = [
  { nome: "Jeferson", email: "jefersonjsg@gmail.com" },
  { nome: "Matheus", email: "matheusfuentes232@gmail.com" },
  { nome: "João", email: "joaosouzabroker@gmail.com" },
] as const;

export const GERENTE_NOMES = GERENTES.map((g) => g.nome) as [string, ...string[]];

const enderecoSchema = z.object({
  bairro: z.string().default(""),
  cidade: z.string().default(""),
  cep: z.string().default(""),
  uf: z.string().max(2, "Use a sigla, ex: SP").default(""),
});

const enderecoDefault = { bairro: "", cidade: "", cep: "", uf: "" };

export const propostaSchema = z.object({
  imovel: z.string().default(""),
  construtora: z.string().default(""),

  proponente1: z.object({
    nome: z.string().min(1, "Nome é obrigatório"),
    dataNascimento: z.string().default(""),
    natural: z.string().default(""),
    estadoCivil: z.string().default(""),
    cpf: z.string().min(11, "CPF inválido").max(14, "CPF inválido"),
    identidade: z.string().default(""),
    celular: z.string().default(""),
    enderecoResidencial: enderecoSchema,
    enderecoComercial: enderecoSchema,
    empresa: z.string().default(""),
    cargo: z.string().default(""),
    profissao: z.string().default(""),
    rendaMensal: z.string().default(""),
    email: z.string().email("E-mail inválido"),
  }),

  proponente2: z.object({
    nome: z.string().default(""),
    dataNascimento: z.string().default(""),
    cpf: z.string().default(""),
    identidade: z.string().default(""),
    celular: z.string().default(""),
    enderecoComercial: enderecoSchema,
    empresa: z.string().default(""),
    cargo: z.string().default(""),
    profissao: z.string().default(""),
    rendaMensal: z.string().default(""),
    email: z.union([z.literal(""), z.string().email("E-mail inválido")]).default(""),
  }),

  condicoesPagamento: z.string().default(""),

  resumo: z.object({
    valorFinanciado: z.string().default(""),
    valorTotalImovel: z.string().default(""),
    banco: z.string().default(""),
  }),

  cheque: z.object({
    numeroCheque: z.string().default(""),
    banco: z.string().default(""),
    valor: z.string().default(""),
    nominalA: z.string().default(""),
    paraDepositoEm: z.string().default(""),
    corretor: z.string().default(""),
    creci: z.string().default(""),
    gerente: z.string().default(""),
  }),

  emailDestinatario: z.string().email("Informe um e-mail de destino válido"),
  gerenteResponsavel: z.union([z.literal(""), z.enum(GERENTE_NOMES)]).default(""),
});

export type PropostaFormData = z.infer<typeof propostaSchema>;

export const defaultPropostaValues: PropostaFormData = {
  imovel: "",
  construtora: "",
  proponente1: {
    nome: "",
    dataNascimento: "",
    natural: "",
    estadoCivil: "",
    cpf: "",
    identidade: "",
    celular: "",
    enderecoResidencial: { ...enderecoDefault },
    enderecoComercial: { ...enderecoDefault },
    empresa: "",
    cargo: "",
    profissao: "",
    rendaMensal: "",
    email: "",
  },
  proponente2: {
    nome: "",
    dataNascimento: "",
    cpf: "",
    identidade: "",
    celular: "",
    enderecoComercial: { ...enderecoDefault },
    empresa: "",
    cargo: "",
    profissao: "",
    rendaMensal: "",
    email: "",
  },
  condicoesPagamento: "",
  resumo: {
    valorFinanciado: "",
    valorTotalImovel: "",
    banco: "",
  },
  cheque: {
    numeroCheque: "",
    banco: "",
    valor: "",
    nominalA: "",
    paraDepositoEm: "",
    corretor: "",
    creci: "",
    gerente: "",
  },
  emailDestinatario: "",
  gerenteResponsavel: "",
};
