import { UseFormRegisterReturn } from "react-hook-form";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  registration: UseFormRegisterReturn;
  error?: string;
}

export function Input({ label, registration, error, className, ...rest }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <input
        {...registration}
        {...rest}
        className={`rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-brand-orange ${
          error ? "border-red-500" : "border-slate-300"
        } ${className ?? ""}`}
      />
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
