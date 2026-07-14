import { UseFormRegisterReturn } from "react-hook-form";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  registration: UseFormRegisterReturn;
  options: readonly string[];
  error?: string;
}

export function Select({ label, registration, options, error, className, ...rest }: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <select
        {...registration}
        {...rest}
        defaultValue=""
        className={`rounded-md border bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-brand-orange ${
          error ? "border-red-500" : "border-slate-300"
        } ${className ?? ""}`}
      >
        <option value="" disabled>
          Selecione
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
