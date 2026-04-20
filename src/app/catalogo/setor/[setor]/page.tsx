import type { Metadata } from "next"
import { Suspense } from "react"
import { notFound } from "next/navigation"
import { getProdutos, getSetores, getCategorias, getSubcategorias } from "@/lib/queries"
import CatalogoClient from "../../CatalogoClient"

interface Props {
  params: Promise<{ setor: string }>
}

export async function generateStaticParams() {
  const setores = await getSetores()
  return setores.map(({ slug }) => ({ setor: slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { setor } = await params
  const setores = await getSetores()
  const setorData = setores.find((s) => s.slug === setor)
  if (!setorData) return { title: "Catálogo | PSR Embalagens" }
  return {
    title: `Embalagens para ${setorData.nome} | PSR Embalagens Brasília`,
    description: `Embalagens e descartáveis para ${setorData.nome}. Entrega grátis no DF e entorno.`,
    alternates: {
      canonical: `https://www.psrembalagens.com.br/catalogo/setor/${setor}`,
    },
  }
}

async function CatalogoSetorData({ setor }: { setor: string }) {
  const [produtos, setores, categorias, subcategorias] = await Promise.all([
    getProdutos({ ativo: true }),
    getSetores(),
    getCategorias(),
    getSubcategorias(),
  ])

  const setorExiste = setores.some((s) => s.slug === setor)
  if (!setorExiste) notFound()

  return (
    <CatalogoClient
      produtos={produtos}
      setores={setores}
      categorias={categorias}
      subcategorias={subcategorias}
      setorInicial={setor}
    />
  )
}

export default async function CatalogoSetorPage({ params }: Props) {
  const { setor } = await params
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <CatalogoSetorData setor={setor} />
    </Suspense>
  )
}