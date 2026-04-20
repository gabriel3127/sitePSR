// ─── Tipos gerados manualmente baseado nas tabelas do Supabase ──────────────
// Quando rodar: npx supabase gen types typescript --project-id fqzxnnylmzjwvcukfxba
// substitua este arquivo pelo output gerado automaticamente.

// ─── Tabelas de referência ───────────────────────────────────────────────────

export type Setor = {
  id: number
  nome: string
  slug: string
  created_at: string
}

export type Categoria = {
  id: number
  nome: string
  slug: string
  created_at: string
}

export type Subcategoria = {
  id: number
  nome: string
  slug: string
  categoria_id: number
  created_at: string
}

// ─── Variações de produto ────────────────────────────────────────────────────

export type VariacaoGrupo = {
  nome: string
  valores: string[]
}

export type VariacaoCombinacao = {
  chave: string
  foto?: string
  ativo?: boolean
}

export type Variacoes = {
  grupos: VariacaoGrupo[]
  combinacoes: VariacaoCombinacao[]
}

// ─── Produto ─────────────────────────────────────────────────────────────────

export type Produto = {
  id: number
  slug: string          // ← adicionado (coluna criada pela migration)
  nome: string
  descricao: string | null
  foto_url: string | null
  fotos: string[] | null
  ativo: boolean
  destaque: boolean
  ordem: number
  preco: number | null
  unidade: string | null
  sku: string | null
  variacoes: Variacoes | null
  obs: string | null
  categoria_id: number | null
  subcategoria_id: number | null
  created_at: string
}

// Produto com joins (usado nas listagens)
export type ProdutoComRelacoes = Produto & {
  categorias?: Categoria | null
  subcategorias?: Subcategoria | null
  produto_setores?: { setores: Setor }[]
  produto_categorias?: { categorias: Categoria }[]
}

// ─── Posts do blog ───────────────────────────────────────────────────────────

export type Post = {
  id: number
  slug: string
  titulo: string
  excerpt: string | null
  categoria: string | null
  conteudo: string | null
  conteudo_html: string | null
  foto_url: string | null
  tempo_leitura: string | null
  publicado: boolean
  destaque: boolean
  created_at: string
}

// ─── Vendedores ──────────────────────────────────────────────────────────────

export type Vendedor = {
  id: string
  nome: string
  slug: string
  whatsapp: string
  ativo: boolean
  created_at: string
}

// ─── Tabelas de junção ───────────────────────────────────────────────────────

export type ProdutoCategoria = {
  produto_id: number
  categoria_id: number
}

export type ProdutoSetor = {
  produto_id: number
  setor_id: number
}

export type CategoriaSubcategoria = {
  categoria_id: number
  subcategoria_id: number
}