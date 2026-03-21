import { useState } from "react"
import { useParams, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { ShoppingBag, Plus, Minus, ChevronRight, Check, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import psrLogo from "@/assets/psr-logo.svg"
import { useProduct } from "@/hooks/useProducts"

const CART_KEY = "psr_cart"
const getCart = () => { try { return JSON.parse(localStorage.getItem(CART_KEY)) || [] } catch { return [] } }
const saveCart = (cart) => localStorage.setItem(CART_KEY, JSON.stringify(cart))

const Produto = () => {
  const { id } = useParams()
  const { product, loading } = useProduct(Number(id))

  const [activeImg, setActiveImg] = useState(0)
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
      // Produto sem variações — adiciona qty=1 simples
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
      // Produto com variações — cria um item por combinação selecionada
      // Cada variação selecionada vira um item separado no carrinho com nome + variação
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
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b">
          <div className="container flex items-center justify-between h-16">
            <Link to="/"><img src={psrLogo} alt="PSR Embalagens" className="h-10" /></Link>
          </div>
        </header>
        <div className="container py-8 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-10 animate-pulse">
            <div className="aspect-square bg-muted rounded-2xl" />
            <div className="space-y-4">
              <div className="h-4 bg-muted rounded w-1/4" />
              <div className="h-8 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-2/3" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Produto não encontrado.</p>
        <Link to="/catalogo" className="text-primary font-semibold hover:underline">Voltar ao catálogo</Link>
      </div>
    )
  }

  const imagens = [product.foto_url].filter(Boolean)
  const variacoes = product.variacoes || []

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b">
        <div className="container flex items-center justify-between h-16">
          <Link to="/"><img src={psrLogo} alt="PSR Embalagens" className="h-10" /></Link>
          <Link to="/catalogo" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ShoppingBag className="w-4 h-4" /> Voltar ao catálogo
          </Link>
        </div>
      </header>

      <div className="container py-8 max-w-5xl">
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-foreground transition-colors">Início</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/catalogo" className="hover:text-foreground transition-colors">Catálogo</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground font-medium">{product.nome}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
          <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
            <div className="rounded-2xl overflow-hidden bg-muted aspect-square">
              {imagens[activeImg] ? (
                <img src={imagens[activeImg]} alt={product.nome} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">sem foto</div>
              )}
            </div>
            {imagens.length > 1 && (
              <div className="flex gap-3 mt-3">
                {imagens.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${activeImg === i ? "border-primary" : "border-transparent"}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} className="flex flex-col">
            <span className="inline-block self-start px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wide mb-3">
              {product.tipo?.nome}
            </span>
            <h1 className="text-3xl font-extrabold text-foreground leading-tight">{product.nome}</h1>
            <p className="mt-3 text-muted-foreground leading-relaxed">{product.descricao}</p>

            {variacoes.length > 0 && (
              <div className="mt-6 space-y-6">
                <p className="text-sm font-semibold text-foreground uppercase tracking-wide">Selecione as variações desejadas</p>
                {variacoes.map((v) => (
                  <div key={v.label}>
                    <p className="text-xs font-semibold text-primary mb-2">{v.label}</p>
                    <div className="space-y-2">
                      {v.valores.map((val) => {
                        const key = `${v.label}__${val}`
                        const qty = selecoes[key] || 0
                        return (
                          <div key={val} className={`flex items-center justify-between px-3 py-2 rounded-lg border transition-colors ${qty > 0 ? "border-primary bg-primary/5" : "border-border bg-secondary/30"}`}>
                            <span className="text-sm font-medium text-foreground">{val}</span>
                            <div className="flex items-center gap-2">
                              {qty > 0 && (
                                <>
                                  <button onClick={() => updateSelecao(v.label, val, -1)}
                                    className="w-7 h-7 rounded-md bg-secondary flex items-center justify-center hover:bg-secondary/80">
                                    {qty === 1 ? <Trash2 className="w-3 h-3 text-muted-foreground" /> : <Minus className="w-3 h-3" />}
                                  </button>
                                  <span className="text-sm font-bold w-5 text-center">{qty}</span>
                                </>
                              )}
                              <button onClick={() => updateSelecao(v.label, val, 1)}
                                className="w-7 h-7 rounded-md bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90">
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
              <div className="mt-5 bg-muted rounded-xl px-4 py-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-foreground">Obs:</span> {product.obs}
                </p>
              </div>
            )}

            {totalSelecionado > 0 && (
              <div className="mt-4 bg-primary/5 border border-primary/20 rounded-xl px-4 py-3">
                <p className="text-xs font-semibold text-primary mb-1">Selecionado:</p>
                <ul className="space-y-0.5">
                  {Object.entries(selecoes).map(([key, qty]) => {
                    const [label, valor] = key.split("__")
                    return <li key={key} className="text-xs text-foreground">— {label}: {valor} × {qty}</li>
                  })}
                </ul>
              </div>
            )}

            <div className="mt-6">
              <Button onClick={handleAddToCart} size="lg"
                disabled={variacoes.length > 0 && totalSelecionado === 0}
                className={`w-full gap-2 transition-all ${added ? "bg-green-600 hover:bg-green-600" : "bg-[#1A50A0] hover:bg-[#153F80]"}`}>
                {added ? (
                  <><Check className="w-4 h-4" /> Adicionado à lista!</>
                ) : variacoes.length > 0 && totalSelecionado === 0 ? (
                  <><ShoppingBag className="w-4 h-4" /> Selecione uma variação</>
                ) : (
                  <><ShoppingBag className="w-4 h-4" /> Adicionar à lista{totalSelecionado > 0 ? ` (${totalSelecionado} ${totalSelecionado === 1 ? "item" : "itens"})` : ""}</>
                )}
              </Button>
              <p className="mt-2 text-xs text-muted-foreground text-center">Finalize seu pedido pelo carrinho no catálogo</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Produto