import { useState, useMemo, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, ShoppingBag, X, Send, Plus, Minus, Pencil, Trash2, SlidersHorizontal, ChevronDown, ChevronLeft, ChevronRight, User, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import psrLogo from "@/assets/psr-logo.svg"
import { Link, useSearchParams } from "react-router-dom"
import { useProducts } from "@/hooks/useProducts"
import { useAuth } from "@/contexts/AuthContext"
import AdminBar from "@/components/AdminBar"
import ProductModal from "@/components/ProductModal"
import TaxonomyModal from "@/components/TaxonomyModal"
import VendedoresModal from "@/components/VendedoresModal"
import MobileBottomNav from "@/components/MobileBottomNav"
import ConfirmDialog from "@/components/ConfirmDialog"
import { supabase } from "@/lib/supabase"
import { useCanonical } from "@/hooks/useCanonical"

const WA_NUMBER_DEFAULT = "5561993177107"
const POR_PAGINA_MOBILE = 24
const POR_PAGINA_DESKTOP = 28

const SETOR_EMOJI = {
  "gastronomia":       "🍽️",
  "mercados-acougues": "🛒",
  "lavanderias":       "🫧",
  "produtos-limpeza":  "🧹",
  "para-o-lar":        "🏠",
  "sustentaveis":      "🌱",
  default:             "🏷️",
}

const getSetorEmoji = (slug) => SETOR_EMOJI[slug] || SETOR_EMOJI.default

const extractStoragePath = (url) => {
  try {
    const marker = "/storage/v1/object/public/produtos/"
    const idx = url.indexOf(marker)
    if (idx === -1) return null
    return decodeURIComponent(url.slice(idx + marker.length))
  } catch { return null }
}

const loadCart = () => {
  try { return JSON.parse(localStorage.getItem("psr_cart")) || [] }
  catch { return [] }
}

// ─── Sidebar section desktop ──────────────────────────────────────────────────
const SidebarSection = ({ title, items, active, onSelect, onClear }) => {
  const activeItem = items.find(i => i.slug === active)
  const visible = active ? (activeItem ? [activeItem] : []) : items
  return (
    <div className="mb-6">
      <p className="text-[11px] font-black text-foreground uppercase tracking-widest mb-2 px-1">{title}</p>
      <div className="space-y-0.5">
        <button onClick={onClear}
          className={`w-full text-left px-2 py-1.5 rounded-lg text-sm transition-colors ${!active ? "text-primary font-semibold bg-primary/8" : "text-muted-foreground hover:text-foreground hover:bg-muted/60"}`}>
          Todos
        </button>
        {visible.map((item) => (
          <button key={item.slug} onClick={() => onSelect(item.slug)}
            className={`w-full text-left px-2 py-1.5 rounded-lg text-sm transition-colors ${active === item.slug ? "text-primary font-semibold bg-primary/8" : "text-muted-foreground hover:text-foreground hover:bg-muted/60"}`}>
            {item.nome}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Paginação desktop ────────────────────────────────────────────────────────
const Paginacao = ({ paginaAtual, totalPaginas, onMudar }) => {
  if (totalPaginas <= 1) return null
  const getPages = () => {
    if (totalPaginas <= 7) return Array.from({ length: totalPaginas }, (_, i) => i + 1)
    const pages = [1]
    if (paginaAtual > 3) pages.push("...")
    const start = Math.max(2, paginaAtual - 1)
    const end = Math.min(totalPaginas - 1, paginaAtual + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (paginaAtual < totalPaginas - 2) pages.push("...")
    pages.push(totalPaginas)
    return pages
  }
  return (
    <div className="flex items-center justify-center gap-1 mt-10">
      <button onClick={() => onMudar(paginaAtual - 1)} disabled={paginaAtual === 1}
        className="flex items-center gap-1 px-3 py-2 rounded-lg border text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted/60 text-muted-foreground">
        <ChevronLeft className="w-4 h-4" /> Anterior
      </button>
      {getPages().map((page, i) =>
        page === "..." ? (
          <span key={`e-${i}`} className="px-2 py-2 text-sm text-muted-foreground select-none">···</span>
        ) : (
          <button key={page} onClick={() => onMudar(page)}
            className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors border ${page === paginaAtual ? "bg-background border-foreground text-foreground font-bold" : "border-transparent text-muted-foreground hover:bg-muted/60 hover:border-border"}`}>
            {page}
          </button>
        )
      )}
      <button onClick={() => onMudar(paginaAtual + 1)} disabled={paginaAtual === totalPaginas}
        className="flex items-center gap-1 px-3 py-2 rounded-lg border text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted/60 text-muted-foreground">
        Próximo <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}

// ─── Card mobile ──────────────────────────────────────────────────────────────
const MobileCard = ({ product, inCart, isAdmin, onEdit, onDelete, onToggleAtivo }) => (
  <Link to={`/catalogo/${product.id}`} onClick={() => sessionStorage.setItem("psr_scroll_y", window.scrollY)} className={`block bg-card rounded-2xl overflow-hidden border border-border/50 active:scale-[0.99] transition-transform relative ${!product.ativo ? "opacity-50" : ""}`}>
    {isAdmin && !product.ativo && (
      <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Inativo</div>
    )}
    <div className="relative w-full aspect-square overflow-hidden bg-muted">
      {product.foto_url ? (
        <img src={product.foto_url} alt={product.nome} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
          <ShoppingBag className="w-12 h-12" />
        </div>
      )}
      {inCart && (
        <div className="absolute top-2 right-2 bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">
          {inCart.qty} na lista
        </div>
      )}
      {product.categoria && (
        <span className="absolute top-2 left-2 bg-white/90 text-primary text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full">
          {product.categoria.nome}
        </span>
      )}
    </div>
    <div className="p-3">
      <h2 className="font-bold text-foreground text-sm leading-snug line-clamp-2">{product.nome}</h2>
      {product.descricao && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{product.descricao}</p>}
    </div>
    {isAdmin && (
      <div className="flex gap-2 px-3 pb-3 border-t border-border/30 pt-2" onClick={(e) => e.preventDefault()}>
        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(product) }}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground border rounded px-2 py-1 transition-colors">
          <Pencil className="w-3 h-3" /> Editar
        </button>
        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleAtivo(product.id, product.ativo) }}
          className={`flex items-center gap-1 text-xs border rounded px-2 py-1 transition-colors ${product.ativo ? "text-amber-600 border-amber-300 hover:bg-amber-50" : "text-emerald-600 border-emerald-300 hover:bg-emerald-50"}`}>
          {product.ativo ? "Desativar" : "Ativar"}
        </button>
        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(product.id) }}
          className="flex items-center gap-1 text-xs text-destructive border border-destructive/30 rounded px-2 py-1 transition-colors">
          <Trash2 className="w-3 h-3" /> Excluir
        </button>
      </div>
    )}
  </Link>
)

// ─── Pills de setor mobile ────────────────────────────────────────────────────
const MobileSetorPills = ({ setores, active, onSelect, onClear }) => {
  const containerRef = useRef(null)

  useEffect(() => {
    if (!active || !containerRef.current) return
    const btn = containerRef.current.querySelector(`[data-slug="${active}"]`)
    if (btn) btn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" })
  }, [active])

  return (
    <div ref={containerRef} className="flex gap-2 overflow-x-auto py-2.5 scrollbar-hide px-4 lg:hidden">
      <button
        onClick={onClear}
        className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
          !active ? "bg-primary text-white border-primary" : "bg-background text-muted-foreground border-border hover:border-primary/40"
        }`}>
        🏪 Todos
      </button>
      {setores.map((s) => (
        <button key={s.slug} data-slug={s.slug} onClick={() => onSelect(s.slug)}
          className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
            active === s.slug ? "bg-primary text-white border-primary" : "bg-background text-muted-foreground border-border hover:border-primary/40"
          }`}>
          {getSetorEmoji(s.slug)} {s.nome}
        </button>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
const Catalogo = () => {
  useCanonical()
  const { isAdmin } = useAuth()
  const { products, categorias, subcategorias, tipos, setores, catSubMap, loading } = useProducts({ includeInactive: isAdmin })
  const [searchParams] = useSearchParams()
  const searchInputRef = useRef(null)

  const [waNumber, setWaNumber] = useState(WA_NUMBER_DEFAULT)
  const [vendedorNome, setVendedorNome] = useState(null)

  useEffect(() => {
    const slugParam = searchParams.get("v")
    if (slugParam) {
      sessionStorage.setItem("psr_vendedor_slug", slugParam)
      supabase.from("vendedores").select("nome, whatsapp").eq("slug", slugParam).eq("ativo", true).single()
        .then(({ data }) => { if (data) { setWaNumber(data.whatsapp); setVendedorNome(data.nome) } })
    } else {
      const slug = sessionStorage.getItem("psr_vendedor_slug")
      if (slug) {
        supabase.from("vendedores").select("nome, whatsapp").eq("slug", slug).eq("ativo", true).single()
          .then(({ data }) => { if (data) { setWaNumber(data.whatsapp); setVendedorNome(data.nome) } })
      }
    }
    // ── Lê setor da URL ──
    const setorParam = searchParams.get("setor")
    if (setorParam) {
      setActiveSetor(setorParam)
      sessionStorage.setItem("psr_setor", setorParam)
    }
  }, [searchParams])

  const [search, setSearch] = useState("")
  const [searchOpen, setSearchOpen] = useState(false)
  const [activeTipo, setActiveTipo] = useState(null)
  const [activeCategoria, setActiveCategoria] = useState(null)
  const [activeSetor, setActiveSetor] = useState(() => sessionStorage.getItem("psr_setor") || null)
  const [paginaMobile, setPaginaMobile] = useState(1)
  const [paginaDesktop, setPaginaDesktop] = useState(() => Number(sessionStorage.getItem("psr_pagina_desktop")) || 1)
  const [cart, setCart] = useState(loadCart)
  const [cartOpen, setCartOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [taxonomyOpen, setTaxonomyOpen] = useState(false)
  const [vendedoresOpen, setVendedoresOpen] = useState(false)
  const [showHelper, setShowHelper] = useState(() => localStorage.getItem("psr_helper_seen") !== "true")
  const [confirmLimpar, setConfirmLimpar] = useState(false)

  const openSearch = () => { setSearchOpen(true); setTimeout(() => searchInputRef.current?.focus(), 50) }
  const closeSearch = () => { setSearchOpen(false); setSearch("") }
  const toggleHelper = () => { if (showHelper) localStorage.setItem("psr_helper_seen", "true"); setShowHelper(v => !v) }

  const handleToggleAtivo = async (id, ativo) => {
    await supabase.from("produtos").update({ ativo: !ativo }).eq("id", id)
    window.location.reload()
  }

  const handleSaved = () => window.location.reload()

  const handleDelete = async (id) => {
    if (!confirm("Excluir este produto?")) return
    const { data: prod } = await supabase.from("produtos").select("foto_url, fotos").eq("id", id).single()
    await supabase.from("produtos").delete().eq("id", id)
    if (prod) {
      const urls = prod.fotos?.length ? prod.fotos : [prod.foto_url].filter(Boolean)
      const paths = urls.map(extractStoragePath).filter(Boolean)
      if (paths.length) await supabase.storage.from("produtos").remove(paths)
    }
    window.location.reload()
  }

  const handleSetorSelect = (slug) => {
    const novo = activeSetor === slug ? null : slug
    setActiveSetor(novo)
    setPaginaMobile(1)
    setPaginaDesktop(1)
    if (novo) sessionStorage.setItem("psr_setor", novo)
    else sessionStorage.removeItem("psr_setor")
  }

  const handleSetorClear = () => {
    setActiveSetor(null)
    setPaginaMobile(1)
    setPaginaDesktop(1)
    sessionStorage.removeItem("psr_setor")
  }

  const filtered = useMemo(() => {
    setPaginaMobile(1)
    return products.filter((p) => {
      const matchTipo = !activeTipo || p.tipo?.slug === activeTipo
      const matchCategoria = !activeCategoria || p.categoria?.slug === activeCategoria
      const matchSetor = !activeSetor || p.produto_setores?.some((ps) => ps.setor?.slug === activeSetor)
      const matchSearch = p.nome.toLowerCase().includes(search.toLowerCase()) ||
        (p.descricao || "").toLowerCase().includes(search.toLowerCase())
      return matchTipo && matchCategoria && matchSetor && matchSearch
    })
  }, [products, search, activeTipo, activeCategoria, activeSetor])

  const setoresDisponiveis = useMemo(() => setores.filter(s =>
    products.some(p => {
      const matchTipo = !activeTipo || p.tipo?.slug === activeTipo
      const matchCat = !activeCategoria || p.categoria?.slug === activeCategoria
      const matchSearch = p.nome.toLowerCase().includes(search.toLowerCase()) || (p.descricao || "").toLowerCase().includes(search.toLowerCase())
      return matchTipo && matchCat && matchSearch && p.produto_setores?.some(ps => ps.setor?.slug === s.slug)
    })
  ), [products, activeTipo, activeCategoria, search, setores])

  const categoriasDisponiveis = useMemo(() => categorias.filter(c =>
    products.some(p => {
      const matchTipo = !activeTipo || p.tipo?.slug === activeTipo
      const matchSetor = !activeSetor || p.produto_setores?.some(ps => ps.setor?.slug === activeSetor)
      const matchSearch = p.nome.toLowerCase().includes(search.toLowerCase()) || (p.descricao || "").toLowerCase().includes(search.toLowerCase())
      return matchTipo && matchSetor && matchSearch && p.categoria?.slug === c.slug
    })
  ), [products, activeTipo, activeSetor, search, categorias])

  const tiposDisponiveis = useMemo(() => tipos.filter(t =>
    products.some(p => {
      const matchCat = !activeCategoria || p.categoria?.slug === activeCategoria
      const matchSetor = !activeSetor || p.produto_setores?.some(ps => ps.setor?.slug === activeSetor)
      const matchSearch = p.nome.toLowerCase().includes(search.toLowerCase()) || (p.descricao || "").toLowerCase().includes(search.toLowerCase())
      return matchCat && matchSetor && matchSearch && p.tipo?.slug === t.slug
    })
  ), [products, activeCategoria, activeSetor, search, tipos])

  const totalPaginasMobile = Math.ceil(filtered.length / POR_PAGINA_MOBILE)
  const produtosVisivelMobile = useMemo(() => filtered.slice(0, paginaMobile * POR_PAGINA_MOBILE), [filtered, paginaMobile])
  const totalPaginasDesktop = Math.ceil(filtered.length / POR_PAGINA_DESKTOP)
  const produtosVisivelDesktop = useMemo(() => filtered.slice((paginaDesktop - 1) * POR_PAGINA_DESKTOP, paginaDesktop * POR_PAGINA_DESKTOP), [filtered, paginaDesktop])

  const activeFiltersCount = [activeTipo, activeCategoria, activeSetor].filter(Boolean).length
  const clearFilters = () => { setActiveTipo(null); setActiveCategoria(null); setActiveSetor(null); setSearch(""); setPaginaMobile(1); setPaginaDesktop(1); sessionStorage.removeItem("psr_pagina_desktop") }
  const mudarPaginaDesktop = (p) => { setPaginaDesktop(p); sessionStorage.setItem("psr_pagina_desktop", p); window.scrollTo({ top: 0, behavior: "smooth" }) }

  // ─── Persistir posição do scroll ─────────────────────────────────────────
  useEffect(() => {
    const savedScroll = sessionStorage.getItem("psr_scroll_y")
    if (savedScroll) {
      requestAnimationFrame(() => {
        window.scrollTo({ top: Number(savedScroll), behavior: "instant" })
        sessionStorage.removeItem("psr_scroll_y")
      })
    }
    const handleBeforeUnload = () => sessionStorage.removeItem("psr_scroll_y")
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [])

  const sentinelaRef = useRef(null)
  useEffect(() => {
    if (!sentinelaRef.current) return
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting && paginaMobile < totalPaginasMobile) setPaginaMobile(p => p + 1) },
      { rootMargin: "200px" }
    )
    observer.observe(sentinelaRef.current)
    return () => observer.disconnect()
  }, [paginaMobile, totalPaginasMobile])

  const addToCart = (e, product) => {
    e.preventDefault(); e.stopPropagation()
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      const next = existing
        ? prev.map((item) => item.id === product.id ? { ...item, qty: item.qty + 1 } : item)
        : [...prev, { id: product.id, nome: product.nome, tipo: product.tipo?.nome, foto_url: product.foto_url, qty: 1 }]
      localStorage.setItem("psr_cart", JSON.stringify(next))
      return next
    })
  }

  const removeItem = (id) => {
    setCart(prev => { const next = prev.filter(i => i.id !== id); localStorage.setItem("psr_cart", JSON.stringify(next)); return next })
  }

  const updateQty = (id, delta) => {
    setCart((prev) => {
      const next = prev.map((item) => item.id === id ? { ...item, qty: Math.max(0, (item.qty || 1) + delta) } : item).filter((item) => item.qty > 0)
      localStorage.setItem("psr_cart", JSON.stringify(next))
      return next
    })
  }

  const totalItems = cart.reduce((sum, item) => sum + (item.qty || 0), 0)

  const sendWhatsApp = () => {
    const linhas = cart.map((item) =>
      `▸ *${item.nome}*\n   Quantidade: ${item.qty} unidade${item.qty > 1 ? "s" : ""}`
    )
    const msg = [
      "🛒 *SOLICITAÇÃO DE ORÇAMENTO*",
      "*PSR Embalagens* — Catálogo Online",
      "",
      "━━━━━━━━━━━━━━━━",
      "📦 *PRODUTOS SELECIONADOS*",
      "",
      linhas.join("\n\n"),
      "",
      "━━━━━━━━━━━━━━━━",
      "📍 Pedido feito pelo catálogo online",
      "🌐 psrembalagens.com.br",
    ].join("\n")
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`, "_blank")
  }

  return (
    <div className="min-h-screen bg-background pb-16 lg:pb-0">
      <AdminBar type="catalogo"
        onNewProduct={() => { setEditingProduct(null); setModalOpen(true) }}
        onSettings={() => setTaxonomyOpen(true)}
        onVendedores={() => setVendedoresOpen(true)}
      />

      {isAdmin && vendedorNome && (
        <div className="bg-[#F5C200] text-[#0d1f3c] px-4 py-1.5 text-xs font-semibold text-center">
          Catálogo do vendedor: {vendedorNome} — os pedidos serão enviados para o WhatsApp dele
        </div>
      )}

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b shadow-sm">
        {/* Desktop */}
        <div className="hidden lg:flex container items-center gap-4 h-16">
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <img src={psrLogo} alt="PSR Embalagens" className="h-9" />
          </Link>
          <div className="flex-1 max-w-xl relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Buscar no catálogo..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full border bg-secondary/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-background text-sm transition-all" />
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Voltar ao site</Link>
            <button onClick={() => setCartOpen(true)} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary transition-colors relative">
              <ShoppingBag className="w-5 h-5" />
              <span className="text-sm font-medium">Carrinho</span>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">{totalItems}</span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile */}
        <div className="lg:hidden h-14 flex items-center px-4 gap-2">
          <AnimatePresence initial={false}>
            {searchOpen ? (
              <motion.div key="search-open" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex items-center gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input ref={searchInputRef} type="text" placeholder="Buscar produtos..." value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-full border bg-secondary/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-background text-sm transition-all" />
                </div>
                <button onClick={closeSearch} className="flex-shrink-0 p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </motion.div>
            ) : (
              <motion.div key="search-closed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex items-center gap-2">
                <Link to="/"><img src={psrLogo} alt="PSR Embalagens" className="h-8 flex-shrink-0" /></Link>
                <button onClick={openSearch} className="flex-1 flex items-center gap-2 px-3 py-2 rounded-full border bg-secondary/50 text-foreground/70 text-sm">
                  <Search className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{search || "Buscar produtos..."}</span>
                </button>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => setSidebarOpen(true)} aria-label="Abrir filtros"
                    className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors relative ${activeFiltersCount > 0 ? "text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
                    <SlidersHorizontal className="w-5 h-5" />
                    {activeFiltersCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />}
                  </button>
                  <button onClick={() => setCartOpen(true)} aria-label="Abrir carrinho"
                    className="w-9 h-9 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors relative">
                    <ShoppingBag className="w-5 h-5" />
                    {totalItems > 0 && (
                      <span className="absolute top-1 right-1 bg-primary text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                        {totalItems > 9 ? "9+" : totalItems}
                      </span>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Pills setor mobile */}
      <div className="lg:hidden border-b bg-background">
        <MobileSetorPills setores={setoresDisponiveis} active={activeSetor} onSelect={handleSetorSelect} onClear={handleSetorClear} />
      </div>

      <main>
      {/* ── DESKTOP: sidebar + conteúdo ── */}
      <div className="hidden lg:block">
        <aside id="sidebar-filtros" className="fixed top-16 bottom-0 overflow-y-auto bg-background z-20 w-56 px-5 py-6"
          style={{ borderRight: "1px solid transparent", transition: "border-color 0.2s" }}
          onScroll={(e) => {
            const el = e.currentTarget
            el.classList.add("is-scrolling")
            el.style.borderRightColor = el.scrollTop > 0 ? "hsl(var(--border))" : "transparent"
            clearTimeout(el._scrollTimer)
            el._scrollTimer = setTimeout(() => el.classList.remove("is-scrolling"), 800)
          }}>
          <style>{`
            #sidebar-filtros::-webkit-scrollbar { width: 1px; }
            #sidebar-filtros::-webkit-scrollbar-track { background: transparent; }
            #sidebar-filtros::-webkit-scrollbar-thumb { background: transparent; border-radius: 99px; }
            #sidebar-filtros.is-scrolling::-webkit-scrollbar-thumb { background: hsl(var(--border)); }
            #sidebar-filtros { scrollbar-width: thin; scrollbar-color: transparent transparent; }
            #sidebar-filtros.is-scrolling { scrollbar-color: hsl(var(--border)) transparent; }
          `}</style>
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm font-bold text-foreground">Filtros</p>
            {activeFiltersCount > 0 && (
              <button onClick={clearFilters} className="text-xs text-destructive hover:underline">Limpar ({activeFiltersCount})</button>
            )}
          </div>
          <div className="h-px bg-border mb-5" />
          <SidebarSection title="Setor" items={setoresDisponiveis} active={activeSetor}
            onSelect={(slug) => { setActiveSetor(slug); setPaginaDesktop(1) }}
            onClear={() => { setActiveSetor(null); setPaginaDesktop(1) }} />
          <div className="h-px bg-border/60 mb-5" />
          <SidebarSection title="Categoria" items={tiposDisponiveis} active={activeTipo}
            onSelect={(slug) => { setActiveTipo(slug); setPaginaDesktop(1) }}
            onClear={() => { setActiveTipo(null); setPaginaDesktop(1) }} />
          <div className="h-px bg-border/60 mb-5" />
          <SidebarSection title="Subcategoria" items={categoriasDisponiveis} active={activeCategoria}
            onSelect={(slug) => { setActiveCategoria(slug); setPaginaDesktop(1) }}
            onClear={() => { setActiveCategoria(null); setPaginaDesktop(1) }} />
        </aside>

        <div className="pl-56 pr-6 py-6 max-w-[1280px] mx-auto">
          <div className="mb-6">
            <span className="text-xs font-semibold text-primary uppercase tracking-widest border border-primary/20 bg-primary/5 px-2 py-0.5 rounded">Catálogo completo</span>
            <h1 className="text-3xl font-bold text-foreground mt-2 mb-1">Explorar Catálogo</h1>
            <p className="text-muted-foreground text-sm mb-3">Encontre embalagens, descartáveis e produtos de limpeza para o seu negócio</p>
            {!loading && (
              <p className="text-sm text-muted-foreground">
                {filtered.length} produto{filtered.length !== 1 ? "s" : ""}
                {activeFiltersCount > 0 && <button onClick={clearFilters} className="ml-2 text-primary hover:underline text-xs">limpar filtros</button>}
              </p>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-card rounded-2xl overflow-hidden animate-pulse">
                  <div className="aspect-square bg-muted" />
                  <div className="p-4 space-y-2"><div className="h-3 bg-muted rounded w-1/3" /><div className="h-4 bg-muted rounded w-2/3" /></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 xl:grid-cols-4 gap-4">
                <AnimatePresence mode="popLayout">
                  {produtosVisivelDesktop.map((product, index) => {
                    const inCart = cart.find((c) => c.id === product.id)
                    return (
                      <motion.div key={product.id} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2, delay: (index % POR_PAGINA_DESKTOP) * 0.02 }}>
                        <Link to={`/catalogo/${product.id}`} onClick={() => sessionStorage.setItem("psr_scroll_y", window.scrollY)} className={`block bg-card rounded-2xl overflow-hidden group hover:shadow-lg transition-all duration-300 border border-transparent hover:border-border relative ${!product.ativo ? "opacity-50" : ""}`}>
                          {isAdmin && !product.ativo && <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Inativo</div>}
                          <div className="aspect-square overflow-hidden relative bg-muted">
                            {product.foto_url
                              ? <img src={product.foto_url} alt={product.nome} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              : <div className="w-full h-full flex items-center justify-center text-muted-foreground/40"><ShoppingBag className="w-10 h-10" /></div>}
                          </div>
                          <div className="p-3.5">
                            {product.categoria && <span className="text-xs font-semibold text-primary uppercase tracking-wide">{product.categoria.nome}</span>}
                            <h2 className="font-semibold text-foreground mt-0.5 leading-snug line-clamp-2">{product.nome}</h2>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{product.descricao}</p>
                            <div className="mt-3 flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">{product.tipo?.nome}</span>
                              <span className="flex items-center gap-1 text-xs font-semibold text-[#1A50A0] group-hover:gap-2 transition-all">Ver produto <ArrowRight className="w-3 h-3" /></span>
                            </div>
                          </div>
                        </Link>
                        {isAdmin && (
                          <div className="flex gap-2 mt-1.5 px-1">
                            <button onClick={() => { setEditingProduct(product); setModalOpen(true) }} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground border rounded px-2 py-1 transition-colors"><Pencil className="w-3 h-3" /> Editar</button>
                            <button onClick={() => handleToggleAtivo(product.id, product.ativo)} className={`flex items-center gap-1 text-xs border rounded px-2 py-1 transition-colors ${product.ativo ? "text-amber-600 border-amber-300 hover:bg-amber-50" : "text-emerald-600 border-emerald-300 hover:bg-emerald-50"}`}>{product.ativo ? "Desativar" : "Ativar"}</button>
                            <button onClick={() => handleDelete(product.id)} className="flex items-center gap-1 text-xs text-destructive border border-destructive/30 rounded px-2 py-1 transition-colors"><Trash2 className="w-3 h-3" /> Excluir</button>
                          </div>
                        )}
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
              <Paginacao paginaAtual={paginaDesktop} totalPaginas={totalPaginasDesktop} onMudar={mudarPaginaDesktop} />
              {filtered.length === 0 && (
                <div className="text-center py-20">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4"><Search className="w-6 h-6 text-muted-foreground" /></div>
                  <p className="text-foreground font-medium">Nenhum produto encontrado</p>
                  <p className="text-sm text-muted-foreground mt-1">Tente outros filtros ou termos de busca</p>
                  <button onClick={clearFilters} className="mt-4 text-sm text-primary hover:underline">Limpar todos os filtros</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── MOBILE ── */}
      <div className="lg:hidden container py-6">
        <div className="mb-4">
          <span className="text-xs font-semibold text-primary uppercase tracking-widest border border-primary/20 bg-primary/5 px-2 py-0.5 rounded">Catálogo completo</span>
          <h1 className="text-2xl font-bold text-foreground mt-2 mb-1">Explorar Catálogo</h1>
          {!loading && (
            <p className="text-sm text-muted-foreground">
              {filtered.length} produto{filtered.length !== 1 ? "s" : ""}
              {activeFiltersCount > 0 && <button onClick={clearFilters} className="ml-2 text-primary hover:underline text-xs">limpar filtros</button>}
            </p>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-card rounded-2xl overflow-hidden animate-pulse border">
                <div className="aspect-square bg-muted" />
                <div className="p-3 space-y-2"><div className="h-4 bg-muted rounded w-3/4" /><div className="h-3 bg-muted rounded w-full" /></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <AnimatePresence mode="popLayout">
                {produtosVisivelMobile.map((product, index) => {
                  const inCart = cart.find((c) => c.id === product.id)
                  return (
                    <motion.div key={product.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2, delay: index < POR_PAGINA_MOBILE ? (index % 6) * 0.03 : 0 }}>
                      <MobileCard product={product} inCart={inCart} isAdmin={isAdmin}
                        onEdit={(p) => { setEditingProduct(p); setModalOpen(true) }}
                        onDelete={handleDelete} onToggleAtivo={handleToggleAtivo} />
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>

            {paginaMobile < totalPaginasMobile && (
              <div ref={sentinelaRef} className="flex justify-center py-8">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/30 animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/30 animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/30 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}

            {filtered.length === 0 && (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4"><Search className="w-6 h-6 text-muted-foreground" /></div>
                <p className="text-foreground font-medium">Nenhum produto encontrado</p>
                <p className="text-sm text-muted-foreground mt-1">Tente outros filtros ou termos de busca</p>
                <button onClick={clearFilters} className="mt-4 text-sm text-primary hover:underline">Limpar todos os filtros</button>
              </div>
            )}
          </>
        )}
      </div>
      </main>

      {/* ── Helper flutuante — desktop e mobile ── */}
      <div className="fixed bottom-20 lg:bottom-6 right-4 lg:right-6 z-40 flex items-end gap-2">
        <AnimatePresence>
          {showHelper && (
            <motion.div
              initial={{ opacity: 0, x: 10, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 10, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="relative bg-background border shadow-lg rounded-2xl rounded-br-sm px-4 py-3 max-w-[240px]"
            >
              <p className="text-sm font-medium text-foreground">Bem-vindo ao catálogo!</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Selecione os produtos e adicione à sua lista. Quando estiver pronto, envie pelo carrinho e entraremos em contato com preços e disponibilidade.</p>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.button
          onClick={toggleHelper}
          aria-label={showHelper ? "Fechar ajuda" : "Abrir ajuda"}
          className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors flex-shrink-0"
          animate={{ rotate: showHelper ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {showHelper ? (
              <motion.span key="x" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} transition={{ duration: 0.15 }}>
                <X className="w-5 h-5" />
              </motion.span>
            ) : (
              <motion.span key="user" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} transition={{ duration: 0.15 }}>
                <User className="w-5 h-5" />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Navbar inferior mobile */}
      <MobileBottomNav onCartOpen={() => setCartOpen(true)} />

      {/* Sidebar filtros mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm lg:hidden" />
            <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-72 bg-background border-r shadow-xl flex flex-col lg:hidden">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="font-bold text-foreground">Filtros</h2>
                <button onClick={() => setSidebarOpen(false)} className="p-2 text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-gray-900 mb-3 px-1">Subcategoria</p>
                  <div className="space-y-1">
                    <button onClick={() => { setActiveCategoria(null); setPaginaMobile(1) }}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${!activeCategoria ? "bg-[#1A50A0] text-white" : "text-gray-500 hover:bg-gray-50"}`}>Todas</button>
                    {categoriasDisponiveis.map((c) => (
                      <button key={c.slug} onClick={() => { setActiveCategoria(c.slug); setPaginaMobile(1); setSidebarOpen(false) }}
                        className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeCategoria === c.slug ? "bg-[#1A50A0] text-white" : "text-gray-500 hover:bg-gray-50"}`}>{c.nome}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-gray-900 mb-3 px-1">Categoria</p>
                  <div className="space-y-1">
                    <button onClick={() => { setActiveTipo(null); setPaginaMobile(1) }}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${!activeTipo ? "bg-[#1A50A0] text-white" : "text-gray-500 hover:bg-gray-50"}`}>Todos</button>
                    {tiposDisponiveis.map((t) => (
                      <button key={t.slug} onClick={() => { setActiveTipo(t.slug); setPaginaMobile(1); setSidebarOpen(false) }}
                        className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTipo === t.slug ? "bg-[#1A50A0] text-white" : "text-gray-500 hover:bg-gray-50"}`}>{t.nome}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-4 border-t flex gap-2">
                {activeFiltersCount > 0 && (
                  <button onClick={() => { clearFilters(); setSidebarOpen(false) }} className="flex-1 py-2.5 rounded-lg border border-destructive/30 text-destructive text-sm">Limpar filtros</button>
                )}
                <button onClick={() => setSidebarOpen(false)} className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm">Ver {filtered.length} produtos</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Carrinho */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCartOpen(false)} className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-background border-l shadow-xl flex flex-col">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="font-bold text-lg text-foreground">Sua Lista ({totalItems})</h2>
                <div className="flex items-center gap-2">
                  {cart.length > 0 && (
                    <button onClick={() => setConfirmLimpar(true)}
                      className="flex items-center gap-1.5 text-xs font-medium text-destructive border border-destructive/30 rounded-lg px-3 py-1.5 hover:bg-destructive/5 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" /> Limpar lista
                    </button>
                  )}
                  <button onClick={() => setCartOpen(false)} className="p-2 text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">Lista vazia. Adicione produtos do catálogo.</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 bg-card rounded-xl p-3 border">
                      {item.foto_url
                        ? <img src={item.foto_url} alt={item.nome} className="w-14 h-14 rounded-lg object-cover" />
                        : <div className="w-14 h-14 rounded-lg bg-muted shrink-0 flex items-center justify-center"><ShoppingBag className="w-5 h-5 text-muted-foreground/30" /></div>}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm truncate">{item.nome}</p>
                        <p className="text-xs text-muted-foreground">{item.tipo}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button onClick={() => removeItem(item.id)} className="w-7 h-7 rounded-full hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center"><Minus className="w-3 h-3" /></button>
                        <span className="text-sm font-bold w-5 text-center">{item.qty || 1}</span>
                        <button onClick={() => updateQty(item.id, 1)} className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center"><Plus className="w-3 h-3" /></button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {cart.length > 0 && (
                <div className="p-4 border-t">
                  <Button onClick={sendWhatsApp} className="w-full gap-2 rounded-xl" size="lg">
                    <Send className="w-5 h-5" /> Enviar lista pelo WhatsApp
                  </Button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {isAdmin && modalOpen && (
        <ProductModal product={editingProduct} categorias={categorias} subcategorias={subcategorias} catSubMap={catSubMap} setores={setores} onClose={() => setModalOpen(false)} onSaved={handleSaved} />
      )}
      {isAdmin && taxonomyOpen && <TaxonomyModal onClose={() => setTaxonomyOpen(false)} />}
      {isAdmin && vendedoresOpen && <VendedoresModal onClose={() => setVendedoresOpen(false)} />}

      <ConfirmDialog
        open={confirmLimpar}
        title="Limpar lista?"
        message="Todos os produtos selecionados serão removidos. Essa ação não pode ser desfeita."
        confirmLabel="Limpar tudo"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={() => { setCart([]); localStorage.removeItem("psr_cart"); setConfirmLimpar(false) }}
        onCancel={() => setConfirmLimpar(false)}
      />
    </div>
  )
}

export default Catalogo