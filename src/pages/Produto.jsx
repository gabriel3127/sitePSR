import { useState, useMemo, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { ShoppingBag, Plus, Minus, ChevronRight, ChevronLeft, Check, Trash2, ArrowRight, X, ZoomIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import psrLogo from "@/assets/psr-logo.svg"
import { useProduct, useProducts } from "@/hooks/useProducts"
import MobileBottomNav from "@/components/MobileBottomNav"

const CART_KEY = "psr_cart"
const getCart = () => { try { return JSON.parse(localStorage.getItem(CART_KEY)) || [] } catch { return [] } }
const saveCart = (cart) => localStorage.setItem(CART_KEY, JSON.stringify(cart))

const getCatalogoUrl = () => {
  const vSlug = sessionStorage.getItem("psr_vendedor_slug")
  return vSlug ? `/catalogo?v=${vSlug}` : "/catalogo"
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────
const Lightbox = ({ images, startIndex, onClose }) => {
  const [current, setCurrent] = useState(startIndex)
  const prev = () => setCurrent(i => (i - 1 + images.length) % images.length)
  const next = () => setCurrent(i => (i + 1) % images.length)
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4" onClick={onClose}>
        <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors">
          <X className="w-6 h-6" />
        </button>
        <motion.img key={current} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }}
          src={images[current]} alt="" className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
          onClick={e => e.stopPropagation()} />
        {images.length > 1 && (
          <>
            <button onClick={e => { e.stopPropagation(); prev() }} className="absolute left-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-3">‹</button>
            <button onClick={e => { e.stopPropagation(); next() }} className="absolute right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-3">›</button>
            <div className="absolute bottom-4 flex gap-2">
              {images.map((_, i) => (
                <button key={i} onClick={e => { e.stopPropagation(); setCurrent(i) }}
                  className={`w-2 h-2 rounded-full transition-colors ${i === current ? "bg-white" : "bg-white/40"}`} />
              ))}
            </div>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

// ─── Produtos relacionados ────────────────────────────────────────────────────
const RelatedCard = ({ product }) => (
  <Link to={`/catalogo/${product.id}`}
    className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all duration-300">
    <div className="aspect-square overflow-hidden bg-gray-50">
      {product.foto_url
        ? <img src={product.foto_url} alt={product.nome} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        : <div className="w-full h-full flex items-center justify-center text-gray-300"><ShoppingBag className="w-8 h-8" /></div>}
    </div>
    <div className="p-3">
      {product.categoria && <span className="text-xs font-semibold text-[#1A50A0] uppercase tracking-wide">{product.categoria.nome}</span>}
      <h3 className="font-semibold text-gray-900 text-sm mt-0.5 leading-snug line-clamp-2 group-hover:text-[#1A50A0] transition-colors">{product.nome}</h3>
    </div>
  </Link>
)

const RelatedProducts = ({ currentProduct, allProducts }) => {
  const setorSlugs = currentProduct.produto_setores?.map(ps => ps.setor?.slug).filter(Boolean) || []
  if (!setorSlugs.length) return null
  const related = allProducts
    .filter(p => p.id !== currentProduct.id && p.produto_setores?.some(ps => setorSlugs.includes(ps.setor?.slug)))
    .slice(0, 4)
  if (!related.length) return null
  const setorNome = currentProduct.produto_setores?.[0]?.setor?.nome
  return (
    <section className="mt-16 border-t pt-12">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-xl font-black text-gray-900">Produtos Relacionados</h2>
          <p className="text-sm text-gray-400 mt-1">
            Complete o seu estoque{setorNome && <span className="text-[#1A50A0] font-medium"> · {setorNome}</span>}
          </p>
        </div>
        <Link to={getCatalogoUrl()} className="hidden sm:flex items-center gap-1 text-sm font-semibold text-[#1A50A0] hover:gap-2 transition-all">
          Ver todos <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {related.map((p, i) => (
          <motion.div key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <RelatedCard product={p} />
          </motion.div>
        ))}
      </div>
    </section>
  )
}

// ─── Parser de variações ──────────────────────────────────────────────────────
// Normaliza QUALQUER formato para {grupos, combinacoes}
const parseVariacoes = (raw) => {
  if (!raw) return { grupos: [], combinacoes: null }
  const data = typeof raw === "string" ? JSON.parse(raw) : raw
  // Formato legado: array de {label, valores, desativados?}
  if (Array.isArray(data)) return { grupos: data, combinacoes: null }
  // Formato novo: {grupos, combinacoes}
  return { grupos: data.grupos || [], combinacoes: data.combinacoes ?? null }
}

// ─── Hook de combinações ──────────────────────────────────────────────────────
const useCombinacoes = (grupos, combinacoes) => {
  const comboSet = useMemo(() => {
    if (combinacoes === null) return null
    return new Set(combinacoes.map(c => c.join("|||")))
  }, [combinacoes])

  const isValueAvailable = (grupoLabel, valor, selecoes) => {
    if (comboSet === null) return true
    const testSel = { ...selecoes, [grupoLabel]: valor }
    const check = (gIdx, partial) => {
      if (gIdx === grupos.length) return comboSet.has(partial.join("|||"))
      const g = grupos[gIdx]
      const fixed = testSel[g.label]
      const candidates = fixed ? [fixed] : g.valores
      return candidates.some(v => check(gIdx + 1, [...partial, v]))
    }
    return check(0, [])
  }

  return { isValueAvailable }
}

// ─── Seletores ────────────────────────────────────────────────────────────────
// Único componente para todos os produtos:
// - Seleção única por grupo (clica no bloco para selecionar, clica de novo para desmarcar)
// - Quantidade aparece abaixo após selecionar todos os grupos
const Seletores = ({ grupos, combinacoes, selecoes, onSelect }) => {
  const { isValueAvailable } = useCombinacoes(grupos, combinacoes)
  return (
    <div className="mt-6 space-y-5">
      <p className="text-sm font-bold text-gray-900 uppercase tracking-wide">Selecione as variações desejadas</p>
      {grupos.map(g => (
        <div key={g.label}>
          <p className="text-xs font-bold text-[#1A50A0] mb-2">{g.label}</p>
          <div className="grid grid-cols-3 gap-1.5">
            {g.valores.map(val => {
              const desativado = (g.desativados || []).includes(val)
              const available = !desativado && isValueAvailable(g.label, val, selecoes)
              const selected = selecoes[g.label] === val
              return (
                <button
                  key={val}
                  onClick={() => available && onSelect(g.label, val)}
                  disabled={!available}
                  className={`w-full px-2 py-2 rounded-lg border text-xs font-medium transition-all text-center ${
                    selected
                      ? "bg-[#1A50A0] text-white border-[#1A50A0]"
                      : available
                      ? "border-gray-200 bg-white text-gray-900 hover:border-[#1A50A0]/50"
                      : "border-gray-100 bg-gray-50 text-gray-300 line-through cursor-not-allowed"
                  }`}>
                  {val}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Página do produto ────────────────────────────────────────────────────────
const Produto = () => {
  const { id } = useParams()
  const { product, loading } = useProduct(Number(id))
  const { products: allProducts } = useProducts()

  useEffect(() => { window.scrollTo(0, 0) }, [id])

  const [activeImg, setActiveImg] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [added, setAdded] = useState(false)
  const [selecao, setSelecao] = useState({})   // {label: valor} — seleção única por grupo
  const [qty, setQty] = useState(1)
  const [cartCount, setCartCount] = useState(() => getCart().reduce((s, i) => s + (i.qty || 0), 0))

  // ── derivações ────────────────────────────────────────────────────────────
  const imagens = useMemo(() =>
    (product?.fotos?.length ? product.fotos : [product?.foto_url]).filter(Boolean)
  , [product])

  const { grupos, combinacoes } = useMemo(() =>
    parseVariacoes(product?.variacoes)
  , [product])

  // foto vinculada à variação selecionada
  const fotoIdxDaSelecao = useMemo(() => {
    const todosSelected = grupos.filter(g => g.valores.length > 0).every(g => selecao[g.label])
    if (!todosSelected) return null
    for (let i = grupos.length - 1; i >= 0; i--) {
      const g = grupos[i]
      const val = selecao[g.label]
      if (val && g.fotos && g.fotos[val] !== undefined) return g.fotos[val]
    }
    return null
  }, [grupos, selecao])

  const imgExibida = fotoIdxDaSelecao !== null ? fotoIdxDaSelecao : activeImg

  // todos os grupos com valores têm seleção?
  const todosGruposSelecionados = grupos.length === 0 || grupos.every(g => selecao[g.label])
  const temVariacoes = grupos.length > 0
  const podeAdicionar = !temVariacoes || todosGruposSelecionados

  const handleSelect = (label, val) => {
    setSelecao(prev => ({
      ...prev,
      [label]: prev[label] === val ? undefined : val  // toggle
    }))
  }

  const handleAddToCart = () => {
    if (!product || !podeAdicionar) return
    const cart = getCart()

    if (temVariacoes) {
      const descricaoCombo = grupos.map(g => `${g.label}: ${selecao[g.label]}`).join(" / ")
      const nomeCompleto = `${product.nome} — ${descricaoCombo}`
      const itemKey = `${product.id}_${JSON.stringify(selecao)}`
      const fotoCarrinho = fotoIdxDaSelecao !== null && imagens[fotoIdxDaSelecao]
        ? imagens[fotoIdxDaSelecao]
        : product.foto_url
      const existing = cart.find(i => i.id === itemKey)
      saveCart(existing
        ? cart.map(i => i.id === itemKey ? { ...i, qty: i.qty + qty } : i)
        : [...cart, { id: itemKey, nome: nomeCompleto, tipo: product.tipo?.nome, foto_url: fotoCarrinho, qty }])
    } else {
      // produto sem variações
      const existing = cart.find(i => i.id === product.id)
      saveCart(existing
        ? cart.map(i => i.id === product.id ? { ...i, qty: (i.qty || 0) + qty } : i)
        : [...cart, { id: product.id, nome: product.nome, tipo: product.tipo?.nome, foto_url: product.foto_url, qty }])
    }

    setCartCount(getCart().reduce((s, i) => s + (i.qty || 0), 0) + qty)
    setAdded(true)
    setSelecao({})
    setQty(1)
    setTimeout(() => setAdded(false), 2500)
  }

  // ── early returns ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-16 lg:pb-0">
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b">
          <div className="container flex items-center justify-between h-16">
            <Link to="/"><img src={psrLogo} alt="PSR Embalagens" className="h-10" /></Link>
          </div>
        </header>
        <div className="container py-8 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-10 animate-pulse">
            <div className="aspect-square bg-gray-200 rounded-2xl" />
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-8 bg-gray-200 rounded w-3/4" />
            </div>
          </div>
        </div>
        <MobileBottomNav />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-400">Produto não encontrado.</p>
        <Link to={getCatalogoUrl()} className="text-[#1A50A0] font-semibold hover:underline">Voltar ao catálogo</Link>
      </div>
    )
  }

  const catalogoUrl = getCatalogoUrl()

  return (
    <div className="min-h-screen bg-gray-50 pb-16 lg:pb-0">

      {/* Toast de confirmação */}
      <AnimatePresence>
        {added && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed bottom-[72px] lg:bottom-8 left-4 right-4 lg:left-1/2 lg:right-auto lg:-translate-x-1/2 lg:w-auto z-50 flex items-center gap-3 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-xl"
          >
            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
              <Check className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-medium whitespace-nowrap">Produto adicionado ao carrinho!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b shadow-sm">
        <div className="container grid grid-cols-3 items-center h-14">
          <Link to={catalogoUrl} className="flex items-center justify-center w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="flex justify-center">
            <img src={psrLogo} alt="PSR Embalagens" className="h-8" />
          </div>
          <div className="flex justify-end">
            <Link to={catalogoUrl} className="relative flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              <div className="relative">
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline">Carrinho</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="container py-8 max-w-5xl">
        <nav className="flex items-center gap-1.5 text-sm text-gray-400 mb-8">
          <Link to="/" className="hover:text-gray-700 transition-colors">Início</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to={catalogoUrl} className="hover:text-gray-700 transition-colors">Catálogo</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-900 font-medium">{product.nome}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-10 lg:gap-16">

          {/* ── Galeria ── */}
          <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
            <div className="rounded-2xl overflow-hidden bg-white border shadow-sm relative group cursor-zoom-in w-full aspect-square"
              onClick={() => imagens.length > 0 && setLightboxOpen(true)}>
              {imagens[imgExibida]
                ? <img src={imagens[imgExibida]} alt={product.nome} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">sem foto</div>}
              {imagens.length > 0 && (
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-2.5 shadow">
                    <ZoomIn className="w-5 h-5 text-gray-700" />
                  </div>
                </div>
              )}
            </div>
            {imagens.length > 1 && (
              <div className="flex justify-center gap-1.5 mt-3">
                {imagens.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`rounded-full transition-all ${
                      imgExibida === i
                        ? "w-2.5 h-2.5 bg-[#1A50A0]"
                        : "w-2 h-2 bg-gray-300 hover:bg-gray-400"
                    }`}
                  />
                ))}
              </div>
            )}
          </motion.div>

          {/* ── Detalhes ── */}
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} className="flex flex-col">
            {product.categoria && (
              <span className="inline-block self-start px-3 py-1 rounded-full bg-[#1A50A0]/10 text-[#1A50A0] text-xs font-bold uppercase tracking-wide mb-3">
                {product.categoria.nome}
              </span>
            )}
            <h1 className="text-3xl font-black text-gray-900 leading-tight">{product.nome}</h1>
            <p className="mt-3 text-gray-500 leading-relaxed">{product.descricao}</p>

            {/* Seletores — único componente para todos os produtos */}
            {temVariacoes && (
              <Seletores
                grupos={grupos}
                combinacoes={combinacoes}
                selecoes={selecao}
                onSelect={handleSelect}
              />
            )}

            {/* Obs */}
            {product.obs && (
              <div className="mt-5 bg-gray-100 rounded-xl px-4 py-3">
                <p className="text-xs text-gray-500 leading-relaxed">
                  <span className="font-semibold text-gray-700">Obs:</span> {product.obs}
                </p>
              </div>
            )}

            {/* Resumo da seleção */}
            {temVariacoes && todosGruposSelecionados && (
              <div className="mt-4 bg-[#1A50A0]/5 border border-[#1A50A0]/20 rounded-xl px-4 py-3">
                <p className="text-xs font-bold text-[#1A50A0] mb-1">Selecionado:</p>
                <ul className="space-y-0.5">
                  {grupos.map(g => selecao[g.label] && (
                    <li key={g.label} className="text-xs text-gray-700">— {g.label}: {selecao[g.label]}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quantidade — aparece só quando tudo selecionado (ou sem variações) */}
            {podeAdicionar && (
              <div className="mt-4 flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">Quantidade:</span>
                <div className="flex items-center gap-2 border border-gray-200 rounded-xl overflow-hidden">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-600">
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-sm font-bold text-gray-900">{qty}</span>
                  <button onClick={() => setQty(q => q + 1)}
                    className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-600">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Botão */}
            <div className="mt-6">
              <Button onClick={handleAddToCart} size="lg" disabled={!podeAdicionar}
                className={`w-full gap-2 rounded-xl transition-all ${added ? "bg-green-600 hover:bg-green-600" : "bg-[#1A50A0] hover:bg-[#153F80]"}`}>
                {added ? (
                  <><Check className="w-4 h-4" /> Adicionado à lista!</>
                ) : !podeAdicionar ? (
                  <><ShoppingBag className="w-4 h-4" /> Selecione as variações</>
                ) : (
                  <><ShoppingBag className="w-4 h-4" /> Adicionar à lista{qty > 1 ? ` (${qty})` : ""}</>
                )}
              </Button>
              <p className="mt-2 text-xs text-gray-400 text-center">Finalize seu pedido pelo carrinho no catálogo</p>
            </div>
          </motion.div>
        </div>

        <RelatedProducts currentProduct={product} allProducts={allProducts} />
      </div>

      {lightboxOpen && <Lightbox images={imagens} startIndex={imgExibida} onClose={() => setLightboxOpen(false)} />}
      <MobileBottomNav />
    </div>
  )
}

export default Produto