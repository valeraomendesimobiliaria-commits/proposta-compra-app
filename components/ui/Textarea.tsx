import { UseFormRegisterReturn } from "react-hook-form";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  registration: UseFormRegisterReturn;
  error?: string;
}

export function Textarea({ label, registration, error, className, ...rest }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <textarea
        {...registration}
        {...rest}
        rows={rest.rows ?? 5}
        className={`rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? "border-red-500" : "border-slate-300"
        } ${className ?? ""}`}
      />
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
