import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "PSR Embalagens — Brasília, DF e Entorno",
  description:
    "Distribuidora de embalagens em Brasília. Entrega grátis no DF e entorno, estoque pronto, sem pedido mínimo. Atendimento rápido via WhatsApp.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  )
}