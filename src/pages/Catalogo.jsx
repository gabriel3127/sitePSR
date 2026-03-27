import { useState, useMemo, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, ShoppingBag, X, Send, Plus, Minus, Pencil, Trash2, SlidersHorizontal, ChevronDown, User, ArrowRight } from "lucide-react"
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
import { supabase } from "@/lib/supabase"

const WA_NUMBER_DEFAULT = "5561993177107"
const POR_PAGINA = 24
const SIDEBAR_LIMIT = 5

const SETOR_EMOJI = {
  "festas-eventos":             "🎉",
  "hamburguerias-lanchonetes":  "🍔",
  "lavanderias":                "🫧",
  "mercados-acougues":          "🛒",
  "padarias-confeitarias":      "🥐",
  "uso-geral":                  "📦",
  "sustentaveis":               "🌱",
  default:                      "🏷️",
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

// ─── Sidebar section (desktop) ───────────────────────────────────────────────
const SidebarSection = ({ title, items, active, onSelect, onClear }) => {
  const [expanded, setExpanded] = useState(false)
  const activeItem = items.find(i => i.slug === active)
  const visible = active
    ? [activeItem].filter(Boolean)
    : expanded ? items : items.slice(0, SIDEBAR_LIMIT)
  const hasMore = !active && items.length > SIDEBAR_LIMIT

  return (
    <div className="mb-5">
      <div className="flex items-center gap-1.5 mb-2">
        <div className="w-3.5 h-px bg-primary" />
        <div className="w-1 h-1 bg-primary rotate-45" />
        <p className="text-xs font-bold text-foreground uppercase tracking-wider">{title}</p>
      </div>
      <div className="space-y-0.5">
        <button onClick={onClear}
          className={`w-full text-left px-2 py-1.5 rounded text-sm transition-colors ${!active ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"}`}>
          Todos
        </button>
        {visible.map((item) => (
          <button key={item.slug} onClick={() => onSelect(item.slug)}
            className={`w-full text-left px-2 py-1.5 rounded text-sm transition-colors ${active === item.slug ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"}`}>
            {item.nome}
          </button>
        ))}
        {hasMore && (
          <button onClick={() => setExpanded(v => !v)}
            className="flex items-center gap-1 px-2 py-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
            <ChevronDown className={`w-3 h-3 transition-transform ${expanded ? "rotate-180" : ""}`} />
            {expanded ? "Ver menos" : `Ver mais ${items.length - SIDEBAR_LIMIT}`}
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Card mobile (layout vertical com foto grande) ───────────────────────────
const MobileCard = ({ product, inCart, isAdmin, onEdit, onDelete }) => (
  <Link to={`/catalogo/${product.id}`} className="block bg-card rounded-2xl overflow-hidden border border-border/50 active:scale-[0.99] transition-transform">
    {/* foto grande */}
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

    {/* info + botão */}
    <div className="p-3">
      <h3 className="font-bold text-foreground text-sm leading-snug line-clamp-2">{product.nome}</h3>
      {product.descricao && (
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{product.descricao}</p>
      )}
    </div>

    {isAdmin && (
      <div className="flex gap-2 px-3 pb-3 border-t border-border/30 pt-2" onClick={(e) => e.preventDefault()}>
        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(product) }}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground border rounded px-2 py-1 transition-colors">
          <Pencil className="w-3 h-3" /> Editar
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
const MobileSetorPills = ({ setores, active, onSelect, onClear }) => (
  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide px-4 lg:hidden">
    <button onClick={onClear}
      className={`flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
        !active ? "bg-primary text-white border-primary" : "bg-card text-muted-foreground border-border"
      }`}>
      <span className="text-base">🏪</span>
      <span>Todos</span>
    </button>
    {setores.map((s) => (
      <button key={s.slug} onClick={() => onSelect(s.slug)}
        className={`flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
          active === s.slug ? "bg-primary text-white border-primary" : "bg-card text-muted-foreground border-border"
        }`}>
        <span className="text-base">{getSetorEmoji(s.slug)}</span>
        <span className="max-w-[64px] text-center leading-tight line-clamp-2">{s.nome}</span>
      </button>
    ))}
  </div>
)

// ═══════════════════════════════════════════════════════════════════════════════
const Catalogo = () => {
  const { products, tipos, setores, categorias, loading } = useProducts()
  const { isAdmin } = useAuth()
  const [searchParams] = useSearchParams()

  // ─── vendedor via ?v=slug ─────────────────────────────────────────────────
  const [waNumber, setWaNumber] = useState(WA_NUMBER_DEFAULT)
  const [vendedorNome, setVendedorNome] = useState(null)

  useEffect(() => {
    const slugParam = searchParams.get("v")
    const slug = slugParam || sessionStorage.getItem("psr_vendedor_slug")
    if (!slug) return
    // persiste o slug para manter ao navegar entre páginas
    if (slugParam) sessionStorage.setItem("psr_vendedor_slug", slugParam)
    supabase.from("vendedores").select("nome, whatsapp").eq("slug", slug).eq("ativo", true).single()
      .then(({ data }) => {
        if (data) { setWaNumber(data.whatsapp); setVendedorNome(data.nome) }
      })
  }, [searchParams])

  const [search, setSearch] = useState("")
  const [activeTipo, setActiveTipo] = useState(null)
  const [activeCategoria, setActiveCategoria] = useState(null)
  const [activeSetor, setActiveSetor] = useState(null)
  const [pagina, setPagina] = useState(1)
  const [cart, setCart] = useState(loadCart)
  const [cartOpen, setCartOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [taxonomyOpen, setTaxonomyOpen] = useState(false)
  const [vendedoresOpen, setVendedoresOpen] = useState(false)
  const [showHelper, setShowHelper] = useState(() => localStorage.getItem("psr_helper_seen") !== "true")

  const toggleHelper = () => {
    if (showHelper) localStorage.setItem("psr_helper_seen", "true")
    setShowHelper(v => !v)
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

  const filtered = useMemo(() => {
    setPagina(1)
    return products.filter((p) => {
      const matchTipo = !activeTipo || p.tipo?.slug === activeTipo
      const matchCategoria = !activeCategoria || p.categoria?.slug === activeCategoria
      const matchSetor = !activeSetor || p.produto_setores?.some((ps) => ps.setor?.slug === activeSetor)
      const matchSearch =
        p.nome.toLowerCase().includes(search.toLowerCase()) ||
        (p.descricao || "").toLowerCase().includes(search.toLowerCase())
      return matchTipo && matchCategoria && matchSetor && matchSearch
    })
  }, [products, search, activeTipo, activeCategoria, activeSetor])

  const setoresDisponiveis = useMemo(() => {
    return setores.filter(s =>
      products.some(p => {
        const matchTipo = !activeTipo || p.tipo?.slug === activeTipo
        const matchCat = !activeCategoria || p.categoria?.slug === activeCategoria
        const matchSearch = p.nome.toLowerCase().includes(search.toLowerCase()) ||
          (p.descricao || "").toLowerCase().includes(search.toLowerCase())
        return matchTipo && matchCat && matchSearch && p.produto_setores?.some(ps => ps.setor?.slug === s.slug)
      })
    )
  }, [products, activeTipo, activeCategoria, search, setores])

  const categoriasDisponiveis = useMemo(() => {
    return categorias.filter(c =>
      products.some(p => {
        const matchTipo = !activeTipo || p.tipo?.slug === activeTipo
        const matchSetor = !activeSetor || p.produto_setores?.some(ps => ps.setor?.slug === activeSetor)
        const matchSearch = p.nome.toLowerCase().includes(search.toLowerCase()) ||
          (p.descricao || "").toLowerCase().includes(search.toLowerCase())
        return matchTipo && matchSetor && matchSearch && p.categoria?.slug === c.slug
      })
    )
  }, [products, activeTipo, activeSetor, search, categorias])

  const tiposDisponiveis = useMemo(() => {
    return tipos.filter(t =>
      products.some(p => {
        const matchCat = !activeCategoria || p.categoria?.slug === activeCategoria
        const matchSetor = !activeSetor || p.produto_setores?.some(ps => ps.setor?.slug === activeSetor)
        const matchSearch = p.nome.toLowerCase().includes(search.toLowerCase()) ||
          (p.descricao || "").toLowerCase().includes(search.toLowerCase())
        return matchCat && matchSetor && matchSearch && p.tipo?.slug === t.slug
      })
    )
  }, [products, activeCategoria, activeSetor, search, tipos])

  const totalPaginas = Math.ceil(filtered.length / POR_PAGINA)
  const produtosVisiveis = useMemo(() => filtered.slice(0, pagina * POR_PAGINA), [filtered, pagina])
  const activeFiltersCount = [activeTipo, activeCategoria, activeSetor].filter(Boolean).length
  const clearFilters = () => { setActiveTipo(null); setActiveCategoria(null); setActiveSetor(null); setSearch(""); setPagina(1) }

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
    setCart(prev => {
      const next = prev.filter(i => i.id !== id)
      localStorage.setItem("psr_cart", JSON.stringify(next))
      return next
    })
  }

  const updateQty = (id, delta) => {
    setCart((prev) => {
      const next = prev
        .map((item) => item.id === id ? { ...item, qty: Math.max(0, (item.qty || 1) + delta) } : item)
        .filter((item) => item.qty > 0)
      localStorage.setItem("psr_cart", JSON.stringify(next))
      return next
    })
  }

  const totalItems = cart.reduce((sum, item) => sum + (item.qty || 0), 0)

  const sendWhatsApp = () => {
    const lines = cart.map((item) => `• ${item.nome} — Qtd: ${item.qty}`)
    const msg = "Olá! Vim pelo catálogo online da PSR Embalagens e gostaria de solicitar orçamento:\n\n" +
      lines.join("\n") + "\n\nPodem me passar preços e disponibilidade?"
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`, "_blank")
  }

  return (
    <div className="min-h-screen bg-background pb-16 lg:pb-0">
      <AdminBar type="catalogo"
        onNewProduct={() => { setEditingProduct(null); setModalOpen(true) }}
        onSettings={() => setTaxonomyOpen(true)}
        onVendedores={() => setVendedoresOpen(true)}
      />

      {/* banner vendedor ativo — só visível para o admin */}
      {isAdmin && vendedorNome && (
        <div className="bg-[#F5C200] text-[#0d1f3c] px-4 py-1.5 text-xs font-semibold text-center">
          Catálogo do vendedor: {vendedorNome} — os pedidos serão enviados para o WhatsApp dele
        </div>
      )}

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b shadow-sm">

        {/* Desktop: logo + busca centralizada + carrinho (layout original) */}
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
            <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Voltar ao site
            </Link>
            <button onClick={() => setCartOpen(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary transition-colors relative">
              <ShoppingBag className="w-5 h-5" />
              <span className="text-sm font-medium">Carrinho</span>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile: logo + carrinho */}
        <div className="lg:hidden flex container items-center justify-between h-14">
          <Link to="/"><img src={psrLogo} alt="PSR Embalagens" className="h-9" /></Link>
          <button onClick={() => setCartOpen(true)} className="relative p-2 rounded-lg hover:bg-secondary transition-colors">
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {totalItems > 9 ? "9+" : totalItems}
              </span>
            )}
          </button>
        </div>

        {/* Mobile: busca + botão filtros */}
        <div className="lg:hidden px-4 pb-3 flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Buscar produtos..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-full border bg-secondary/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-background text-sm transition-all" />
          </div>
          <button onClick={() => setSidebarOpen(true)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full border text-sm font-medium transition-all ${
              activeFiltersCount > 0 ? "bg-primary text-white border-primary" : "border-border text-muted-foreground"
            }`}>
            <SlidersHorizontal className="w-4 h-4" />
            {activeFiltersCount > 0 && <span>{activeFiltersCount}</span>}
          </button>
        </div>
      </header>

      {/* Pills de setor — só mobile */}
      <div className="lg:hidden py-3 border-b bg-background">
        <MobileSetorPills
          setores={setoresDisponiveis}
          active={activeSetor}
          onSelect={(slug) => { setActiveSetor(slug); setPagina(1) }}
          onClear={() => { setActiveSetor(null); setPagina(1) }}
        />
      </div>

      <div className="container py-6">
        <div className="flex gap-6">

          {/* Sidebar desktop */}
          <aside className="hidden lg:block w-48 flex-shrink-0">
            <div className="sticky top-24">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Filtros</p>
                  {activeFiltersCount > 0 && (
                    <button onClick={clearFilters} className="text-xs text-destructive hover:underline">
                      Limpar ({activeFiltersCount})
                    </button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Refine sua busca</p>
              </div>
              <SidebarSection title="Setor" items={setoresDisponiveis} active={activeSetor}
                onSelect={(slug) => { setActiveSetor(slug); setPagina(1) }}
                onClear={() => { setActiveSetor(null); setPagina(1) }} />
              <SidebarSection title="Categoria" items={categoriasDisponiveis} active={activeCategoria}
                onSelect={(slug) => { setActiveCategoria(slug); setPagina(1) }}
                onClear={() => { setActiveCategoria(null); setPagina(1) }} />
              <SidebarSection title="Material" items={tiposDisponiveis} active={activeTipo}
                onSelect={(slug) => { setActiveTipo(slug); setPagina(1) }}
                onClear={() => { setActiveTipo(null); setPagina(1) }} />
            </div>
          </aside>

          {/* Conteúdo principal */}
          <div className="flex-1 min-w-0">
            <div className="mb-4 lg:mb-6">
              <span className="text-xs font-semibold text-primary uppercase tracking-widest border border-primary/20 bg-primary/5 px-2 py-0.5 rounded">
                Catálogo completo
              </span>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground mt-2 mb-1">Explorar Catálogo</h1>
              <p className="text-muted-foreground text-sm mb-3 hidden lg:block">
                Encontre embalagens, descartáveis e produtos de limpeza para o seu negócio
              </p>
              {!loading && (
                <p className="text-sm text-muted-foreground">
                  {filtered.length} produto{filtered.length !== 1 ? "s" : ""}
                  {activeFiltersCount > 0 && (
                    <button onClick={clearFilters} className="ml-2 text-primary hover:underline text-xs">limpar filtros</button>
                  )}
                </p>
              )}
            </div>

            {loading ? (
              <>
                <div className="grid grid-cols-2 gap-3 lg:hidden">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-card rounded-2xl overflow-hidden animate-pulse border">
                      <div className="aspect-square bg-muted" />
                      <div className="p-3 space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-full" />
                        <div className="h-8 bg-muted rounded-xl w-full mt-1" />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="hidden lg:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="bg-card rounded-2xl overflow-hidden animate-pulse">
                      <div className="aspect-square bg-muted" />
                      <div className="p-4 space-y-2">
                        <div className="h-3 bg-muted rounded w-1/3" />
                        <div className="h-4 bg-muted rounded w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                {/* Mobile: grid 2 colunas */}
                <div className="grid grid-cols-2 gap-3 lg:hidden">
                  <AnimatePresence mode="popLayout">
                    {produtosVisiveis.map((product, index) => {
                      const inCart = cart.find((c) => c.id === product.id)
                      return (
                        <motion.div key={product.id} layout
                          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2, delay: index < POR_PAGINA ? (index % 6) * 0.03 : 0 }}>
                          <MobileCard
                            product={product} inCart={inCart}
                            isAdmin={isAdmin}
                            onEdit={(p) => { setEditingProduct(p); setModalOpen(true) }}
                            onDelete={handleDelete}
                          />
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </div>

                {/* Desktop: grid original */}
                <div className="hidden lg:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  <AnimatePresence mode="popLayout">
                    {produtosVisiveis.map((product, index) => {
                      const inCart = cart.find((c) => c.id === product.id)
                      return (
                        <motion.div key={product.id} layout
                          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2, delay: index < POR_PAGINA ? (index % 8) * 0.03 : 0 }}>
                          <Link to={`/catalogo/${product.id}`}
                            className="block bg-card rounded-2xl overflow-hidden group hover:shadow-lg transition-all duration-300 border border-transparent hover:border-border">
                            <div className="aspect-square overflow-hidden relative bg-muted">
                              {product.foto_url ? (
                                <img src={product.foto_url} alt={product.nome}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground/40">
                                  <ShoppingBag className="w-10 h-10" />
                                </div>
                              )}
                            </div>
                            <div className="p-3.5">
                              {product.categoria && (
                                <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                                  {product.categoria.nome}
                                </span>
                              )}
                              <h3 className="font-semibold text-foreground mt-0.5 leading-snug line-clamp-2">{product.nome}</h3>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{product.descricao}</p>
                              <div className="mt-3 flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">{product.tipo?.nome}</span>
                                <span className="flex items-center gap-1 text-xs font-semibold text-[#1A50A0] group-hover:gap-2 transition-all">
                                  Ver produto <ArrowRight className="w-3 h-3" />
                                </span>
                              </div>
                            </div>
                          </Link>
                          {isAdmin && (
                            <div className="flex gap-2 mt-1.5 px-1">
                              <button onClick={() => { setEditingProduct(product); setModalOpen(true) }}
                                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground border rounded px-2 py-1 transition-colors">
                                <Pencil className="w-3 h-3" /> Editar
                              </button>
                              <button onClick={() => handleDelete(product.id)}
                                className="flex items-center gap-1 text-xs text-destructive border border-destructive/30 rounded px-2 py-1 transition-colors">
                                <Trash2 className="w-3 h-3" /> Excluir
                              </button>
                            </div>
                          )}
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </div>

                {pagina < totalPaginas && (
                  <div className="flex justify-center mt-10">
                    <button onClick={() => setPagina(p => p + 1)}
                      className="flex items-center gap-2 px-8 py-3 rounded-full border-2 border-border text-sm font-semibold text-foreground hover:border-primary hover:text-primary transition-all group">
                      Carregar mais produtos
                      <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                    </button>
                  </div>
                )}

                {filtered.length === 0 && (
                  <div className="text-center py-20">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="text-foreground font-medium">Nenhum produto encontrado</p>
                    <p className="text-sm text-muted-foreground mt-1">Tente outros filtros ou termos de busca</p>
                    <button onClick={clearFilters} className="mt-4 text-sm text-primary hover:underline">
                      Limpar todos os filtros
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Helper flutuante — só desktop */}
      <div className="fixed bottom-6 right-6 z-40 hidden lg:flex items-end gap-2">
        <AnimatePresence>
          {showHelper && (
            <motion.div initial={{ opacity: 0, x: 10, scale: 0.9 }} animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 10, scale: 0.9 }} transition={{ duration: 0.2 }}
              className="bg-background border shadow-lg rounded-2xl rounded-br-sm px-4 py-3 max-w-xs">
              <p className="text-sm font-medium text-foreground">Bem-vindo ao catálogo!</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Selecione os produtos e adicione à sua lista. Quando estiver pronto, envie pelo carrinho e entraremos em contato com preços e disponibilidade.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
        <button onClick={toggleHelper}
          className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors flex-shrink-0">
          <User className="w-5 h-5" />
        </button>
      </div>

      {/* Navbar inferior — só mobile */}
      <MobileBottomNav onCartOpen={() => setCartOpen(true)} />

      {/* Sidebar filtros mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm lg:hidden" />
            <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-72 bg-background border-r shadow-xl flex flex-col lg:hidden">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="font-bold text-foreground">Filtros</h2>
                <button onClick={() => setSidebarOpen(false)} className="p-2 text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-gray-900 mb-3 px-1">Categoria</p>
                  <div className="space-y-1">
                    <button onClick={() => { setActiveCategoria(null); setPagina(1) }}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        !activeCategoria
                          ? "bg-[#1A50A0] text-white"
                          : "text-gray-500 hover:bg-gray-50"
                      }`}>Todas</button>
                    {categoriasDisponiveis.map((c) => (
                      <button key={c.slug} onClick={() => { setActiveCategoria(c.slug); setPagina(1); setSidebarOpen(false) }}
                        className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          activeCategoria === c.slug
                            ? "bg-[#1A50A0] text-white"
                            : "text-gray-500 hover:bg-gray-50"
                        }`}>{c.nome}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-gray-900 mb-3 px-1">Material</p>
                  <div className="space-y-1">
                    <button onClick={() => { setActiveTipo(null); setPagina(1) }}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        !activeTipo
                          ? "bg-[#1A50A0] text-white"
                          : "text-gray-500 hover:bg-gray-50"
                      }`}>Todos</button>
                    {tiposDisponiveis.map((t) => (
                      <button key={t.slug} onClick={() => { setActiveTipo(t.slug); setPagina(1); setSidebarOpen(false) }}
                        className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          activeTipo === t.slug
                            ? "bg-[#1A50A0] text-white"
                            : "text-gray-500 hover:bg-gray-50"
                        }`}>{t.nome}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-4 border-t flex gap-2">
                {activeFiltersCount > 0 && (
                  <button onClick={() => { clearFilters(); setSidebarOpen(false) }}
                    className="flex-1 py-2.5 rounded-lg border border-destructive/30 text-destructive text-sm">
                    Limpar filtros
                  </button>
                )}
                <button onClick={() => setSidebarOpen(false)}
                  className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm">
                  Ver {filtered.length} produtos
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Carrinho */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setCartOpen(false)}
              className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-background border-l shadow-xl flex flex-col">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="font-bold text-lg text-foreground">Sua Lista ({totalItems})</h2>
                <button onClick={() => setCartOpen(false)} className="p-2 text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
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
                      {item.foto_url ? (
                        <img src={item.foto_url} alt={item.nome} className="w-14 h-14 rounded-lg object-cover" />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-muted shrink-0 flex items-center justify-center">
                          <ShoppingBag className="w-5 h-5 text-muted-foreground/30" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm truncate">{item.nome}</p>
                        <p className="text-xs text-muted-foreground">{item.tipo}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button onClick={() => removeItem(item.id)}
                          className="w-7 h-7 rounded-full hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-bold w-5 text-center">{item.qty || 1}</span>
                        <button onClick={() => updateQty(item.id, 1)} className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center">
                          <Plus className="w-3 h-3" />
                        </button>
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
        <ProductModal product={editingProduct} tipos={tipos} setores={setores} categorias={categorias}
          onClose={() => setModalOpen(false)} onSaved={handleSaved} />
      )}
      {isAdmin && taxonomyOpen && (
        <TaxonomyModal onClose={() => setTaxonomyOpen(false)} />
      )}
      {isAdmin && vendedoresOpen && (
        <VendedoresModal onClose={() => setVendedoresOpen(false)} />
      )}
    </div>
  )
}

export default Catalogo