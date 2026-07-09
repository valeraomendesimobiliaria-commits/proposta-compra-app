import { FieldErrors, UseFormRegister } from "react-hook-form";
import { PropostaFormData } from "@/lib/schema";
import { Input } from "@/components/ui/Input";

type EnderecoPath =
  | "proponente1.enderecoResidencial"
  | "proponente1.enderecoComercial"
  | "proponente2.enderecoComercial";

interface EnderecoFieldsProps {
  title: string;
  prefix: EnderecoPath;
  register: UseFormRegister<PropostaFormData>;
  errors: FieldErrors<PropostaFormData>;
}

export function EnderecoFields({ title, prefix, register }: EnderecoFieldsProps) {
  return (
    <div>
      <h4 className="mb-2 text-sm font-semibold text-slate-600">{title}</h4>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Input label="Bairro" registration={register(`${prefix}.bairro`)} />
        <Input label="Cidade" registration={register(`${prefix}.cidade`)} />
        <Input label="Cep" registration={register(`${prefix}.cep`)} />
        <Input label="UF" maxLength={2} registration={register(`${prefix}.uf`)} />
      </div>
    </div>
  );
}
