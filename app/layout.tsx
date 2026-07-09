import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Proposta de Compra - Valerão Mendes",
  description: "Geração digital de proposta de compra e venda de imóvel",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-slate-100">{children}</body>
    </html>
  );
}
