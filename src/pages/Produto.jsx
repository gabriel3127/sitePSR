import { useState } from "react"
import { useParams, Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { ShoppingBag, Plus, Minus, ChevronRight, Check, Trash2, ArrowRight, X, ZoomIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import psrLogo from "@/assets/psr-logo.svg"
import { useProduct, useProducts } from "@/hooks/useProducts"
import MobileBottomNav from "@/components/MobileBottomNav"

const CART_KEY = "psr_cart"
const getCart = () => { try { return JSON.parse(localStorage.getItem(CART_KEY)) || [] } catch { return [] } }
const saveCart = (cart) => localStorage.setItem(CART_KEY, JSON.stringify(cart))

// ─── Lightbox ─────────────────────────────────────────────────────────────────
const Lightbox = ({ images, startIndex, onClose }) => {
  const [current, setCurrent] = useState(startIndex)

  const prev = () => setCurrent((i) => (i - 1 + images.length) % images.length)
  const next = () => setCurrent((i) => (i + 1) % images.length)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* imagem */}
        <motion.img
          key={current}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          src={images[current]}
          alt=""
          className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />

        {/* navegação entre fotos */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prev() }}
              className="absolute left-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-colors"
            >
              ‹
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); next() }}
              className="absolute right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-colors"
            >
              ›
            </button>
            {/* indicadores */}
            <div className="absolute bottom-4 flex gap-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setCurrent(i) }}
                  className={`w-2 h-2 rounded-full transition-colors ${i === current ? "bg-white" : "bg-white/40"}`}
                />
              ))}
            </div>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

// ─── Card de produto relacionado ─────────────────────────────────────────────
const RelatedCard = ({ product }) => (
  <Link
    to={`/catalogo/${product.id}`}
    className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all duration-300"
  >
    <div className="aspect-square overflow-hidden bg-gray-50">
      {product.foto_url ? (
        <img
          src={product.foto_url}
          alt={product.nome}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-300">
          <ShoppingBag className="w-8 h-8" />
        </div>
      )}
    </div>
    <div className="p-3">
      {product.categoria && (
        <span className="text-xs font-semibold text-[#1A50A0] uppercase tracking-wide">
          {product.categoria.nome}
        </span>
      )}
      <h3 className="font-semibold text-gray-900 text-sm mt-0.5 leading-snug line-clamp-2 group-hover:text-[#1A50A0] transition-colors">
        {product.nome}
      </h3>
      {product.tipo && (
        <p className="text-xs text-gray-400 mt-1">{product.tipo.nome}</p>
      )}
    </div>
  </Link>
)

// ─── Seção de relacionados ────────────────────────────────────────────────────
const RelatedProducts = ({ currentProduct, allProducts }) => {
  // pega os setores do produto atual
  const setorSlugs = currentProduct.produto_setores?.map((ps) => ps.setor?.slug).filter(Boolean) || []

  if (setorSlugs.length === 0) return null

  // filtra por mesmo setor, exclui o produto atual, limita a 4
  const related = allProducts
    .filter((p) =>
      p.id !== currentProduct.id &&
      p.produto_setores?.some((ps) => setorSlugs.includes(ps.setor?.slug))
    )
    .slice(0, 4)

  if (related.length === 0) return null

  // nome do primeiro setor para exibir no título
  const setorNome = currentProduct.produto_setores?.[0]?.setor?.nome

  return (
    <section className="mt-16 border-t pt-12">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-xl font-black text-gray-900">Produtos Relacionados</h2>
          <p className="text-sm text-gray-400 mt-1">
            Complete o seu estoque com estes itens
            {setorNome && <span className="text-[#1A50A0] font-medium"> · {setorNome}</span>}
          </p>
        </div>
        <Link
          to="/catalogo"
          className="hidden sm:flex items-center gap-1 text-sm font-semibold text-[#1A50A0] hover:gap-2 transition-all"
        >
          Ver todos <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {related.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <RelatedCard product={p} />
          </motion.div>
        ))}
      </div>
    </section>
  )
}

