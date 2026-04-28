"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Calendar, Clock, ArrowRight, Sparkles,
  Home, ShoppingBag, BookOpen, MessageSquare,
  Plus, Pencil, Trash2, Eye, EyeOff, Star, X, LogOut, Users
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import dynamic from "next/dynamic"
import { supabase } from "@/lib/supabase"
import type { Post } from "@/lib/types"

// Admin de vendedores carregado dinamicamente (reusa o mesmo overlay do catálogo)
// Não importamos o AdminOverlay aqui pois o blog tem seu próprio modal inline

interface Props {
  posts: Post[]
}

const CATEGORIA_STYLE: Record<string, { bg: string; dot: string }> = {
  Sustentabilidade: { bg: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
  Dicas:            { bg: "bg-amber-100 text-amber-700",     dot: "bg-amber-500" },
  "Negócios":       { bg: "bg-blue-100 text-blue-700",       dot: "bg-blue-500" },
  default:          { bg: "bg-gray-100 text-gray-600",       dot: "bg-gray-400" },
}

const getCatStyle = (cat?: string | null) =>
  CATEGORIA_STYLE[cat || ""] || CATEGORIA_STYLE.default

const categorias = ["Todos", "Sustentabilidade", "Dicas", "Negócios"]

const formatDate = (iso?: string | null) => {
  if (!iso) return ""
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
}

function slugify(str: string) {
  return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
}

type FormPost = {
  id?: number
  titulo: string; slug: string; excerpt: string; categoria: string
  conteudo: string; foto_url: string; tempo_leitura: string
  publicado: boolean; destaque: boolean
}

const EMPTY_FORM: FormPost = {
  titulo: "", slug: "", excerpt: "", categoria: "",
  conteudo: "", foto_url: "", tempo_leitura: "",
  publicado: false, destaque: false,
}

// ─── Card post normal ─────────────────────────────────────────────────────────
const PostCard = ({ post, index, isAdmin, onEditar, onTogglePublicado, onExcluir }: {
  post: Post; index: number; isAdmin: boolean
  onEditar: (p: Post) => void
  onTogglePublicado: (p: Post) => void
  onExcluir: (id: number) => void
}) => {
  const style = getCatStyle(post.categoria)
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:-translate-y-1 hover:shadow-md transition-all duration-300 ${!post.publicado && isAdmin ? "opacity-60 border-dashed" : ""}`}
    >
      <Link href={`/blog/${post.slug}`}>
        <div className="relative aspect-video overflow-hidden bg-gray-100">
          {post.foto_url ? (
            <Image src={post.foto_url} alt={post.titulo} fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, 33vw" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">sem foto</div>
          )}
          <span className={`absolute top-3 left-3 flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${style.bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
            {post.categoria?.toUpperCase()}
          </span>
          {isAdmin && !post.publicado && (
            <span className="absolute top-3 right-3 bg-gray-800/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              RASCUNHO
            </span>
          )}
        </div>
        <div className="p-5">
          <div className="flex items-center gap-3 text-xs text-gray-600 mb-2">
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(post.created_at)}</span>
            {post.tempo_leitura && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.tempo_leitura}</span>}
          </div>
          <h2 className="font-bold text-gray-900 text-base leading-snug group-hover:text-[#1A50A0] transition-colors">
            {post.titulo}
          </h2>
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{post.excerpt}</p>
          <span className="inline-flex items-center gap-1 mt-4 text-sm font-semibold text-[#1A50A0] group-hover:gap-2 transition-all">
            Ler mais <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </Link>
      {isAdmin && (
        <div className="flex gap-1.5 px-5 pb-4 pt-0 border-t border-gray-100 mt-1">
          <button onClick={e => { e.preventDefault(); onEditar(post) }}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium text-gray-500 hover:text-[#1A50A0] hover:bg-blue-50 border border-gray-200 transition-colors">
            <Pencil className="w-3 h-3" /> Editar
          </button>
          <button onClick={e => { e.preventDefault(); onTogglePublicado(post) }}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium border transition-colors ${
              post.publicado ? "text-amber-600 hover:bg-amber-50 border-amber-200" : "text-emerald-600 hover:bg-emerald-50 border-emerald-200"
            }`}>
            {post.publicado ? <><EyeOff className="w-3 h-3" /> Despublicar</> : <><Eye className="w-3 h-3" /> Publicar</>}
          </button>
          <button onClick={e => { e.preventDefault(); onExcluir(post.id) }}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium text-red-500 hover:bg-red-50 border border-red-200 transition-colors">
            <Trash2 className="w-3 h-3" /> Excluir
          </button>
        </div>
      )}
    </motion.article>
  )
}

// ─── Card destaque ────────────────────────────────────────────────────────────
const FeaturedPost = ({ post, isAdmin, onEditar, onTogglePublicado, onExcluir }: {
  post: Post; isAdmin: boolean
  onEditar: (p: Post) => void
  onTogglePublicado: (p: Post) => void
  onExcluir: (id: number) => void
}) => {
  const style = getCatStyle(post.categoria)
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="col-span-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-all duration-300"
    >
      <div className="grid md:grid-cols-2">
        <div className="relative aspect-[4/3] md:aspect-auto overflow-hidden bg-gray-100" style={{ maxHeight: "360px" }}>
          {post.foto_url ? (
            <Image src={post.foto_url} alt={post.titulo} fill
              className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="50vw" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-600 text-sm">sem foto</div>
          )}
          <span className={`absolute top-4 left-4 flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${style.bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />{post.categoria?.toUpperCase()}
          </span>
          <span className="absolute top-4 right-4 flex items-center gap-1 bg-[#F5C200] text-[#0d1f3c] text-xs font-black px-2.5 py-1 rounded-full">
            ★ DESTAQUE
          </span>
        </div>
        <div className="p-8 flex flex-col justify-center">
          <div className="flex items-center gap-3 text-xs text-gray-600 mb-3">
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(post.created_at)}</span>
            {post.tempo_leitura && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.tempo_leitura}</span>}
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight group-hover:text-[#1A50A0] transition-colors">
            {post.titulo}
          </h2>
          <p className="text-gray-600 mt-3 leading-relaxed">{post.excerpt}</p>
          <div className="mt-6 flex items-center gap-3 flex-wrap">
            <Link href={`/blog/${post.slug}`}
              className="inline-flex items-center gap-2 bg-[#1A50A0] hover:bg-[#153f80] text-white font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm">
              Ler artigo completo <ArrowRight className="w-4 h-4" />
            </Link>
            {isAdmin && (
              <div className="flex gap-1.5">
                <button onClick={() => onEditar(post)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:text-[#1A50A0] hover:bg-blue-50 border border-gray-200 transition-colors">
                  <Pencil className="w-3 h-3" /> Editar
                </button>
                <button onClick={() => onExcluir(post.id)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 border border-red-200 transition-colors">
                  <Trash2 className="w-3 h-3" /> Excluir
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function BlogClient({ posts }: Props) {
  const [activeCategoria, setActiveCategoria] = useState("Todos")
  const [postsList, setPostsList] = useState<Post[]>(posts)

  // ─── admin ──────────────────────────────────────────────────────────────────
  const [isAdmin, setIsAdmin] = useState(false)
  const [modal, setModal] = useState<"novo" | "editar" | null>(null)
  const [form, setForm] = useState<FormPost>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState("")

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setIsAdmin(true)
    })
  }, [])

  function abrirNovo() {
    setForm(EMPTY_FORM); setErro(""); setModal("novo")
  }

  function abrirEditar(p: Post) {
    setForm({
      id: p.id, titulo: p.titulo, slug: p.slug,
      excerpt: p.excerpt ?? "", categoria: p.categoria ?? "",
      conteudo: p.conteudo ?? "", foto_url: p.foto_url ?? "",
      tempo_leitura: p.tempo_leitura ?? "",
      publicado: p.publicado, destaque: p.destaque,
    })
    setErro(""); setModal("editar")
  }

  function fechar() { setModal(null); setForm(EMPTY_FORM); setErro("") }

  function f(key: keyof FormPost, value: any) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function handleTituloChange(titulo: string) {
    setForm(prev => ({ ...prev, titulo, slug: modal === "novo" ? slugify(titulo) : prev.slug }))
  }

  const handleTogglePublicado = useCallback(async (p: Post) => {
    const { data } = await supabase.from("posts").update({ publicado: !p.publicado }).eq("id", p.id).select().single()
    if (data) setPostsList(prev => prev.map(x => x.id === data.id ? data : x))
  }, [])

  const handleExcluir = useCallback(async (id: number) => {
    if (!confirm("Excluir este post permanentemente?")) return
    const { error } = await supabase.from("posts").delete().eq("id", id)
    if (!error) setPostsList(prev => prev.filter(x => x.id !== id))
  }, [])

  async function salvar() {
    if (!form.titulo.trim() || !form.slug.trim()) { setErro("Título e slug são obrigatórios."); return }
    setSaving(true); setErro("")

    const payload = {
      titulo: form.titulo, slug: form.slug,
      excerpt: form.excerpt || null, categoria: form.categoria || null,
      conteudo: form.conteudo || null, foto_url: form.foto_url || null,
      tempo_leitura: form.tempo_leitura || null,
      publicado: form.publicado, destaque: form.destaque,
    }

    if (modal === "novo") {
      const { data, error } = await supabase.from("posts").insert(payload).select().single()
      if (error) { setErro(error.message); setSaving(false); return }
      setPostsList(prev => [data, ...prev])
    } else {
      const { data, error } = await supabase.from("posts").update(payload).eq("id", form.id!).select().single()
      if (error) { setErro(error.message); setSaving(false); return }
      setPostsList(prev => prev.map(x => x.id === data.id ? data : x))
    }

    setSaving(false); fechar()
  }

  // ─── filtros ─────────────────────────────────────────────────────────────────
  const filtered = (activeCategoria === "Todos" ? postsList : postsList.filter(p => p.categoria === activeCategoria))
    .filter(p => isAdmin || p.publicado)

  const featured = filtered.find(p => p.destaque)
  const rest = filtered.filter(p => p !== featured)

  return (
    <div className={`min-h-screen bg-gray-50 pb-16 lg:pb-0 ${isAdmin ? "pt-10" : ""}`}>

      {/* ── Barra admin ── */}
      {isAdmin && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-[#1A50A0] text-white h-10 flex items-center px-4 gap-2 shadow-lg">
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-60 mr-1">Admin</span>
          <button onClick={abrirNovo}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-xs font-semibold transition-colors">
            <Plus className="w-3.5 h-3.5" /> Novo post
          </button>
          <a href="/catalogo"
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium transition-colors">
            Catálogo
          </a>
          <a href="/admin/vendedores"
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium transition-colors">
            <Users className="w-3.5 h-3.5" /> Vendedores
          </a>
          <div className="flex-1" />
          <button onClick={async () => { await supabase.auth.signOut(); window.location.reload() }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 hover:bg-red-500/60 text-xs font-medium transition-colors">
            <LogOut className="w-3.5 h-3.5" /> Sair
          </button>
        </div>
      )}

      {/* Header */}
      <header className={`sticky z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm ${isAdmin ? "top-10" : "top-0"}`}>
        <div className="container flex items-center justify-between h-16">
          <Link href="/">
            <Image src="/images/psr-logo.svg" alt="PSR Embalagens" width={100} height={36} className="h-10 w-auto" />
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <Link href="/" className="hover:text-[#1A50A0] transition-colors">Home</Link>
            <Link href="/depoimentos" className="hover:text-[#1A50A0] transition-colors">Depoimentos</Link>
            <Link href="/#sobre" className="hover:text-[#1A50A0] transition-colors">Sobre</Link>
            <Link href="/#contato" className="hover:text-[#1A50A0] transition-colors">Contato</Link>
          </nav>
          <Link href="/catalogo"
            className="flex items-center gap-2 bg-[#1A50A0] hover:bg-[#153f80] text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
            Visite nosso Catálogo <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative bg-[#0d1f3c] overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(rgba(245,194,0,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(245,194,0,0.3) 1px, transparent 1px)`,
            backgroundSize: "48px 48px"
          }} />
        <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-[#1A50A0]/30 to-transparent" />
        <div className="container relative py-16 md:py-24">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-2xl">
            <span className="inline-flex items-center gap-2 bg-[#F5C200]/20 text-[#F5C200] text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-6">
              <Sparkles className="w-3 h-3" /> Insights &amp; Inovação
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
              Blog PSR<br /><span className="text-[#F5C200]">Embalagens</span>
            </h1>
            <p className="mt-4 text-gray-300 text-lg max-w-lg leading-relaxed">
              Explorando o futuro da logística e sustentabilidade através de embalagens inteligentes.
            </p>
          </motion.div>
        </div>
      </section>

      <main>
        <div className="container py-12">
          {/* Filtros */}
          <div className="flex flex-wrap gap-2 mb-10 justify-center">
            {categorias.map((cat) => (
              <button key={cat} onClick={() => setActiveCategoria(cat)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                  activeCategoria === cat
                    ? "bg-[#1A50A0] text-white shadow-sm"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-[#1A50A0] hover:text-[#1A50A0]"
                }`}>
                {cat}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <p className="text-center text-gray-400 py-16">Nenhum post encontrado.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured && (
                <FeaturedPost post={featured} isAdmin={isAdmin}
                  onEditar={abrirEditar}
                  onTogglePublicado={handleTogglePublicado}
                  onExcluir={handleExcluir} />
              )}
              {rest.map((post, i) => (
                <PostCard key={post.id} post={post} index={i} isAdmin={isAdmin}
                  onEditar={abrirEditar}
                  onTogglePublicado={handleTogglePublicado}
                  onExcluir={handleExcluir} />
              ))}
            </div>
          )}

          <footer className="border-t border-gray-200 mt-20 py-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
              <span>© {new Date().getFullYear()} PSR Embalagens. Todos os direitos reservados.</span>
              <div className="flex items-center gap-5">
                <Link href="/" className="hover:text-[#1A50A0] transition-colors">Home</Link>
                <Link href="/catalogo" className="hover:text-[#1A50A0] transition-colors">Catálogo</Link>
                <Link href="/#contato" className="hover:text-[#1A50A0] transition-colors">Contato</Link>
              </div>
            </div>
          </footer>
        </div>
      </main>

      {/* Navbar mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 flex items-center lg:hidden">
        {[
          { label: "Início",      href: "/",            icon: Home },
          { label: "Catálogo",    href: "/catalogo",    icon: ShoppingBag },
          { label: "Blog",        href: "/blog",        icon: BookOpen },
          { label: "Depoimentos", href: "/depoimentos", icon: MessageSquare },
        ].map(({ label, href, icon: Icon }) => (
          <Link key={href} href={href}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors ${
              href === "/blog" ? "text-[#1A50A0]" : "text-gray-600 hover:text-gray-900"
            }`}>
            <Icon className="w-5 h-5" />
            <span className={`text-[10px] ${href === "/blog" ? "font-bold" : "font-medium"}`}>{label}</span>
          </Link>
        ))}
      </nav>

      {/* ── Modal post ── */}
      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110] flex items-start justify-center p-4 overflow-y-auto">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-2xl my-14 p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-gray-900">
                  {modal === "novo" ? "Novo post" : "Editar post"}
                </h2>
                <button onClick={fechar} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Título *</label>
                  <input type="text" value={form.titulo} onChange={e => handleTituloChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A50A0]/30 focus:border-[#1A50A0]" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Slug *</label>
                  <div className="flex">
                    <span className="px-3 py-2.5 text-sm text-gray-400 bg-gray-50 border border-r-0 border-gray-200 rounded-l-lg">/blog/</span>
                    <input type="text" value={form.slug} onChange={e => f("slug", slugify(e.target.value))}
                      className="flex-1 px-3.5 py-2.5 rounded-r-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A50A0]/30 focus:border-[#1A50A0]" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Categoria</label>
                    <input type="text" value={form.categoria} onChange={e => f("categoria", e.target.value)}
                      placeholder="Ex: Dicas, Sustentabilidade"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A50A0]/30 focus:border-[#1A50A0]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Tempo de leitura</label>
                    <input type="text" value={form.tempo_leitura} onChange={e => f("tempo_leitura", e.target.value)}
                      placeholder="Ex: 5 min"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A50A0]/30 focus:border-[#1A50A0]" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">URL da imagem de capa</label>
                  <input type="text" value={form.foto_url} onChange={e => f("foto_url", e.target.value)} placeholder="https://..."
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A50A0]/30 focus:border-[#1A50A0]" />
                  {form.foto_url && (
                    <img src={form.foto_url} alt="" className="mt-2 h-24 w-full object-cover rounded-lg bg-gray-100" />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Resumo (excerpt)</label>
                  <textarea value={form.excerpt} onChange={e => f("excerpt", e.target.value)} rows={2}
                    placeholder="Breve descrição exibida na listagem"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A50A0]/30 focus:border-[#1A50A0] resize-none" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Conteúdo <span className="text-gray-400 font-normal">(HTML ou texto)</span>
                  </label>
                  <textarea value={form.conteudo} onChange={e => f("conteudo", e.target.value)} rows={10}
                    placeholder="<p>Conteúdo do post...</p>"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#1A50A0]/30 focus:border-[#1A50A0] resize-y" />
                </div>

                <div className="flex items-center gap-6 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.publicado} onChange={e => f("publicado", e.target.checked)}
                      className="rounded border-gray-300 text-[#1A50A0]" />
                    <span className="text-sm text-gray-700">Publicado</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.destaque} onChange={e => f("destaque", e.target.checked)}
                      className="rounded border-gray-300 text-[#1A50A0]" />
                    <span className="text-sm text-gray-700 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-yellow-500" /> Destaque
                    </span>
                  </label>
                </div>
              </div>

              {erro && <p className="mt-3 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{erro}</p>}

              <div className="flex gap-3 mt-6">
                <button onClick={fechar}
                  className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Cancelar
                </button>
                <button onClick={salvar} disabled={saving}
                  className="flex-1 py-2.5 rounded-lg bg-[#1A50A0] hover:bg-[#1A50A0]/90 disabled:opacity-60 text-white text-sm font-medium">
                  {saving ? "Salvando..." : "Salvar post"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}