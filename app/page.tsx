"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  PropostaFormData,
  propostaSchema,
  defaultPropostaValues,
  ESTADO_CIVIL_OPTIONS,
  GERENTE_NOMES,
} from "@/lib/schema";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { EnderecoFields } from "@/components/EnderecoFields";

type EnvioStatus = "idle" | "loading" | "success" | "error";

export default function Home() {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<PropostaFormData>({
    resolver: zodResolver(propostaSchema),
    defaultValues: defaultPropostaValues,
  });

  const [status, setStatus] = useState<EnvioStatus>("idle");
  const [mensagemErro, setMensagemErro] = useState("");

  const [proponenteAlvo, setProponenteAlvo] = useState<"1" | "2">("1");
  const [arquivoDocumento, setArquivoDocumento] = useState<File | null>(null);
  const [lendoDocumento, setLendoDocumento] = useState(false);
  const [erroLeitura, setErroLeitura] = useState("");
  const [avisoConferencia, setAvisoConferencia] = useState(false);

  const handleLerDocumento = async () => {
    if (!arquivoDocumento) {
      setErroLeitura("Selecione uma imagem do documento antes de continuar.");
      return;
    }

    setLendoDocumento(true);
    setErroLeitura("");

    try {
      const formData = new FormData();
      formData.append("imagem", arquivoDocumento);

      const res = await fetch("/api/extrair-documento", {
        method: "POST",
        body: formData,
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok || !body.sucesso) {
        throw new Error(body.erro ?? "Não foi possível ler o documento.");
      }

      const campos = body.campos as {
        nome: string;
        cpf: string;
        dataNascimento: string;
        identidade: string;
      };

      if (proponenteAlvo === "1") {
        if (campos.nome) setValue("proponente1.nome", campos.nome);
        if (campos.cpf) setValue("proponente1.cpf", campos.cpf);
        if (campos.dataNascimento) setValue("proponente1.dataNascimento", campos.dataNascimento);
        if (campos.identidade) setValue("proponente1.identidade", campos.identidade);
      } else {
        if (campos.nome) setValue("proponente2.nome", campos.nome);
        if (campos.cpf) setValue("proponente2.cpf", campos.cpf);
        if (campos.dataNascimento) setValue("proponente2.dataNascimento", campos.dataNascimento);
        if (campos.identidade) setValue("proponente2.identidade", campos.identidade);
      }

      setAvisoConferencia(true);
    } catch (error) {
      setErroLeitura(
        error instanceof Error ? error.message : "Erro inesperado ao ler o documento."
      );
    } finally {
      setLendoDocumento(false);
    }
  };

  const onSubmit = async (data: PropostaFormData) => {
    setStatus("loading");
    setMensagemErro("");

    try {
      const res = await fetch("/api/gerar-proposta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Erro ao gerar a proposta");
      }

      setStatus("success");
      reset(defaultPropostaValues);
    } catch (error) {
      setStatus("error");
      setMensagemErro(error instanceof Error ? error.message : "Erro inesperado");
    }
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <header className="mb-8 flex flex-col items-center gap-3 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Valerão Mendes" className="h-16 w-auto sm:h-20" />
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Proposta de Compra e Venda</h1>
          <p className="text-sm text-slate-500">Valerão Mendes Imobiliária</p>
        </div>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <Card
          title="Preencher automaticamente (opcional)"
          description="Envie uma foto do RG para preencher os dados do proponente automaticamente"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Proponente a preencher</label>
              <select
                value={proponenteAlvo}
                onChange={(e) => setProponenteAlvo(e.target.value as "1" | "2")}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-brand-orange"
              >
                <option value="1">Proponente 1</option>
                <option value="2">Proponente 2</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Foto do documento (RG)</label>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => setArquivoDocumento(e.target.files?.[0] ?? null)}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm file:mr-3 file:rounded file:border-0 file:bg-brand-orange file:px-3 file:py-1 file:text-white"
              />
            </div>
          </div>

          <p className="text-xs text-slate-500">
            Tire a foto em um lugar bem iluminado, com o documento reto e sem reflexos.
          </p>

          <button
            type="button"
            onClick={handleLerDocumento}
            disabled={lendoDocumento}
            className="self-start rounded-md border border-brand-orange px-4 py-2 text-sm font-semibold text-brand-orange transition hover:bg-brand-orange hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {lendoDocumento ? "Lendo documento..." : "Ler documento"}
          </button>

          {erroLeitura && (
            <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
              {erroLeitura}
            </div>
          )}

          {avisoConferencia && (
            <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Confira os dados abaixo antes de enviar — a leitura automática pode conter erros.
            </div>
          )}

        </Card>

        <Card title="Cabeçalho">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input label="Imóvel" registration={register("imovel")} />
            <Input label="Construtora" registration={register("construtora")} />
          </div>
        </Card>

        <Card title="Proponente 1" description="Dados do primeiro proponente">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Input
              label="Nome"
              registration={register("proponente1.nome")}
              error={errors.proponente1?.nome?.message}
            />
            <Input label="Data de Nasc." type="date" registration={register("proponente1.dataNascimento")} />
            <Input label="Natural" registration={register("proponente1.natural")} />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Select
              label="Estado Civil"
              options={ESTADO_CIVIL_OPTIONS}
              registration={register("proponente1.estadoCivil")}
            />
            <Input
              label="CPF"
              registration={register("proponente1.cpf")}
              error={errors.proponente1?.cpf?.message}
            />
            <Input label="Identidade" registration={register("proponente1.identidade")} />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Input label="Celular" registration={register("proponente1.celular")} />
          </div>

          <EnderecoFields
            title="Endereço Residencial"
            prefix="proponente1.enderecoResidencial"
            register={register}
            errors={errors}
          />

          <EnderecoFields
            title="Endereço Comercial"
            prefix="proponente1.enderecoComercial"
            register={register}
            errors={errors}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Input label="Empresa" registration={register("proponente1.empresa")} />
            <Input label="Cargo" registration={register("proponente1.cargo")} />
            <Input label="Profissão" registration={register("proponente1.profissao")} />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input label="Renda Mensal" registration={register("proponente1.rendaMensal")} />
            <Input
              label="E-mail"
              type="email"
              registration={register("proponente1.email")}
              error={errors.proponente1?.email?.message}
            />
          </div>
        </Card>

        <Card title="2º Proponente" description="Preencha apenas se houver um segundo proponente">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Input label="Nome" registration={register("proponente2.nome")} />
            <Input label="Data de Nasc." type="date" registration={register("proponente2.dataNascimento")} />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Input label="CPF" registration={register("proponente2.cpf")} />
            <Input label="Identidade" registration={register("proponente2.identidade")} />
            <Input label="Celular" registration={register("proponente2.celular")} />
          </div>

          <EnderecoFields
            title="Endereço Comercial"
            prefix="proponente2.enderecoComercial"
            register={register}
            errors={errors}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Input label="Empresa" registration={register("proponente2.empresa")} />
            <Input label="Cargo" registration={register("proponente2.cargo")} />
            <Input label="Profissão" registration={register("proponente2.profissao")} />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input label="Renda Mensal" registration={register("proponente2.rendaMensal")} />
            <Input
              label="E-mail"
              type="email"
              registration={register("proponente2.email")}
              error={errors.proponente2?.email?.message}
            />
          </div>
        </Card>

        <Card title="Condições de Pagamento">
          <Textarea
            label="Descreva as condições de pagamento"
            rows={6}
            registration={register("condicoesPagamento")}
          />
        </Card>

        <Card title="Resumo">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Input label="Valor Financiado" registration={register("resumo.valorFinanciado")} />
            <Input label="Valor Total do Imóvel" registration={register("resumo.valorTotalImovel")} />
            <Input label="Banco" registration={register("resumo.banco")} />
          </div>
        </Card>

        <Card title="Corretor Responsável">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Input label="Corretor" registration={register("cheque.corretor")} />
            <Input label="Creci" registration={register("cheque.creci")} />
            <Input label="Gerente" registration={register("cheque.gerente")} />
          </div>
        </Card>

        <Card title="Envio" description="Para onde o PDF da proposta será enviado">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="E-mail do destinatário"
              type="email"
              registration={register("emailDestinatario")}
              error={errors.emailDestinatario?.message}
            />
            <Select
              label="Gerente responsável (opcional)"
              options={GERENTE_NOMES}
              registration={register("gerenteResponsavel")}
              error={errors.gerenteResponsavel?.message}
            />
          </div>
        </Card>

        {status === "success" && (
          <div className="rounded-md border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-800">
            Proposta gerada e enviada por e-mail com sucesso!
          </div>
        )}

        {status === "error" && (
          <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
            {mensagemErro}
          </div>
        )}

        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-md bg-brand-orange px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-orange-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "loading" ? "Gerando proposta..." : "Gerar e enviar proposta"}
        </button>
      </form>
    </main>
  );
}