// ─── Página do produto ────────────────────────────────────────────────────────
const Produto = () => {
  const { id } = useParams()
  const { product, loading } = useProduct(Number(id))
  const { products: allProducts } = useProducts()

  const [activeImg, setActiveImg] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [added, setAdded] = useState(false)
  const [selecoes, setSelecoes] = useState({})

  const updateSelecao = (label, valor, delta) => {
    const key = `${label}__${valor}`
    setSelecoes((prev) => {
      const next = Math.max(0, (prev[key] || 0) + delta)
      if (next === 0) { const { [key]: _, ...rest } = prev; return rest }
      return { ...prev, [key]: next }
    })
  }

  const totalSelecionado = Object.values(selecoes).reduce((sum, qty) => sum + qty, 0)

  const handleAddToCart = () => {
    if (!product) return
    if (variacoes.length > 0 && totalSelecionado === 0) return

    const cart = getCart()

    if (variacoes.length === 0) {
      const existing = cart.find((item) => item.id === product.id)
      let newCart
      if (existing) {
        newCart = cart.map((item) =>
          item.id === product.id ? { ...item, qty: (item.qty || 0) + 1 } : item
        )
      } else {
        newCart = [...cart, {
          id: product.id,
          nome: product.nome,
          tipo: product.tipo?.nome,
          foto_url: product.foto_url,
          qty: 1
        }]
      }
      saveCart(newCart)
    } else {
      const itensParaAdicionar = Object.entries(selecoes)
        .filter(([, qty]) => qty > 0)
        .map(([key, qty]) => {
          const [label, valor] = key.split("__")
          const nomeCompleto = `${product.nome} — ${valor}`
          return {
            id: `${product.id}_${key}`,
            nome: nomeCompleto,
            tipo: product.tipo?.nome,
            foto_url: product.foto_url,
            qty
          }
        })

      let newCart = [...cart]
      itensParaAdicionar.forEach((novo) => {
        const existing = newCart.find((item) => item.id === novo.id)
        if (existing) {
          newCart = newCart.map((item) =>
            item.id === novo.id ? { ...item, qty: item.qty + novo.qty } : item
          )
        } else {
          newCart.push(novo)
        }
      })
      saveCart(newCart)
    }

    setAdded(true)
    setSelecoes({})
    setTimeout(() => setAdded(false), 2500)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
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
              <div className="h-4 bg-gray-200 rounded w-full" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-400">Produto não encontrado.</p>
        <Link to="/catalogo" className="text-[#1A50A0] font-semibold hover:underline">Voltar ao catálogo</Link>
      </div>
    )
  }

  // usa array fotos se existir, senão usa foto_url legado
  const imagens = (product.fotos?.length ? product.fotos : [product.foto_url]).filter(Boolean)
  const variacoes = product.variacoes || []

  return (
    <div className="min-h-screen bg-gray-50 pb-16 lg:pb-0">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b shadow-sm">
        <div className="container flex items-center justify-between h-16">
          <Link to="/"><img src={psrLogo} alt="PSR Embalagens" className="h-10" /></Link>
          <Link to="/catalogo" className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
            <ShoppingBag className="w-4 h-4" /> Voltar ao catálogo
          </Link>
        </div>
      </header>

      <div className="container py-8 max-w-5xl">
        {/* breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-gray-400 mb-8">
          <Link to="/" className="hover:text-gray-700 transition-colors">Início</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/catalogo" className="hover:text-gray-700 transition-colors">Catálogo</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-900 font-medium">{product.nome}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
          {/* galeria */}
          <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
            <div
              className="rounded-2xl overflow-hidden bg-white border aspect-square shadow-sm relative group cursor-zoom-in"
              onClick={() => imagens.length > 0 && setLightboxOpen(true)}
            >
              {imagens[activeImg] ? (
                <img src={imagens[activeImg]} alt={product.nome} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">sem foto</div>
              )}
              {/* ícone lupa */}
              {imagens.length > 0 && (
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-2.5 shadow">
                    <ZoomIn className="w-5 h-5 text-gray-700" />
                  </div>
                </div>
              )}
            </div>
            {imagens.length > 1 && (
              <div className="flex gap-3 mt-3">
                {imagens.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${activeImg === i ? "border-[#1A50A0] shadow-sm" : "border-transparent hover:border-gray-200"}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* detalhes */}
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} className="flex flex-col">
            {product.categoria && (
              <span className="inline-block self-start px-3 py-1 rounded-full bg-[#1A50A0]/10 text-[#1A50A0] text-xs font-bold uppercase tracking-wide mb-3">
                {product.categoria.nome}
              </span>
            )}
            <h1 className="text-3xl font-black text-gray-900 leading-tight">{product.nome}</h1>
            <p className="mt-3 text-gray-500 leading-relaxed">{product.descricao}</p>

            {variacoes.length > 0 && (
              <div className="mt-6 space-y-6">
                <p className="text-sm font-bold text-gray-900 uppercase tracking-wide">Selecione as variações desejadas</p>
                {variacoes.map((v) => (
                  <div key={v.label}>
                    <p className="text-xs font-bold text-[#1A50A0] mb-2">{v.label}</p>
                    <div className="space-y-2">
                      {v.valores.map((val) => {
                        const key = `${v.label}__${val}`
                        const qty = selecoes[key] || 0
                        return (
                          <div key={val} className={`flex items-center justify-between px-3 py-2.5 rounded-xl border transition-colors ${qty > 0 ? "border-[#1A50A0] bg-[#1A50A0]/5" : "border-gray-200 bg-white"}`}>
                            <span className="text-sm font-medium text-gray-900">{val}</span>
                            <div className="flex items-center gap-2">
                              {qty > 0 && (
                                <>
                                  <button onClick={() => updateSelecao(v.label, val, -1)}
                                    className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                                    {qty === 1 ? <Trash2 className="w-3 h-3 text-gray-500" /> : <Minus className="w-3 h-3" />}
                                  </button>
                                  <span className="text-sm font-bold w-5 text-center">{qty}</span>
                                </>
                              )}
                              <button onClick={() => updateSelecao(v.label, val, 1)}
                                className="w-7 h-7 rounded-lg bg-[#1A50A0] text-white flex items-center justify-center hover:bg-[#153f80] transition-colors">
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {product.obs && (
              <div className="mt-5 bg-gray-100 rounded-xl px-4 py-3">
                <p className="text-xs text-gray-500 leading-relaxed">
                  <span className="font-semibold text-gray-700">Obs:</span> {product.obs}
                </p>
              </div>
            )}

            {totalSelecionado > 0 && (
              <div className="mt-4 bg-[#1A50A0]/5 border border-[#1A50A0]/20 rounded-xl px-4 py-3">
                <p className="text-xs font-bold text-[#1A50A0] mb-1">Selecionado:</p>
                <ul className="space-y-0.5">
                  {Object.entries(selecoes).map(([key, qty]) => {
                    const [label, valor] = key.split("__")
                    return <li key={key} className="text-xs text-gray-700">— {label}: {valor} × {qty}</li>
                  })}
                </ul>
              </div>
            )}

            <div className="mt-6">
              <Button onClick={handleAddToCart} size="lg"
                disabled={variacoes.length > 0 && totalSelecionado === 0}
                className={`w-full gap-2 rounded-xl transition-all ${added ? "bg-green-600 hover:bg-green-600" : "bg-[#1A50A0] hover:bg-[#153F80]"}`}>
                {added ? (
                  <><Check className="w-4 h-4" /> Adicionado à lista!</>
                ) : variacoes.length > 0 && totalSelecionado === 0 ? (
                  <><ShoppingBag className="w-4 h-4" /> Selecione uma variação</>
                ) : (
                  <><ShoppingBag className="w-4 h-4" /> Adicionar à lista{totalSelecionado > 0 ? ` (${totalSelecionado} ${totalSelecionado === 1 ? "item" : "itens"})` : ""}</>
                )}
              </Button>
              <p className="mt-2 text-xs text-gray-400 text-center">Finalize seu pedido pelo carrinho no catálogo</p>
            </div>
          </motion.div>
        </div>

        {/* produtos relacionados */}
        <RelatedProducts currentProduct={product} allProducts={allProducts} />
      </div>

      {/* lightbox */}
      {lightboxOpen && (
        <Lightbox
          images={imagens}
          startIndex={activeImg}
          onClose={() => setLightboxOpen(false)}
        />
      )}

      <MobileBottomNav />
    </div>
  )
}

export default Produto