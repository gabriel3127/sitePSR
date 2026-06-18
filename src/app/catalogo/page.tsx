import type { Metadata } from "next"
import { Suspense } from "react"
import { getProdutos, getSetores, getCategorias, getSubcategorias } from "@/lib/queries"
import CatalogoClient from "./CatalogoClient"

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "Catálogo de Embalagens | PSR Embalagens Brasília",
  description:
    "Explore o catálogo completo de embalagens para gastronomia, mercados, lavanderias e mais. Entrega grátis no DF e entorno.",
  alternates: {
    canonical: "https://www.psrembalagens.com.br/catalogo",
  },
}

export default async function CatalogoPage() {
  const [produtos, setores, categorias, subcategorias] = await Promise.all([
    getProdutos(),
    getSetores(),
    getCategorias(),
    getSubcategorias(),
  ])

  return (
    <>
      {/* Índice server-side para crawlers — não impacta JS nem layout */}
      <nav aria-label="Índice de produtos" className="sr-only">
        {setores.map(s => (
          <a key={s.slug} href={`/catalogo/setor/${s.slug}`}>{s.nome}</a>
        ))}
        {produtos.map(p => (
          <a key={p.id} href={`/catalogo/p/${p.slug ?? p.id}`}>{p.nome}</a>
        ))}
      </nav>

      <Suspense fallback={<div className="min-h-screen" />}>
        <CatalogoClient
          produtos={produtos}
          setores={setores}
          categorias={categorias}
          subcategorias={subcategorias}
        />
      </Suspense>
    </>
  )
}