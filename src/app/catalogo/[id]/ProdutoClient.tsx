"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ShoppingBag, Plus, Minus, ChevronRight, ChevronLeft,
  Check, Trash2, ArrowRight, X, ZoomIn, Send,
  Truck, ShieldCheck, RefreshCw, MapPin, Phone, Mail,
  Home, BookOpen, MessageSquare
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import type { ProdutoComRelacoes } from "@/lib/types"

const CART_KEY = "psr_cart"

interface CartItem {
  id: number | string
  nome: string
  foto_url: string | null
  qty: number
}

interface Props {
  produto: ProdutoComRelacoes
  todosProdutos: ProdutoComRelacoes[]
}

const getCart = (): CartItem[] => {
  if (typeof window === "undefined") return []
  try { return JSON.parse(localStorage.getItem(CART_KEY) || "[]") } catch { return [] }
}
const saveCart = (cart: CartItem[]) => localStorage.setItem(CART_KEY, JSON.stringify(cart))

// ─── Lightbox ─────────────────────────────────────────────────────────────────
const Lightbox = ({ images, startIndex, onClose }: { images: string[]; startIndex: number; onClose: () => void }) => {
  const [current, setCurrent] = useState(startIndex)
  const prev = () => setCurrent(i => (i - 1 + images.length) % images.length)
  const next = () => setCurrent(i => (i + 1) % images.length)
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4" onClick={onClose}>
        <button onClick={onClose}
          className="absolute top-5 right-5 text-white/60 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2.5 transition-colors z-10">
          <X className="w-5 h-5" />
        </button>
        <motion.img key={current} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }} src={images[current]} alt=""
          className="max-h-[85vh] max-w-[90vw] object-contain rounded-xl shadow-2xl"
          onClick={e => e.stopPropagation()} />
        {images.length > 1 && (
          <>
            <button onClick={e => { e.stopPropagation(); prev() }}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={e => { e.stopPropagation(); next() }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="absolute bottom-5 flex gap-1.5">
              {images.map((_, i) => (
                <button key={i} onClick={e => { e.stopPropagation(); setCurrent(i) }}
                  className={`rounded-full transition-all ${i === current ? "w-5 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/40"}`} />
              ))}
            </div>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

// ─── Parser de variações ──────────────────────────────────────────────────────
interface GrupoVariacao {
  label: string
  valores: string[]
  desativados?: string[]
  fotos?: Record<string, number>
}

interface ParsedVariacoes {
  grupos: GrupoVariacao[]
  combinacoes: string[][] | null
}

const parseVariacoes = (raw: any): ParsedVariacoes => {
  if (!raw) return { grupos: [], combinacoes: null }
  const data = typeof raw === "string" ? JSON.parse(raw) : raw
  if (Array.isArray(data)) return { grupos: data, combinacoes: null }
  return { grupos: data.grupos || [], combinacoes: data.combinacoes ?? null }
}

// ─── Hook de combinações ──────────────────────────────────────────────────────
const useCombinacoes = (grupos: GrupoVariacao[], combinacoes: string[][] | null) => {
  const comboSet = useMemo(() => {
    if (combinacoes === null) return null
    return new Set(combinacoes.map(c => c.join("|||")))
  }, [combinacoes])

  const isValueAvailable = (grupoLabel: string, valor: string, selecoes: Record<string, string>) => {
    if (comboSet === null) return true
    const testSel = { ...selecoes, [grupoLabel]: valor }
    const check = (gIdx: number, partial: string[]): boolean => {
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

// ─── Seletores de variação ────────────────────────────────────────────────────
interface SeletoresProps {
  grupos: GrupoVariacao[]
  combinacoes: string[][] | null
  selecoes: Record<string, string>
  onSelect: (label: string, val: string) => void
}

const Seletores = ({ grupos, combinacoes, selecoes, onSelect }: SeletoresProps) => {
  const { isValueAvailable } = useCombinacoes(grupos, combinacoes)
  return (
    <div className="space-y-5">
      {grupos.map(g => (
        <div key={g.label}>
          <div className="flex items-center gap-2 mb-2.5">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{g.label}</p>
            {selecoes[g.label] && (
              <span className="text-xs font-semibold text-[#1A50A0]">— {selecoes[g.label]}</span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {g.valores.map(val => {
              const desativado = (g.desativados || []).includes(val)
              const available = !desativado && isValueAvailable(g.label, val, selecoes)
              const selected = selecoes[g.label] === val
              return (
                <button key={val} onClick={() => available && onSelect(g.label, val)} disabled={!available}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all ${
                    selected
                      ? "bg-[#1A50A0] text-white border-[#1A50A0] shadow-sm shadow-blue-900/20"
                      : available
                      ? "border-gray-200 bg-white text-gray-700 hover:border-[#1A50A0] hover:text-[#1A50A0]"
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

// ─── Card produto relacionado ─────────────────────────────────────────────────
const RelatedCard = ({ product }: { product: ProdutoComRelacoes }) => (
  <Link href={`/catalogo/${product.id}`}
    className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
    <div className="aspect-square overflow-hidden bg-gray-50 relative">
      {product.foto_url ? (
        <Image src={product.foto_url} alt={product.nome} fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 50vw, 25vw" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-200">
          <ShoppingBag className="w-8 h-8" />
        </div>
      )}
    </div>
    <div className="p-3">
      {product.categorias && (
        <span className="text-[10px] font-bold text-[#1A50A0] uppercase tracking-wider">{product.categorias.nome}</span>
      )}
      <h3 className="font-semibold text-gray-900 text-sm mt-0.5 leading-snug line-clamp-2 group-hover:text-[#1A50A0] transition-colors">
        {product.nome}
      </h3>
    </div>
  </Link>
)

  const Footer = () => (
    <footer className="bg-gray-950 text-gray-400 mt-16">
      <div className="w-full px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="mb-4">
              <Image src="/images/psr-logo.svg" alt="PSR Embalagens" width={90} height={32} className="h-8 w-auto brightness-0 invert opacity-70" />
            </div>
            <p className="text-sm leading-relaxed text-gray-500 mb-5">
              Embalagens, descartáveis e produtos de limpeza para o seu negócio. Qualidade e variedade em um só lugar.
            </p>
            <div className="flex gap-3">
              <a href="https://instagram.com/psrembalagens" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full border border-gray-800 flex items-center justify-center hover:border-gray-600 hover:text-gray-200 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
              <a href="https://facebook.com/psrembalagens" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full border border-gray-800 flex items-center justify-center hover:border-gray-600 hover:text-gray-200 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>
              <a href="https://youtube.com/@psrembalagens" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full border border-gray-800 flex items-center justify-center hover:border-gray-600 hover:text-gray-200 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon fill="white" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
                </svg>
              </a>
            </div>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-300 mb-4">Institucional</p>
            <ul className="space-y-2.5">
              {["Sobre nós", "Política de privacidade", "Termos de uso", "Trabalhe conosco"].map(item => (
                <li key={item}><Link href="#" className="text-sm text-gray-500 hover:text-gray-200 transition-colors">{item}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-300 mb-4">Atendimento</p>
            <ul className="space-y-2.5">
              {["Central de ajuda", "Rastrear pedido", "Trocas e devoluções", "Fale conosco"].map(item => (
                <li key={item}><Link href="#" className="text-sm text-gray-500 hover:text-gray-200 transition-colors">{item}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-300 mb-4">Contato</p>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-gray-500">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-600" />
                <span>SIA Trecho 3, Lote 1.245 — Brasília, DF</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 flex-shrink-0 text-gray-600" />
                <a href="tel:+5561993177107" className="text-sm text-gray-500 hover:text-gray-200 transition-colors">(61) 99317-7107</a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 flex-shrink-0 text-gray-600" />
                <a href="mailto:contato@psrembalagens.com.br" className="text-sm text-gray-500 hover:text-gray-200 transition-colors">contato@psrembalagens.com.br</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-900">
        <div className="w-full px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-600">© {new Date().getFullYear()} PSR Embalagens. Todos os direitos reservados.</p>
          <div className="flex gap-4">
            {["Privacidade", "Cookies", "Termos"].map(item => (
              <Link key={item} href="#" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">{item}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )

// ═══════════════════════════════════════════════════════════════════════════════
export default function ProdutoClient({ produto, todosProdutos }: Props) {
  const [activeImg, setActiveImg] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [added, setAdded] = useState(false)
  const [selecao, setSelecao] = useState<Record<string, string>>({})
  const [qty, setQty] = useState(1)
  const [cartCount, setCartCount] = useState(0)
  const [cartOpen, setCartOpen] = useState(false)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [breadcrumb, setBreadcrumb] = useState<{ tipo: string; slug: string; nome: string } | null>(null)
  const carouselRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const c = getCart()
    setCartItems(c)
    setCartCount(c.reduce((s, i) => s + i.qty, 0))
    window.scrollTo(0, 0)

    const tipo = sessionStorage.getItem("psr_breadcrumb_tipo")
    const slug = sessionStorage.getItem("psr_breadcrumb_slug")
    const nome = sessionStorage.getItem("psr_breadcrumb_nome")
    if (tipo && slug && nome) setBreadcrumb({ tipo, slug, nome })
    else setBreadcrumb(null)
  }, [produto.id])

  const refreshCart = () => {
    const c = getCart()
    setCartItems(c)
    setCartCount(c.reduce((s, i) => s + i.qty, 0))
  }

  const removeFromCart = (itemId: number | string) => {
    const next = getCart().filter(i => i.id !== itemId)
    saveCart(next); refreshCart()
  }

  const updateCartQty = (itemId: number | string, delta: number) => {
    const next = getCart()
      .map(i => i.id === itemId ? { ...i, qty: Math.max(0, i.qty + delta) } : i)
      .filter(i => i.qty > 0)
    saveCart(next); refreshCart()
  }

  const sendWhatsApp = () => {
    const linhas = cartItems.map(item =>
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
    window.open(`https://wa.me/5561993177107?text=${encodeURIComponent(msg)}`, "_blank")
  }

  // ── Derivações ────────────────────────────────────────────────────────────
  const imagens = useMemo(() =>
    (produto.fotos?.length ? produto.fotos : [produto.foto_url]).filter(Boolean) as string[]
  , [produto])

  const { grupos, combinacoes } = useMemo(() => parseVariacoes(produto.variacoes), [produto])

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

  // Sincroniza carrossel mobile quando imgExibida muda (ex: seleção de variação)
  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollTo({
        left: imgExibida * carouselRef.current.offsetWidth,
        behavior: "smooth"
      })
    }
  }, [imgExibida])
  const todosGruposSelecionados = grupos.length === 0 || grupos.every(g => selecao[g.label])
  const temVariacoes = grupos.length > 0
  const podeAdicionar = !temVariacoes || todosGruposSelecionados

  const handleSelect = (label: string, val: string) => {
    setSelecao(prev => ({ ...prev, [label]: prev[label] === val ? "" : val }))
  }

  const handleAddToCart = () => {
    if (!produto || !podeAdicionar) return
    const cart = getCart()
    if (temVariacoes) {
      const descricaoCombo = grupos.map(g => `${g.label}: ${selecao[g.label]}`).join(" / ")
      const nomeCompleto = `${produto.nome} — ${descricaoCombo}`
      const itemKey = `${produto.id}_${JSON.stringify(selecao)}`
      const fotoCarrinho = fotoIdxDaSelecao !== null && imagens[fotoIdxDaSelecao]
        ? imagens[fotoIdxDaSelecao] : produto.foto_url
      const existing = cart.find(i => i.id === itemKey)
      saveCart(existing
        ? cart.map(i => i.id === itemKey ? { ...i, qty: i.qty + qty } : i)
        : [...cart, { id: itemKey, nome: nomeCompleto, foto_url: fotoCarrinho, qty }])
    } else {
      const existing = cart.find(i => i.id === produto.id)
      saveCart(existing
        ? cart.map(i => i.id === produto.id ? { ...i, qty: i.qty + qty } : i)
        : [...cart, { id: produto.id, nome: produto.nome, foto_url: produto.foto_url, qty }])
    }
    refreshCart()
    setAdded(true)
    setSelecao({})
    setQty(1)
    setTimeout(() => setAdded(false), 2500)
  }

  // ── Produtos relacionados ─────────────────────────────────────────────────
  const setorSlugs = produto.produto_setores?.map(ps => ps.setores?.slug).filter(Boolean) || []
  const relacionados = todosProdutos
    .filter(p => p.id !== produto.id && p.produto_setores?.some(ps => setorSlugs.includes(ps.setores?.slug)))
    .slice(0, 4)
  const setorNome = produto.produto_setores?.[0]?.setores?.nome

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">

      {/* Toast */}
      <AnimatePresence>
        {added && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed bottom-[76px] lg:bottom-8 left-4 right-4 lg:left-auto lg:right-8 lg:w-auto z-50 flex items-center gap-3 bg-gray-950 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-white/5"
          >
            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
              <Check className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold">Adicionado à lista!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="container h-14 flex items-center justify-between gap-4">
          {/* Voltar */}
          <Link href="/catalogo"
            className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Voltar ao catálogo</span>
          </Link>

          {/* Logo */}
          <Link href="/" className="absolute left-1/2 -translate-x-1/2">
            <Image src="/images/psr-logo.svg" alt="PSR Embalagens" width={90} height={32} className="h-8 w-auto" />
          </Link>

          {/* Carrinho */}
          <button onClick={() => { refreshCart(); setCartOpen(true) }}
            className="flex items-center gap-2 pl-3 pr-4 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-600 hover:border-gray-300 hover:text-gray-900 transition-all relative">
            <div className="relative">
              <ShoppingBag className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#1A50A0] text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center sm:hidden">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline">Carrinho</span>
            {cartCount > 0 && (
              <span className="hidden sm:flex bg-[#1A50A0] text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      <div className="container py-6 max-w-6xl">

         <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6">
          <Link href="/catalogo" className="hover:text-gray-700 transition-colors">Catálogo</Link>

          {breadcrumb && (
            <>
              <ChevronRight className="w-3 h-3" />
              <Link
                href={`/catalogo?${breadcrumb.tipo}=${breadcrumb.slug}`}
                className="hover:text-gray-700 transition-colors"
              >
                {breadcrumb.nome}
              </Link>
            </>
          )}

          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-700 font-medium truncate max-w-[200px]">{produto.nome}</span>
        </nav>

        {/* ── Grid principal ── */}
        <div className="grid lg:grid-cols-2 gap-8 xl:gap-14">

          {/* ── Galeria ── */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>

            {/* ── MOBILE: carrossel com swipe + bolhinhas ── */}
            <div className="lg:hidden">
              <div
                ref={carouselRef}
                className="flex overflow-x-auto snap-x snap-mandatory rounded-2xl border border-gray-100 shadow-sm bg-white"
                style={{ scrollbarWidth: "none" }}
                onScroll={e => {
                  const el = e.currentTarget
                  const idx = Math.round(el.scrollLeft / el.offsetWidth)
                  setActiveImg(idx)
                }}
              >
                {imagens.length > 0 ? imagens.map((img, i) => (
                  <div key={i} className="relative w-full flex-shrink-0 snap-center aspect-square"
                    onClick={() => setLightboxOpen(true)}>
                    <Image src={img} alt={produto.nome} fill className="object-cover"
                      sizes="100vw" priority={i === 0} />
                    {/* Badge categoria só na primeira */}
                    {i === 0 && produto.categorias && (
                      <div className="absolute top-3 left-3">
                        <span className="bg-white/90 backdrop-blur-sm text-[#1A50A0] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-[#1A50A0]/10 shadow-sm">
                          {produto.categorias.nome}
                        </span>
                      </div>
                    )}
                    {/* Zoom hint */}
                    <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm border border-gray-100 rounded-full p-2 shadow">
                      <ZoomIn className="w-4 h-4 text-gray-600" />
                    </div>
                  </div>
                )) : (
                  <div className="relative w-full flex-shrink-0 snap-center aspect-square flex items-center justify-center text-gray-200">
                    <ShoppingBag className="w-16 h-16" />
                  </div>
                )}
              </div>

              {/* Bolhinhas */}
              {imagens.length > 1 && (
                <div className="flex justify-center gap-1.5 mt-3">
                  {imagens.map((_, i) => (
                    <button key={i}
                      onClick={() => {
                        carouselRef.current?.scrollTo({ left: i * (carouselRef.current?.offsetWidth ?? 0), behavior: "smooth" })
                        setActiveImg(i)
                      }}
                      className={`rounded-full transition-all duration-300 ${
                        imgExibida === i ? "w-5 h-1.5 bg-[#1A50A0]" : "w-1.5 h-1.5 bg-gray-300"
                      }`} />
                  ))}
                </div>
              )}
            </div>

            {/* ── DESKTOP: imagem principal + thumbnails ── */}
            <div className="hidden lg:block">
              <div
                className="relative rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm aspect-square cursor-zoom-in group"
                onClick={() => imagens.length > 0 && setLightboxOpen(true)}
              >
                {imagens[imgExibida] ? (
                  <Image src={imagens[imgExibida]} alt={produto.nome} fill
                    className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    sizes="50vw" priority />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-200">
                    <ShoppingBag className="w-16 h-16" />
                  </div>
                )}
                {imagens.length > 0 && (
                  <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm border border-gray-100 rounded-full p-2 shadow opacity-0 group-hover:opacity-100 transition-opacity">
                    <ZoomIn className="w-4 h-4 text-gray-600" />
                  </div>
                )}
                {produto.categorias && (
                  <div className="absolute top-3 left-3">
                    <span className="bg-white/90 backdrop-blur-sm text-[#1A50A0] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-[#1A50A0]/10 shadow-sm">
                      {produto.categorias.nome}
                    </span>
                  </div>
                )}
              </div>

              {imagens.length > 1 && (
                <div className="relative mt-3 group/carousel">
                  {activeImg > 0 && (
                    <button onClick={() => setActiveImg(i => Math.max(0, i - 1))}
                      className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white border border-gray-200 shadow flex items-center justify-center hover:bg-gray-50 transition-all opacity-0 group-hover/carousel:opacity-100">
                      <ChevronLeft className="w-4 h-4 text-gray-600" />
                    </button>
                  )}
                  {activeImg < imagens.length - 1 && (
                    <button onClick={() => setActiveImg(i => Math.min(imagens.length - 1, i + 1))}
                      className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white border border-gray-200 shadow flex items-center justify-center hover:bg-gray-50 transition-all opacity-0 group-hover/carousel:opacity-100">
                      <ChevronRight className="w-4 h-4 text-gray-600" />
                    </button>
                  )}
                  <div className="flex gap-2 overflow-x-auto px-1 pb-1 scroll-smooth" style={{ scrollbarWidth: "none" }}>
                    {imagens.map((img, i) => (
                      <button key={i} onClick={() => setActiveImg(i)}
                        className={`relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                          imgExibida === i
                            ? "border-[#1A50A0] shadow-md shadow-blue-900/15"
                            : "border-transparent hover:border-gray-200 opacity-60 hover:opacity-100"
                        }`}>
                        <Image src={img} alt="" fill className="object-cover" sizes="64px" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </motion.div>

          {/* ── Detalhes ── */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.08 }}
            className="flex flex-col">

            {/* Nome */}
            <h1 className="text-2xl lg:text-3xl font-black text-gray-900 leading-tight tracking-tight">
              {produto.nome}
            </h1>

            {/* Descrição */}
            {produto.descricao && (
              <p className="mt-3 text-gray-500 text-sm leading-relaxed">
                {produto.descricao}
              </p>
            )}

            {/* Divider */}
            <div className="h-px bg-gray-100 my-5" />

            {/* Variações */}
            {temVariacoes && (
              <div className="mb-5">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                  Selecione as variações
                </p>
                <Seletores grupos={grupos} combinacoes={combinacoes} selecoes={selecao} onSelect={handleSelect} />
              </div>
            )}

            {/* Obs */}
            {produto.obs && (
              <div className="mb-5 flex gap-2.5 bg-amber-50 border border-amber-100 rounded-xl px-3.5 py-3">
                <span className="text-amber-400 text-sm mt-px flex-shrink-0">ℹ</span>
                <p className="text-xs text-amber-700 leading-relaxed">
                  <span className="font-semibold">Obs:</span> {produto.obs}
                </p>
              </div>
            )}

            {/* Resumo da seleção */}
            <AnimatePresence>
              {temVariacoes && todosGruposSelecionados && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }} className="mb-5 overflow-hidden">
                  <div className="bg-[#1A50A0]/5 border border-[#1A50A0]/15 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Check className="w-3.5 h-3.5 text-[#1A50A0]" />
                      <p className="text-xs font-bold text-[#1A50A0]">Variações selecionadas</p>
                    </div>
                    <p className="text-xs text-gray-600">
                      {grupos.map(g => selecao[g.label] && `${g.label}: ${selecao[g.label]}`).filter(Boolean).join(" · ")}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quantidade + CTA */}
            <div className="mt-auto">
              {/* Qty selector */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Quantidade</span>
                <div className="flex items-center gap-0 border border-gray-200 rounded-xl overflow-hidden bg-white">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-500 border-r border-gray-100">
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-12 text-center text-sm font-bold text-gray-900">{qty}</span>
                  <button onClick={() => setQty(q => q + 1)}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-500 border-l border-gray-100">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Botão principal */}
              <button onClick={handleAddToCart} disabled={!podeAdicionar}
                className={`w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl font-bold text-sm transition-all duration-200 ${
                  added
                    ? "bg-green-600 text-white shadow-lg shadow-green-900/20"
                    : podeAdicionar
                    ? "bg-[#1A50A0] text-white hover:bg-[#153F80] shadow-lg shadow-blue-900/20 active:scale-[0.99]"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}>
                {added ? (
                  <><Check className="w-4 h-4" /> Adicionado à lista!</>
                ) : !podeAdicionar ? (
                  <><ShoppingBag className="w-4 h-4" /> Selecione as variações acima</>
                ) : (
                  <><ShoppingBag className="w-4 h-4" /> Adicionar à lista{qty > 1 ? ` (${qty})` : ""}</>
                )}
              </button>

              <p className="mt-2.5 text-center text-xs text-gray-400">
                Finalize seu pedido pelo carrinho no catálogo
              </p>
            </div>
          </motion.div>
        </div>

        {/* ── Produtos relacionados ── */}
        {relacionados.length > 0 && (
          <section className="mt-16 pt-12 border-t border-gray-200">
            <div className="flex items-end justify-between mb-6">
              <div>
                <h2 className="text-lg font-black text-gray-900">Produtos Relacionados</h2>
                <p className="text-sm text-gray-400 mt-0.5">
                  Complete o seu estoque
                  {setorNome && <span className="text-[#1A50A0] font-medium"> · {setorNome}</span>}
                </p>
              </div>
              <Link href="/catalogo"
                className="hidden sm:flex items-center gap-1 text-sm font-semibold text-[#1A50A0] hover:gap-2 transition-all">
                Ver todos <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relacionados.map((p, i) => (
                <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}>
                  <RelatedCard product={p} />
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ── Carrinho drawer ── */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setCartOpen(false)} className="fixed inset-0 bottom-16 lg:bottom-0 z-[60] bg-black/20 backdrop-blur-sm" />

            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="fixed right-0 top-0 bottom-16 lg:bottom-0 z-[60] w-full max-w-md bg-white shadow-2xl flex flex-col">

              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <div>
                  <h2 className="font-bold text-gray-900">Sua Lista</h2>
                  <p className="text-xs text-gray-400">{cartItems.reduce((s, i) => s + i.qty, 0)} item(s)</p>
                </div>
                <button onClick={() => setCartOpen(false)} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
                {cartItems.length === 0 ? (
                  <div className="text-center py-16">
                    <ShoppingBag className="w-10 h-10 text-gray-100 mx-auto mb-3" />
                    <p className="text-sm text-gray-400">Lista vazia. Adicione produtos.</p>
                  </div>
                ) : cartItems.map(item => (
                  <div key={String(item.id)} className="flex items-center gap-3 bg-gray-50 rounded-2xl p-3">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-white border border-gray-100">
                      {item.foto_url
                        ? <Image src={item.foto_url} alt={item.nome} fill className="object-cover" sizes="56px" />
                        : <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="w-5 h-5 text-gray-200" /></div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 leading-tight line-clamp-2 mb-2">{item.nome}</p>
                      <div className="flex items-center justify-between">
                        <button onClick={() => removeFromCart(item.id)}
                          className="text-gray-300 hover:text-red-500 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <div className="flex items-center gap-2 bg-white rounded-full border border-gray-100 px-2 py-1">
                          <button onClick={() => updateCartQty(item.id, -1)}
                            className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-700">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold text-gray-800 w-4 text-center">{item.qty}</span>
                          <button onClick={() => updateCartQty(item.id, 1)}
                            className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-700">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {cartItems.length > 0 && (
                <div className="p-4 border-t border-gray-100">
                  <button onClick={sendWhatsApp}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#1A50A0] text-white font-bold hover:bg-[#153F80] transition-colors">
                    <Send className="w-4 h-4" /> Enviar lista pelo WhatsApp
                  </button>
                  <button onClick={() => setCartOpen(false)}
                    className="w-full py-2.5 rounded-2xl border border-gray-200 text-gray-500 text-sm font-medium hover:bg-gray-50 transition-colors">
                    Continuar comprando
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {lightboxOpen && <Lightbox images={imagens} startIndex={imgExibida} onClose={() => setLightboxOpen(false)} />}

      {/* Footer — oculto no mobile */}
      <div className="hidden lg:block">
        <Footer />
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 flex items-center lg:hidden">
        {[
          { label: "Início",      href: "/",            icon: Home },
          { label: "Catálogo",    href: "/catalogo",    icon: ShoppingBag },
          { label: "Blog",        href: "/blog",        icon: BookOpen },
          { label: "Depoimentos", href: "/depoimentos", icon: MessageSquare },
        ].map(({ label, href, icon: Icon }) => (
          <Link key={href} href={href}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors ${
              href === "/catalogo" ? "text-[#1A50A0]" : "text-gray-400 hover:text-gray-600"
            }`}>
            <Icon className="w-5 h-5" />
            <span className={`text-[10px] ${href === "/catalogo" ? "font-bold" : "font-medium"}`}>{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}