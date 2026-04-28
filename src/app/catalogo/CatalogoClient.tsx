"use client"

import { useState, useMemo, useEffect, useRef, useCallback } from "react"
import { LazyMotion, m, AnimatePresence } from "framer-motion"

const loadFeatures = () => import("framer-motion").then((r) => r.domAnimation)
import {
  Search, ShoppingBag, X, Send, Plus, Minus,
  SlidersHorizontal, ChevronLeft, ChevronRight,
  Trash2, Grid3X3, List, ArrowRight,
  MapPin, Phone, Mail,
  Home, BookOpen, MessageSquare,
  Pencil
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import dynamic from "next/dynamic"
import { supabase } from "@/lib/supabase"
import type { ProdutoComRelacoes, Setor, Categoria, Subcategoria } from "@/lib/types"

const AdminOverlay = dynamic(() => import("@/components/AdminOverlay"), { ssr: false })

// ─── Constantes ───────────────────────────────────────────────────────────────
const WA_NUMBER_PADRAO = "5561993177107"
const POR_PAGINA_MOBILE = 24
const POR_PAGINA_DESKTOP = 28

// ─── Types locais ─────────────────────────────────────────────────────────────
interface CartItem {
  id: number
  nome: string
  foto_url: string | null
  qty: number
}

interface Props {
  produtos: ProdutoComRelacoes[]
  setores: Setor[]
  categorias: Categoria[]
  subcategorias: Subcategoria[]
  vendedor?: { nome: string; whatsapp: string; slug: string }
  setorInicial?: string // ← novo: pré-seleciona setor ao vir de /catalogo/setor/[setor]
}

// ─── Helpers localStorage ─────────────────────────────────────────────────────
const loadCart = (): CartItem[] => {
  if (typeof window === "undefined") return []
  try { return JSON.parse(localStorage.getItem("psr_cart") || "[]") }
  catch { return [] }
}
const saveCart = (cart: CartItem[]) => {
  localStorage.setItem("psr_cart", JSON.stringify(cart))
}

// ─── Paginação ────────────────────────────────────────────────────────────────
const Paginacao = ({ paginaAtual, totalPaginas, onMudar }: { paginaAtual: number; totalPaginas: number; onMudar: (p: number) => void }) => {
  if (totalPaginas <= 1) return null
  const getPages = (): (number | string)[] => {
    if (totalPaginas <= 7) return Array.from({ length: totalPaginas }, (_, i) => i + 1)
    const pages: (number | string)[] = [1]
    if (paginaAtual > 3) pages.push("...")
    for (let i = Math.max(2, paginaAtual - 1); i <= Math.min(totalPaginas - 1, paginaAtual + 1); i++) pages.push(i)
    if (paginaAtual < totalPaginas - 2) pages.push("...")
    pages.push(totalPaginas)
    return pages
  }
  return (
    <div className="flex items-center justify-center gap-1 mt-10">
      <button onClick={() => onMudar(paginaAtual - 1)} disabled={paginaAtual === 1}
        className="flex items-center gap-1 px-3 py-2 rounded-full border border-gray-200 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 text-gray-500">
        <ChevronLeft className="w-4 h-4" /> Anterior
      </button>
      {getPages().map((page, i) =>
        page === "..." ? (
          <span key={`e-${i}`} className="px-2 text-sm text-gray-400">···</span>
        ) : (
          <button key={page} onClick={() => onMudar(page as number)}
            className={`w-9 h-9 rounded-full text-sm font-medium transition-colors ${
              page === paginaAtual ? "bg-[#1A50A0] text-white font-bold" : "text-gray-500 hover:bg-gray-100"
            }`}>
            {page}
          </button>
        )
      )}
      <button onClick={() => onMudar(paginaAtual + 1)} disabled={paginaAtual === totalPaginas}
        className="flex items-center gap-1 px-3 py-2 rounded-full border border-gray-200 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 text-gray-500">
        Próximo <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────
const Footer = () => (
  <footer className="bg-gray-950 text-gray-400 mt-16">
    <div className="w-full px-6 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <div className="mb-4">
            <Image src="/images/psr-logo.svg" alt="PSR Embalagens" width={90} height={32} className="h-8 w-auto brightness-0 invert opacity-70" />
          </div>
          <p className="text-sm leading-relaxed text-gray-400 mb-5">
            Embalagens, descartáveis e produtos de limpeza para o seu negócio. Qualidade e variedade em um só lugar.
          </p>
          <div className="flex gap-3">
            <a href="https://instagram.com/psrembalagens" aria-label="Instagram da PSR Embalagens" target="_blank" rel="noopener noreferrer"
              className="w-9 h-9 rounded-full border border-gray-800 flex items-center justify-center hover:border-gray-600 hover:text-gray-200 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </a>
            <a href="https://facebook.com/psrembalagens" aria-label="Facebook da PSR Embalagens" target="_blank" rel="noopener noreferrer"
              className="w-9 h-9 rounded-full border border-gray-800 flex items-center justify-center hover:border-gray-600 hover:text-gray-200 transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>
            </a>
          </div>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-300 mb-4">Institucional</p>
          <ul className="space-y-2.5">
            {["Sobre nós", "Política de privacidade", "Termos de uso", "Trabalhe conosco"].map(item => (
              <li key={item}><Link href="#" className="text-sm text-gray-400 hover:text-gray-100 transition-colors">{item}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-300 mb-4">Atendimento</p>
          <ul className="space-y-2.5">
            {["Central de ajuda", "Rastrear pedido", "Trocas e devoluções", "Fale conosco"].map(item => (
              <li key={item}><Link href="#" className="text-sm text-gray-400 hover:text-gray-100 transition-colors">{item}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-300 mb-4">Contato</p>
          <ul className="space-y-3">
            <li className="flex items-start gap-2.5 text-sm text-gray-400">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-500" />
              <span>SIA Trecho 3, Lote 1.245 — Brasília, DF</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 flex-shrink-0 text-gray-500" />
              <a href="tel:+5561993177107" className="text-sm text-gray-400 hover:text-gray-100 transition-colors">(61) 99317-7107</a>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 flex-shrink-0 text-gray-500" />
              <a href="mailto:contato@psrembalagens.com.br" className="text-sm text-gray-400 hover:text-gray-100 transition-colors">contato@psrembalagens.com.br</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div className="border-t border-gray-900">
      <div className="w-full px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-gray-400">© {new Date().getFullYear()} PSR Embalagens. Todos os direitos reservados.</p>
        <div className="flex gap-4">
          {["Privacidade", "Cookies", "Termos"].map(item => (
            <Link key={item} href="#" className="text-xs text-gray-400 hover:text-gray-200 transition-colors">{item}</Link>
          ))}
        </div>
      </div>
    </div>
  </footer>
)

// ─── Pills mobile ─────────────────────────────────────────────────────────────
const MobileSetorPills = ({ setores, active, onSelect, onClear }: { setores: Setor[]; active: string | null; onSelect: (s: string) => void; onClear: () => void }) => {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!active || !ref.current) return
    const btn = ref.current.querySelector(`[data-slug="${active}"]`)
    if (btn) (btn as HTMLElement).scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" })
  }, [active])
  return (
    <div ref={ref} className="flex gap-2 overflow-x-auto py-2.5 px-4 lg:hidden" style={{ scrollbarWidth: "none" }}>
      <button onClick={onClear}
        className={`flex-shrink-0 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${!active ? "bg-[#1A50A0] text-white border-[#1A50A0]" : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"}`}>
        Todos
      </button>
      {setores.map((s) => (
        <button key={s.slug} data-slug={s.slug} onClick={() => onSelect(s.slug)}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${active === s.slug ? "bg-[#1A50A0] text-white border-[#1A50A0]" : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"}`}>
          {s.nome}
        </button>
      ))}
    </div>
  )
}

// ─── Botões admin inline nos cards ────────────────────────────────────────────
const AdminButtons = ({ product, onEditar, onToggle, onExcluir }: {
  product: ProdutoComRelacoes
  onEditar: (p: ProdutoComRelacoes) => void
  onToggle: (p: ProdutoComRelacoes) => void
  onExcluir: (id: number) => void
}) => (
  <div className="flex gap-1.5 mt-2 pt-2 border-t border-gray-100">
    <button
      onClick={e => { e.preventDefault(); e.stopPropagation(); onEditar(product) }}
      className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium text-gray-500 hover:text-[#1A50A0] hover:bg-blue-50 border border-gray-200 transition-colors"
    >
      <Pencil className="w-3 h-3" /> Editar
    </button>
    <button
      onClick={e => { e.preventDefault(); e.stopPropagation(); onToggle(product) }}
      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium border transition-colors ${
        product.ativo ? "text-amber-600 hover:bg-amber-50 border-amber-200" : "text-emerald-600 hover:bg-emerald-50 border-emerald-200"
      }`}
    >
      {product.ativo ? "Desativar" : "Ativar"}
    </button>
    <button
      onClick={e => { e.preventDefault(); e.stopPropagation(); onExcluir(product.id) }}
      className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium text-red-500 hover:bg-red-50 border border-red-200 transition-colors"
    >
      <Trash2 className="w-3 h-3" /> Excluir
    </button>
  </div>
)

// ─── Helper URL produto ───────────────────────────────────────────────────────
const produtoHref = (product: ProdutoComRelacoes) =>
  `/catalogo/p/${product.slug ?? product.id}`

// ═══════════════════════════════════════════════════════════════════════════════
export default function CatalogoClient({ produtos, setores, categorias, subcategorias, vendedor, setorInicial }: Props) {
  const searchParams = useSearchParams()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const waNumber = vendedor?.whatsapp ?? WA_NUMBER_PADRAO

  // ─── estados ────────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("")
  const [searchOpen, setSearchOpen] = useState(false)
  const [activeCategoria, setActiveCategoria] = useState<string | null>(null)
  const [activeSubcategoria, setActiveSubcategoria] = useState<string | null>(null)
  // setorInicial tem prioridade sobre sessionStorage e searchParams
  const [activeSetor, setActiveSetor] = useState<string | null>(setorInicial ?? null)
  const [paginaMobile, setPaginaMobile] = useState(1)
  const [paginaDesktop, setPaginaDesktop] = useState(1)
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [confirmLimpar, setConfirmLimpar] = useState(false)

  // ─── admin ──────────────────────────────────────────────────────────────────
  const [isAdmin, setIsAdmin] = useState(false)
  const [produtosList, setProdutosList] = useState<ProdutoComRelacoes[]>(produtos)
  const [produtoParaEditar, setProdutoParaEditar] = useState<ProdutoComRelacoes | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setIsAdmin(true)
    })
  }, [])

  const handleProdutoAtualizado = useCallback((p: ProdutoComRelacoes) => {
    setProdutosList(prev => prev.map(x => x.id === p.id ? p : x))
  }, [])

  const handleProdutoRemovido = useCallback((id: number) => {
    setProdutosList(prev => prev.filter(x => x.id !== id))
  }, [])

  const handleProdutoAdicionado = useCallback((p: ProdutoComRelacoes) => {
    setProdutosList(prev => [p, ...prev])
  }, [])

  const handleToggleAtivo = useCallback(async (p: ProdutoComRelacoes) => {
    const { data } = await supabase.from("produtos").update({ ativo: !p.ativo }).eq("id", p.id).select("*").single()
    if (data) setProdutosList(prev => prev.map(x => x.id === data.id ? { ...x, ...data } : x))
  }, [])

  const handleExcluir = useCallback(async (id: number) => {
    if (!confirm("Excluir este produto permanentemente?")) return
    const { error } = await supabase.from("produtos").delete().eq("id", id)
    if (!error) setProdutosList(prev => prev.filter(x => x.id !== id))
  }, [])

  // ─── init ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    setCart(loadCart())

    // Se vier de /catalogo/setor/[setor], setorInicial já foi aplicado no useState
    // Só lê searchParams/sessionStorage se NÃO veio de rota de setor
    if (!setorInicial) {
      const setorParam = searchParams.get("setor")
      if (setorParam) {
        setActiveSetor(setorParam)
        sessionStorage.setItem("psr_setor", setorParam)
      } else {
        const saved = sessionStorage.getItem("psr_setor")
        if (saved) setActiveSetor(saved)
      }
    } else {
      // Persiste na sessão para quando o usuário voltar
      sessionStorage.setItem("psr_setor", setorInicial)
    }

    const categoriaParam = searchParams.get("categoria")
    const subcategoriaParam = searchParams.get("subcategoria")
    if (categoriaParam) setActiveCategoria(categoriaParam)
    if (subcategoriaParam) setActiveSubcategoria(subcategoriaParam)

    const savedPagina = sessionStorage.getItem("psr_pagina_desktop")
    if (savedPagina) setPaginaDesktop(Number(savedPagina))

    const savedScroll = sessionStorage.getItem("psr_scroll_y")
    if (savedScroll) {
      requestAnimationFrame(() => {
        window.scrollTo({ top: Number(savedScroll), behavior: "instant" })
        sessionStorage.removeItem("psr_scroll_y")
      })
    }
  }, [searchParams, setorInicial])

  // ─── filtros ─────────────────────────────────────────────────────────────────
  const filtered = useMemo(() =>
    produtosList.filter((p) => {
      const matchCat = !activeCategoria || p.categorias?.slug === activeCategoria
      const matchSub = !activeSubcategoria || p.subcategorias?.slug === activeSubcategoria
      const matchSet = !activeSetor || p.produto_setores?.some((ps) => ps.setores?.slug === activeSetor)
      const matchSrch = p.nome.toLowerCase().includes(search.toLowerCase()) ||
        (p.descricao || "").toLowerCase().includes(search.toLowerCase())
      return matchCat && matchSub && matchSet && matchSrch
    })
  , [produtosList, search, activeCategoria, activeSubcategoria, activeSetor])

  const setoresDisponiveis = useMemo(() =>
    setores.filter(s => produtosList.some(p => p.produto_setores?.some(ps => ps.setores?.slug === s.slug)))
  , [produtosList, setores])

  const categoriasComContagem = useMemo(() => {
    const base = produtosList.filter(p => !activeSetor || p.produto_setores?.some(ps => ps.setores?.slug === activeSetor))
    return categorias
      .map(c => ({ ...c, count: base.filter(p => p.categorias?.slug === c.slug).length }))
      .filter(c => c.count > 0)
  }, [produtosList, categorias, activeSetor])

  const subcategoriasComContagem = useMemo(() => {
    const base = produtosList.filter(p =>
      (!activeSetor || p.produto_setores?.some(ps => ps.setores?.slug === activeSetor)) &&
      (!activeCategoria || p.categorias?.slug === activeCategoria)
    )
    return subcategorias
      .map(s => ({ ...s, count: base.filter(p => p.subcategorias?.slug === s.slug).length }))
      .filter(s => s.count > 0)
  }, [produtosList, subcategorias, activeSetor, activeCategoria])

  const totalTodos = useMemo(() =>
    produtosList.filter(p => !activeSetor || p.produto_setores?.some(ps => ps.setores?.slug === activeSetor)).length
  , [produtosList, activeSetor])

  const totalPaginasMobile = Math.ceil(filtered.length / POR_PAGINA_MOBILE)
  const produtosVisivelMobile = useMemo(() => filtered.slice(0, paginaMobile * POR_PAGINA_MOBILE), [filtered, paginaMobile])
  const totalPaginasDesktop = Math.ceil(filtered.length / POR_PAGINA_DESKTOP)
  const produtosVisivelDesktop = useMemo(() =>
    filtered.slice((paginaDesktop - 1) * POR_PAGINA_DESKTOP, paginaDesktop * POR_PAGINA_DESKTOP)
  , [filtered, paginaDesktop])

  const sentinelaRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!sentinelaRef.current) return
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting && paginaMobile < totalPaginasMobile) setPaginaMobile(p => p + 1) },
      { rootMargin: "200px" }
    )
    observer.observe(sentinelaRef.current)
    return () => observer.disconnect()
  }, [paginaMobile, totalPaginasMobile])

  const openSearch = () => { setSearchOpen(true); setTimeout(() => searchInputRef.current?.focus(), 50) }
  const closeSearch = () => { setSearchOpen(false); setSearch("") }

  const handleSetorSelect = (slug: string) => {
    const novo = activeSetor === slug ? null : slug
    setActiveSetor(novo); setActiveCategoria(null); setActiveSubcategoria(null); setPaginaMobile(1); setPaginaDesktop(1)
    if (novo) sessionStorage.setItem("psr_setor", novo)
    else sessionStorage.removeItem("psr_setor")
  }
  const handleSetorClear = () => {
    setActiveSetor(null); setActiveCategoria(null); setActiveSubcategoria(null); setPaginaMobile(1); setPaginaDesktop(1)
    sessionStorage.removeItem("psr_setor")
  }

  const mudarPaginaDesktop = (p: number) => {
    setPaginaDesktop(p)
    sessionStorage.setItem("psr_pagina_desktop", String(p))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const clearFilters = () => {
    setActiveCategoria(null); setActiveSubcategoria(null); setActiveSetor(null); setSearch("")
    setPaginaMobile(1); setPaginaDesktop(1)
    sessionStorage.removeItem("psr_pagina_desktop"); sessionStorage.removeItem("psr_setor")
  }

  const activeFiltersCount = [activeCategoria, activeSubcategoria, activeSetor, search].filter(Boolean).length

  const handleProdutoClick = () => {
    sessionStorage.setItem("psr_scroll_y", String(window.scrollY))
    if (activeSetor) {
      const setorObj = setoresDisponiveis.find(s => s.slug === activeSetor)
      sessionStorage.setItem("psr_breadcrumb_tipo", "setor")
      sessionStorage.setItem("psr_breadcrumb_slug", activeSetor)
      sessionStorage.setItem("psr_breadcrumb_nome", setorObj?.nome ?? activeSetor)
    } else if (activeSubcategoria) {
      const subObj = subcategorias.find(s => s.slug === activeSubcategoria)
      sessionStorage.setItem("psr_breadcrumb_tipo", "subcategoria")
      sessionStorage.setItem("psr_breadcrumb_slug", activeSubcategoria)
      sessionStorage.setItem("psr_breadcrumb_nome", subObj?.nome ?? activeSubcategoria)
    } else if (activeCategoria) {
      const catObj = categorias.find(c => c.slug === activeCategoria)
      sessionStorage.setItem("psr_breadcrumb_tipo", "categoria")
      sessionStorage.setItem("psr_breadcrumb_slug", activeCategoria)
      sessionStorage.setItem("psr_breadcrumb_nome", catObj?.nome ?? activeCategoria)
    } else {
      sessionStorage.removeItem("psr_breadcrumb_tipo")
      sessionStorage.removeItem("psr_breadcrumb_slug")
      sessionStorage.removeItem("psr_breadcrumb_nome")
    }
  }

  const addToCart = (e: React.MouseEvent, product: ProdutoComRelacoes) => {
    e.preventDefault(); e.stopPropagation()
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      const next = existing
        ? prev.map((item) => item.id === product.id ? { ...item, qty: item.qty + 1 } : item)
        : [...prev, { id: product.id, nome: product.nome, foto_url: product.foto_url, qty: 1 }]
      saveCart(next); return next
    })
  }

  const removeItem = (id: number) =>
    setCart(prev => { const next = prev.filter(i => i.id !== id); saveCart(next); return next })

  const updateQty = (id: number, delta: number) =>
    setCart((prev) => {
      const next = prev.map((item) => item.id === id ? { ...item, qty: Math.max(0, item.qty + delta) } : item).filter(i => i.qty > 0)
      saveCart(next); return next
    })

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0)

  const sendWhatsApp = () => {
    const linhas = cart.map((item) => `▸ *${item.nome}*\n   Quantidade: ${item.qty} unidade${item.qty > 1 ? "s" : ""}`)
    const msg = ["🛒 *SOLICITAÇÃO DE ORÇAMENTO*", "*PSR Embalagens* — Catálogo Online", "",
      "━━━━━━━━━━━━━━━━", "📦 *PRODUTOS SELECIONADOS*", "",
      linhas.join("\n\n"), "", "━━━━━━━━━━━━━━━━",
      "📍 Pedido feito pelo catálogo online", "🌐 psrembalagens.com.br"].join("\n")
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`, "_blank")
  }

  return (
    <LazyMotion features={loadFeatures} strict>
    <div className={`min-h-screen bg-gray-50 pb-16 lg:pb-0 ${isAdmin ? "pt-10" : ""}`}>

      {isAdmin && (
        <AdminOverlay
          setores={setores}
          categorias={categorias}
          subcategorias={subcategorias}
          produtoParaEditar={produtoParaEditar}
          onProdutoAtualizado={handleProdutoAtualizado}
          onProdutoRemovido={handleProdutoRemovido}
          onProdutoAdicionado={handleProdutoAdicionado}
          onEditarFechado={() => setProdutoParaEditar(null)}
        />
      )}

      {vendedor && (
        <div className="bg-[#1A50A0] text-white text-center text-xs py-2 px-4">
          Você está no catálogo de <strong>{vendedor.nome}</strong> — pedidos vão direto para o WhatsApp dele
        </div>
      )}

      {/* ── Header ── */}
      <header className={`sticky z-40 bg-white border-b border-gray-100 shadow-sm ${isAdmin ? "top-10" : "top-0"}`}>
        <div className="hidden lg:flex container items-center gap-4 h-16">
          <Link href="/" className="flex-shrink-0">
            <Image src="/images/psr-logo.svg" alt="PSR Embalagens" width={100} height={36} className="h-9 w-auto" />
          </Link>
          <div className="flex-1 max-w-xl relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Buscar no catálogo..." value={search}
              onChange={(e) => { setSearch(e.target.value); setPaginaDesktop(1) }}
              className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:bg-white text-sm transition-all" />
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <Link href="/" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1">
              <ChevronLeft className="w-4 h-4" /> Voltar ao site
            </Link>
            <button onClick={() => setCartOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1A50A0] text-white text-sm font-medium hover:bg-[#153F80] transition-colors">
              <ShoppingBag className="w-4 h-4" />
              <span>Carrinho</span>
              {totalItems > 0 && (
                <span className="bg-white text-gray-900 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="lg:hidden h-14 flex items-center px-4 gap-2">
          <AnimatePresence initial={false} mode="wait">
            {searchOpen ? (
              <m.div key="open" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex-1 flex items-center gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input ref={searchInputRef} type="text" placeholder="Buscar produtos..." value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-full border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10 text-sm" />
                </div>
                <button onClick={closeSearch} className="p-2 rounded-full text-gray-400 hover:bg-gray-100 flex-shrink-0">
                  <X className="w-5 h-5" />
                </button>
              </m.div>
            ) : (
              <m.div key="closed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex-1 flex items-center gap-2">
                <Link href="/" className="flex-shrink-0">
                  <Image src="/images/psr-logo.svg" alt="PSR Embalagens" width={80} height={32} className="h-8 w-auto" />
                </Link>
                <div className="flex-1" />
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button aria-label="Buscar produtos" onClick={openSearch}
                    className="w-9 h-9 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition-colors">
                    <Search className="w-5 h-5" />
                  </button>
                  <button aria-label="Abrir carrinho" onClick={() => setCartOpen(true)}
                    className="w-9 h-9 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition-colors relative">
                    <ShoppingBag className="w-5 h-5" />
                    {totalItems > 0 && (
                      <span className="absolute top-1 right-1 bg-[#1A50A0] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                        {totalItems > 9 ? "9+" : totalItems}
                      </span>
                    )}
                  </button>
                </div>
              </m.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      <main>
        {/* ── DESKTOP ── */}
        <div className="hidden lg:block">
          <div className="w-full px-6 py-6">
            <div className="mb-6">
              <h1 className="text-xl font-bold text-gray-900 mb-0.5">Explorar Catálogo</h1>
              <p className="text-gray-600 text-xs">Encontre embalagens, descartáveis e produtos de limpeza para o seu negócio</p>
            </div>

            <div className="flex gap-6 items-start">
              {/* Sidebar */}
              <aside className="w-56 flex-shrink-0">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Categoria</p>
                <div className="space-y-0.5 mb-5">
                  <button onClick={() => { setActiveCategoria(null); setActiveSubcategoria(null); setPaginaDesktop(1) }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-colors ${
                      !activeCategoria ? "bg-[#1A50A0] text-white font-semibold" : "text-gray-600 hover:bg-gray-100"
                    }`}>
                    <span>Todos</span>
                    <span className="text-[11px] font-bold tabular-nums opacity-75">{totalTodos}</span>
                  </button>
                  {categoriasComContagem.map((c) => (
                    <button key={c.slug} onClick={() => { setActiveCategoria(c.slug); setActiveSubcategoria(null); setPaginaDesktop(1) }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-colors ${
                        activeCategoria === c.slug ? "bg-[#1A50A0] text-white font-semibold" : "text-gray-600 hover:bg-gray-100"
                      }`}>
                      <span>{c.nome}</span>
                      <span className="text-[11px] font-bold tabular-nums opacity-75">{c.count}</span>
                    </button>
                  ))}
                </div>
                {subcategoriasComContagem.length > 0 && (
                  <>
                    <div className="h-px bg-gray-100 mb-4" />
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Subcategoria</p>
                    <div className="space-y-0.5">
                      <button onClick={() => { setActiveSubcategoria(null); setPaginaDesktop(1) }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-colors ${
                          !activeSubcategoria ? "bg-[#1A50A0] text-white font-semibold" : "text-gray-600 hover:bg-gray-100"
                        }`}>
                        <span>Todos</span>
                      </button>
                      {subcategoriasComContagem.map((s) => (
                        <button key={s.slug} onClick={() => { setActiveSubcategoria(s.slug); setPaginaDesktop(1) }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-colors ${
                            activeSubcategoria === s.slug ? "bg-[#1A50A0] text-white font-semibold" : "text-gray-600 hover:bg-gray-100"
                          }`}>
                          <span>{s.nome}</span>
                          <span className="text-[11px] font-bold tabular-nums opacity-75">{s.count}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </aside>

              {/* Coluna direita */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap mb-5 pb-5 border-b border-gray-100">
                  <button onClick={handleSetorClear}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      !activeSetor ? "bg-[#1A50A0] text-white border-[#1A50A0]" : "bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:text-gray-700"
                    }`}>Todos</button>
                  {setoresDisponiveis.map((s) => (
                    <button key={s.slug} onClick={() => handleSetorSelect(s.slug)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                        activeSetor === s.slug ? "bg-[#1A50A0] text-white border-[#1A50A0]" : "bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:text-gray-700"
                      }`}>{s.nome}</button>
                  ))}
                </div>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs text-gray-500">
                    <span className="font-semibold text-gray-900">{filtered.length}</span> produto{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
                    {activeFiltersCount > 0 && (
                      <button onClick={clearFilters} className="ml-2 text-gray-400 hover:text-gray-700 underline text-xs">limpar filtros</button>
                    )}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <button aria-label="Visualização em grade" onClick={() => setViewMode("grid")}
                      className={`w-7 h-7 flex items-center justify-center rounded-xl border transition-colors ${viewMode === "grid" ? "bg-[#1A50A0] text-white border-[#1A50A0]" : "border-gray-200 text-gray-400 hover:border-gray-300"}`}>
                      <Grid3X3 className="w-3.5 h-3.5" />
                    </button>
                    <button aria-label="Visualização em lista" onClick={() => setViewMode("list")}
                      className={`w-7 h-7 flex items-center justify-center rounded-xl border transition-colors ${viewMode === "list" ? "bg-[#1A50A0] text-white border-[#1A50A0]" : "border-gray-200 text-gray-400 hover:border-gray-300"}`}>
                      <List className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {viewMode === "grid" ? (
                  <div className="grid grid-cols-3 xl:grid-cols-4 gap-5">
                    <AnimatePresence mode="popLayout">
                      {produtosVisivelDesktop.map((product, index) => (
                        <m.div key={product.id} layout
                          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.18, delay: (index % POR_PAGINA_DESKTOP) * 0.02 }}>
                          <div className={`group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 ${!product.ativo ? "opacity-50" : ""}`}>
                            <Link href={produtoHref(product)} onClick={handleProdutoClick}>
                              <div className="aspect-square overflow-hidden relative bg-gray-50">
                                {product.foto_url ? (
                                  <Image src={product.foto_url} alt={product.nome} fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    sizes="(max-width: 1280px) 25vw, 300px" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-200"><ShoppingBag className="w-10 h-10" /></div>
                                )}
                              </div>
                            </Link>
                            <div className="p-4">
                              {product.categorias && (
                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600">{product.categorias.nome}</span>
                              )}
                              <Link href={produtoHref(product)} onClick={handleProdutoClick}>
                                <h2 className="font-semibold text-gray-900 mt-0.5 leading-snug line-clamp-2 text-sm hover:text-gray-500 transition-colors">{product.nome}</h2>
                              </Link>
                              {product.descricao && (
                                <p className="text-xs text-gray-500 mt-1 line-clamp-1">{product.descricao}</p>
                              )}
                              <Link href={produtoHref(product)} onClick={handleProdutoClick}
                                className="mt-3.5 w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#1A50A0] text-white text-xs font-bold hover:bg-[#153F80] transition-colors">
                                Ver produto <ArrowRight className="w-3.5 h-3.5" />
                              </Link>
                              {isAdmin && (
                                <AdminButtons product={product}
                                  onEditar={setProdutoParaEditar}
                                  onToggle={handleToggleAtivo}
                                  onExcluir={handleExcluir} />
                              )}
                            </div>
                          </div>
                        </m.div>
                      ))}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <AnimatePresence mode="popLayout">
                      {produtosVisivelDesktop.map((product, index) => (
                        <m.div key={product.id} layout
                          initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0 }} transition={{ duration: 0.15, delay: index * 0.015 }}>
                          <div className={`flex gap-4 bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-sm p-4 transition-all ${!product.ativo ? "opacity-50" : ""}`}>
                            <Link href={produtoHref(product)} onClick={handleProdutoClick}
                              className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-50 relative">
                              {product.foto_url ? (
                                <Image src={product.foto_url} alt={product.nome} fill className="object-cover" sizes="80px" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-200"><ShoppingBag className="w-6 h-6" /></div>
                              )}
                            </Link>
                            <div className="flex-1 min-w-0 py-0.5">
                              {product.categorias && (
                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600">{product.categorias.nome}</span>
                              )}
                              <Link href={produtoHref(product)} onClick={handleProdutoClick}>
                                <h2 className="font-semibold text-gray-900 text-sm leading-snug hover:text-gray-500 transition-colors">{product.nome}</h2>
                              </Link>
                              {product.descricao && (
                                <p className="text-xs text-gray-400 mt-1 line-clamp-2">{product.descricao}</p>
                              )}
                              {isAdmin && (
                                <AdminButtons product={product}
                                  onEditar={setProdutoParaEditar}
                                  onToggle={handleToggleAtivo}
                                  onExcluir={handleExcluir} />
                              )}
                            </div>
                            <Link href={produtoHref(product)} onClick={handleProdutoClick}
                              className="flex-shrink-0 self-center flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1A50A0] text-white text-xs font-bold hover:bg-[#153F80] transition-colors">
                              Ver produto <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </m.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}

                <Paginacao paginaAtual={paginaDesktop} totalPaginas={totalPaginasDesktop} onMudar={mudarPaginaDesktop} />

                {filtered.length === 0 && (
                  <div className="text-center py-24 bg-white rounded-2xl border border-gray-100">
                    <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-gray-900 font-semibold">Nenhum produto encontrado</p>
                    <p className="text-sm text-gray-400 mt-1">Tente outros filtros ou termos de busca</p>
                    <button onClick={clearFilters} className="mt-4 text-sm text-gray-900 underline hover:no-underline">Limpar todos os filtros</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── MOBILE ── */}
        <div className="lg:hidden container py-4">
          <div className="bg-white px-4 pt-4 pb-3 -mx-4 flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">Explorar Catálogo</h1>
              <p className="text-xs text-gray-500 mt-0.5">Embalagens e descartáveis para o seu negócio</p>
            </div>
            <button onClick={() => setSidebarOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-semibold transition-all ${
                activeFiltersCount > 0 ? "bg-[#1A50A0] text-white border-[#1A50A0]" : "bg-white text-gray-600 border-gray-200"
              }`}>
              <SlidersHorizontal className="w-4 h-4" />
              Filtros
              {activeFiltersCount > 0 && (
                <span className="bg-white/30 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          <div className="lg:hidden -mx-4 bg-gray-100 border-y border-gray-100">
            <MobileSetorPills setores={setoresDisponiveis} active={activeSetor} onSelect={handleSetorSelect} onClear={handleSetorClear} />
          </div>

          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-gray-500">
              <span className="font-semibold text-gray-900">{filtered.length}</span> produto{filtered.length !== 1 ? "s" : ""}
              {activeFiltersCount > 0 && (
                <button onClick={clearFilters} className="ml-2 text-gray-400 underline">limpar</button>
              )}
            </p>
            <div className="flex items-center gap-1">
              <button aria-label="Visualização em grade" onClick={() => setViewMode("grid")}
                className={`w-8 h-8 flex items-center justify-center rounded-xl border transition-colors ${viewMode === "grid" ? "bg-[#1A50A0] text-white border-[#1A50A0]" : "border-gray-200 text-gray-400"}`}>
                <Grid3X3 className="w-3.5 h-3.5" />
              </button>
              <button aria-label="Visualização em lista" onClick={() => setViewMode("list")}
                className={`w-8 h-8 flex items-center justify-center rounded-xl border transition-colors ${viewMode === "list" ? "bg-[#1A50A0] text-white border-[#1A50A0]" : "border-gray-200 text-gray-400"}`}>
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {viewMode === "grid" ? (
            <div className="grid grid-cols-2 gap-3 bg-gray-100">
              <AnimatePresence mode="popLayout">
                {produtosVisivelMobile.map((product, index) => (
                  <m.div key={product.id} layout className="h-full"
                    initial={index < 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, delay: index < POR_PAGINA_MOBILE ? (index % 6) * 0.03 : 0 }}>
                    <div className={`bg-white rounded-2xl overflow-hidden border border-gray-100 active:scale-[0.99] transition-transform flex flex-col h-full ${!product.ativo ? "opacity-50" : ""}`}>
                      <Link href={produtoHref(product)} onClick={handleProdutoClick}>
                        <div className="relative w-full aspect-square overflow-hidden bg-gray-50">
                          {product.foto_url ? (
                            <Image src={product.foto_url} alt={product.nome} fill className="object-cover" sizes="50vw" priority={index === 0} fetchPriority={index === 0 ? "high" : "auto"}/>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-200"><ShoppingBag className="w-12 h-12" /></div>
                          )}
                        </div>
                      </Link>
                      <div className="p-3 flex flex-col flex-1">
                        {product.categorias && (
                          <span className="text-[10px] font-bold uppercase tracking-wide text-gray-600">{product.categorias.nome}</span>
                        )}
                        <h2 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 mt-0.5">{product.nome}</h2>
                        <div className="flex-1" />
                        <Link href={produtoHref(product)} onClick={handleProdutoClick}
                          className="mt-2.5 w-full flex items-center justify-center gap-1 py-2 rounded-xl bg-[#1A50A0] text-white text-xs font-bold hover:bg-[#153F80] transition-colors">
                          Ver produto <ArrowRight className="w-3 h-3" />
                        </Link>
                        {isAdmin && (
                          <AdminButtons product={product}
                            onEditar={setProdutoParaEditar}
                            onToggle={handleToggleAtivo}
                            onExcluir={handleExcluir} />
                        )}
                      </div>
                    </div>
                  </m.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="space-y-2.5">
              <AnimatePresence mode="popLayout">
                {produtosVisivelMobile.map((product, index) => (
                  <m.div key={product.id} layout
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }} transition={{ duration: 0.15, delay: index * 0.015 }}>
                    <div className={`flex gap-3 bg-white rounded-2xl border border-gray-100 p-3 ${!product.ativo ? "opacity-50" : ""}`}>
                      <Link href={produtoHref(product)} onClick={handleProdutoClick}
                        className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-50 relative">
                        {product.foto_url ? (
                          <Image src={product.foto_url} alt={product.nome} fill className="object-cover" sizes="80px" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-200"><ShoppingBag className="w-6 h-6" /></div>
                        )}
                      </Link>
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                        <div>
                          {product.categorias && (
                            <span className="text-[10px] font-bold uppercase tracking-wide text-gray-600">{product.categorias.nome}</span>
                          )}
                          <h2 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 mt-0.5">{product.nome}</h2>
                        </div>
                        <Link href={produtoHref(product)} onClick={handleProdutoClick}
                          className="mt-2 self-start flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#1A50A0] text-white text-xs font-bold">
                          Ver produto <ArrowRight className="w-3 h-3" />
                        </Link>
                        {isAdmin && (
                          <AdminButtons product={product}
                            onEditar={setProdutoParaEditar}
                            onToggle={handleToggleAtivo}
                            onExcluir={handleExcluir} />
                        )}
                      </div>
                    </div>
                  </m.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {paginaMobile < totalPaginasMobile && (
            <div ref={sentinelaRef} className="flex justify-center py-8">
              <div className="flex gap-1.5">
                {[0, 150, 300].map(d => (
                  <span key={d} className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: `${d}ms` }} />
                ))}
              </div>
            </div>
          )}

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-900 font-semibold">Nenhum produto encontrado</p>
              <p className="text-sm text-gray-400 mt-1">Tente outros filtros</p>
              <button onClick={clearFilters} className="mt-4 text-sm text-gray-900 underline">Limpar filtros</button>
            </div>
          )}
        </div>
      </main>

      <div className="hidden lg:block"><Footer /></div>

      {/* ── Sidebar filtros mobile ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm lg:hidden" />
            <m.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-72 bg-white shadow-2xl flex flex-col lg:hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900">Filtros</h2>
                <button onClick={() => setSidebarOpen(false)} className="p-2 text-gray-400 hover:text-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">Setor</p>
                  <div className="space-y-1">
                    <button onClick={() => { handleSetorClear(); setSidebarOpen(false) }}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${!activeSetor ? "bg-[#1A50A0] text-white" : "text-gray-500 hover:bg-gray-50"}`}>
                      Todos os setores
                    </button>
                    {setoresDisponiveis.map((s) => (
                      <button key={s.slug} onClick={() => { handleSetorSelect(s.slug); setSidebarOpen(false) }}
                        className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeSetor === s.slug ? "bg-[#1A50A0] text-white" : "text-gray-500 hover:bg-gray-50"}`}>
                        {s.nome}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="h-px bg-gray-100" />
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">Categoria</p>
                  <div className="space-y-1">
                    <button onClick={() => { setActiveCategoria(null); setPaginaMobile(1) }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${!activeCategoria ? "bg-[#1A50A0] text-white" : "text-gray-500 hover:bg-gray-50"}`}>
                      <span>Todas</span><span className="text-xs opacity-60">{totalTodos}</span>
                    </button>
                    {categoriasComContagem.map((c) => (
                      <button key={c.slug} onClick={() => { setActiveCategoria(c.slug); setPaginaMobile(1); setSidebarOpen(false) }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeCategoria === c.slug ? "bg-[#1A50A0] text-white" : "text-gray-500 hover:bg-gray-50"}`}>
                        <span>{c.nome}</span><span className="text-xs opacity-60">{c.count}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-gray-100 flex gap-2">
                {activeFiltersCount > 0 && (
                  <button onClick={() => { clearFilters(); setSidebarOpen(false) }}
                    className="flex-1 py-2.5 rounded-xl border border-red-200 text-red-500 text-sm font-medium">Limpar</button>
                )}
                <button onClick={() => setSidebarOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#1A50A0] text-white font-semibold text-sm">
                  Ver {filtered.length} produtos
                </button>
              </div>
            </m.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Carrinho ── */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setCartOpen(false)} className="fixed inset-0 bottom-16 lg:bottom-0 z-50 bg-black/20 backdrop-blur-sm" />
            <m.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="fixed right-0 top-0 bottom-16 lg:bottom-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col">
              <div className="border-b border-gray-100 p-4 flex items-center justify-between">
                <h2 className="font-bold text-lg text-gray-900">Sua Lista <span className="text-gray-400 font-normal text-base">({totalItems})</span></h2>
                <div className="flex items-center gap-2">
                  {cart.length > 0 && (
                    <button onClick={() => setConfirmLimpar(true)}
                      className="flex items-center gap-1.5 text-xs text-red-500 border border-red-200 rounded-xl px-3 py-1.5 hover:bg-red-50 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" /> Limpar
                    </button>
                  )}
                  <button onClick={() => setCartOpen(false)} className="text-gray-400 hover:text-gray-700 p-1"><X className="w-5 h-5" /></button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cart.length === 0 ? (
                  <div className="text-center py-16">
                    <ShoppingBag className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">Lista vazia. Adicione produtos do catálogo.</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                      <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-white">
                        {item.foto_url
                          ? <Image src={item.foto_url} alt={item.nome} fill className="object-cover" sizes="56px" />
                          : <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="w-5 h-5 text-gray-200" /></div>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">{item.nome}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => removeItem(item.id)} className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-gray-300 hover:text-red-500 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-bold w-6 text-center">{item.qty}</span>
                        <button onClick={() => updateQty(item.id, 1)} className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {cart.length > 0 && (
                <div className="p-4 border-t border-gray-100">
                  <button onClick={sendWhatsApp}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#1A50A0] text-white font-bold hover:bg-[#153F80] transition-colors">
                    <Send className="w-4 h-4" /> Enviar lista pelo WhatsApp
                  </button>
                </div>
              )}
            </m.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Confirmar limpar ── */}
      <AnimatePresence>
        {confirmLimpar && (
          <>
            <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm" />
            <m.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
                <h3 className="font-bold text-gray-900 text-lg">Limpar lista?</h3>
                <p className="text-gray-400 text-sm mt-2">Todos os produtos serão removidos. Essa ação não pode ser desfeita.</p>
                <div className="flex gap-3 mt-5">
                  <button onClick={() => setConfirmLimpar(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50">Cancelar</button>
                  <button onClick={() => { setCart([]); localStorage.removeItem("psr_cart"); setConfirmLimpar(false) }}
                    className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600">Limpar tudo</button>
                </div>
              </div>
            </m.div>
          </>
        )}
      </AnimatePresence>

      {/* Navbar inferior mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 flex items-center lg:hidden">
        {[
          { label: "Início",      href: "/",            icon: Home },
          { label: "Catálogo",    href: "/catalogo",    icon: ShoppingBag },
          { label: "Blog",        href: "/blog",        icon: BookOpen },
          { label: "Depoimentos", href: "/depoimentos", icon: MessageSquare },
        ].map(({ label, href, icon: Icon }) => (
          <Link key={href} href={href}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors ${
              href === "/catalogo" ? "text-[#1A50A0]" : "text-gray-500 hover:text-gray-700"
            }`}>
            <Icon className="w-5 h-5" />
            <span className={`text-[10px] ${href === "/catalogo" ? "font-bold" : "font-medium"}`}>{label}</span>
          </Link>
        ))}
      </nav>
    </div>
    </LazyMotion>
  )
}