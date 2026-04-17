import { notFound } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getProdutos, getSetores, getCategorias, getSubcategorias } from '@/lib/queries'
import CatalogoClient from '@/app/catalogo/CatalogoClient'
import type { Metadata } from 'next'

type Props = { params: Promise<{ slug: string }> }

async function getVendedor(slug: string) {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from('vendedores')
    .select('*')
    .eq('slug', slug)
    .eq('ativo', true)
    .single()
  return data
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const vendedor = await getVendedor(slug)
  if (!vendedor) return { title: 'Catálogo — PSR Embalagens' }
  return {
    title: `Catálogo ${vendedor.nome} — PSR Embalagens`,
    robots: 'noindex',
  }
}

export default async function VendedorCatalogoPage({ params }: Props) {
  const { slug } = await params
  const vendedor = await getVendedor(slug)

  if (!vendedor) notFound()

  const [produtos, setores, categorias, subcategorias] = await Promise.all([
    getProdutos({ ativo: true }),
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
      vendedor={{ nome: vendedor.nome, whatsapp: vendedor.whatsapp, slug: vendedor.slug }}
    />
  )
}