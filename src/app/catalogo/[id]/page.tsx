import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getProdutoById, getProdutos } from "@/lib/queries"
import ProdutoClient from "./ProdutoClient"

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const produto = await getProdutoById(Number(id))
  if (!produto) return { title: "Produto não encontrado | PSR Embalagens" }
  return {
    title: `${produto.nome} | PSR Embalagens`,
    description: produto.descricao || "Embalagens para o seu negócio. Entrega grátis no DF.",
    openGraph: {
      title: produto.nome,
      description: produto.descricao || "",
      images: produto.foto_url ? [{ url: produto.foto_url }] : [],
    },
  }
}

export default async function ProdutoPage({ params }: Props) {
  const { id } = await params

  const [produto, todosProdutos] = await Promise.all([
    getProdutoById(Number(id)),
    getProdutos({ ativo: true }),
  ])

  if (!produto) notFound()

  return <ProdutoClient produto={produto} todosProdutos={todosProdutos} />
}