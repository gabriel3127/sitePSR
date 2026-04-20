import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getProdutoBySlug, getProdutosSlugs, getProdutos } from "@/lib/queries"
import ProdutoClient from "./ProdutoClient"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = await getProdutosSlugs()
  return slugs.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const produto = await getProdutoBySlug(slug)
  if (!produto) return { title: "Produto não encontrado | PSR Embalagens" }
  return {
    title: `${produto.nome} | PSR Embalagens`,
    description: produto.descricao || "Embalagens para o seu negócio. Entrega grátis no DF.",
    alternates: {
      canonical: `https://www.psrembalagens.com.br/catalogo/p/${slug}`,
    },
    openGraph: {
      title: produto.nome,
      description: produto.descricao || "",
      images: produto.foto_url ? [{ url: produto.foto_url }] : [],
    },
  }
}

export default async function ProdutoPage({ params }: Props) {
  const { slug } = await params

  const [produto, todosProdutos] = await Promise.all([
    getProdutoBySlug(slug),
    getProdutos({ ativo: true }),
  ])

  if (!produto) notFound()

  return <ProdutoClient produto={produto} todosProdutos={todosProdutos} />
}