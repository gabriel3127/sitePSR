import type { Metadata } from "next"
import { Suspense } from "react"
import { getProdutos, getSetores, getCategorias, getSubcategorias } from "@/lib/queries"
import CatalogoClient from "./CatalogoClient"

export const metadata: Metadata = {
  title: "Catálogo de Embalagens | PSR Embalagens Brasília",
  description:
    "Explore o catálogo completo de embalagens para gastronomia, mercados, lavanderias e mais. Entrega grátis no DF e entorno.",
  alternates: {
    canonical: "https://www.psrembalagens.com.br/catalogo",
  },
}

async function CatalogoData() {
  const [produtos, setores, categorias, subcategorias] = await Promise.all([
    getProdutos(),
    getSetores(),
    getCategorias(),
    getSubcategorias(),
  ])

  return (
    <CatalogoClient
      produtos={produtos}
      setores={setores}
      categorias={categorias}
      subcategorias={subcategorias}
    />
  )
}

export default function CatalogoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <CatalogoData />
    </Suspense>
  )
}