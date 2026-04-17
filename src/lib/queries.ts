import { supabase } from './supabase'
import type { Produto, ProdutoComRelacoes, Post, Vendedor, Setor, Categoria, Subcategoria } from './types'

// ─── Produtos ────────────────────────────────────────────────────────────────

export async function getProdutos(options?: {
  ativo?: boolean
  setor?: string
  categoria?: string
  limit?: number
}): Promise<ProdutoComRelacoes[]> {
  let query = supabase
    .from('produtos')
    .select(`
      *,
      categorias:categoria_id (id, nome, slug),
      subcategorias:subcategoria_id (id, nome, slug),
      produto_setores (
        setores (id, nome, slug)
      )
    `)
    .order('ordem', { ascending: true })

  if (options?.ativo !== undefined) {
    query = query.eq('ativo', options.ativo)
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query

  if (error) {
    console.error('Erro ao buscar produtos:', error)
    return []
  }

  // Filtro por setor (via join)
  if (options?.setor) {
    return (data as ProdutoComRelacoes[]).filter((p) =>
      p.produto_setores?.some((ps) => ps.setores?.slug === options.setor)
    )
  }

  return (data as ProdutoComRelacoes[]) ?? []
}

export async function getProdutoById(id: number): Promise<ProdutoComRelacoes | null> {
  const { data, error } = await supabase
    .from('produtos')
    .select(`
      *,
      categorias:categoria_id (id, nome, slug),
      subcategorias:subcategoria_id (id, nome, slug),
      produto_setores (
        setores (id, nome, slug)
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Erro ao buscar produto:', error)
    return null
  }

  return data as ProdutoComRelacoes
}

export async function getProdutosSlugs(): Promise<{ id: number }[]> {
  const { data, error } = await supabase
    .from('produtos')
    .select('id')
    .eq('ativo', true)

  if (error) return []
  return data ?? []
}

// ─── Blog ─────────────────────────────────────────────────────────────────────

export async function getPosts(options?: {
  publicado?: boolean
  destaque?: boolean
  limit?: number
}): Promise<Post[]> {
  let query = supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })

  if (options?.publicado !== undefined) {
    query = query.eq('publicado', options.publicado)
  }

  if (options?.destaque !== undefined) {
    query = query.eq('destaque', options.destaque)
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query

  if (error) {
    console.error('Erro ao buscar posts:', error)
    return []
  }

  return data ?? []
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('Erro ao buscar post:', error)
    return null
  }

  return data
}

export async function getPostsSlugs(): Promise<{ slug: string }[]> {
  const { data, error } = await supabase
    .from('posts')
    .select('slug')
    .eq('publicado', true)

  if (error) return []
  return data ?? []
}

// ─── Setores ─────────────────────────────────────────────────────────────────

export async function getSetores(): Promise<Setor[]> {
  const { data, error } = await supabase
    .from('setores')
    .select('*')
    .order('nome', { ascending: true })

  if (error) {
    console.error('Erro ao buscar setores:', error)
    return []
  }

  return data ?? []
}

// ─── Categorias ───────────────────────────────────────────────────────────────

export async function getCategorias(): Promise<Categoria[]> {
  const { data, error } = await supabase
    .from('categorias')
    .select('*')
    .order('nome', { ascending: true })

  if (error) {
    console.error('Erro ao buscar categorias:', error)
    return []
  }

  return data ?? []
}

export async function getSubcategorias(): Promise<Subcategoria[]> {
  const { data, error } = await supabase
    .from("subcategorias")
    .select("id, nome, slug, categoria_id, created_at")
    .order("nome")
  if (error) throw error
  return (data ?? []) as Subcategoria[]
}

// ─── Vendedores ───────────────────────────────────────────────────────────────

export async function getVendedorBySlug(slug: string): Promise<Vendedor | null> {
  const { data, error } = await supabase
    .from('vendedores')
    .select('*')
    .eq('slug', slug)
    .eq('ativo', true)
    .single()

  if (error) return null
  return data
}