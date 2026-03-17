import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingBag, X, Send, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import psrLogo from "@/assets/psr-logo.svg";
import { Link } from "react-router-dom";

import productDescartaveis from "@/assets/product-descartaveis.jpg";
import productMercado from "@/assets/product-mercado.jpg";
import productLanchonete from "@/assets/product-lanchonete.jpg";
import productFesta from "@/assets/product-festa.jpg";
import productLimpeza from "@/assets/product-limpeza.webp";
import productDiversos from "@/assets/product-diversos.webp";
import productBio from "@/assets/product-bio.jpg";

const WA_NUMBER = "5561993177107";

const categories = [
  "Todos",
  "Descartáveis",
  "Mercados e Açougues",
  "Hamburguerias e Lanchonetes",
  "Festas",
  "Higiene e Limpeza",
  "Diversos",
  "Biodegradáveis",
];

const products = [
  { id: 1, name: "Marmita de Alumínio", category: "Descartáveis", description: "Marmitas descartáveis em diversos tamanhos.", image: productDescartaveis },
  { id: 2, name: "Copo Descartável 200ml", category: "Descartáveis", description: "Copos descartáveis resistentes para bebidas.", image: productDescartaveis },
  { id: 3, name: "Embalagem para Carne", category: "Mercados e Açougues", description: "Bandejas e filmes para açougues.", image: productMercado },
  { id: 4, name: "Sacola Plástica Reforçada", category: "Mercados e Açougues", description: "Sacolas para supermercados e feiras.", image: productMercado },
  { id: 5, name: "Caixa para Hambúrguer", category: "Hamburguerias e Lanchonetes", description: "Embalagem kraft para hambúrgueres artesanais.", image: productLanchonete },
  { id: 6, name: "Saco Kraft para Delivery", category: "Hamburguerias e Lanchonetes", description: "Sacolas kraft para delivery de lanches.", image: productLanchonete },
  { id: 7, name: "Prato Descartável para Festa", category: "Festas", description: "Pratos e talheres descartáveis para eventos.", image: productFesta },
  { id: 8, name: "Copo Temático", category: "Festas", description: "Copos personalizados para festas e eventos.", image: productFesta },
  { id: 9, name: "Detergente Profissional", category: "Higiene e Limpeza", description: "Produtos de limpeza para uso profissional.", image: productLimpeza },
  { id: 10, name: "Papel Toalha Interfolhado", category: "Higiene e Limpeza", description: "Papel toalha para dispensers profissionais.", image: productLimpeza },
  { id: 11, name: "Fita Adesiva", category: "Diversos", description: "Fitas adesivas para embalagens e uso geral.", image: productDiversos },
  { id: 12, name: "Filme Stretch", category: "Diversos", description: "Filme para paletização e proteção.", image: productDiversos },
  { id: 13, name: "Embalagem Biodegradável", category: "Biodegradáveis", description: "Embalagens sustentáveis de cana-de-açúcar.", image: productBio },
  { id: 14, name: "Canudo de Papel", category: "Biodegradáveis", description: "Canudos biodegradáveis ecológicos.", image: productBio },
];

const Catalogo = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchCategory = activeCategory === "Todos" || p.category === activeCategory;
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [search, activeCategory]);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, qty: item.qty + delta } : item))
        .filter((item) => item.qty > 0)
    );
  };

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  const sendWhatsApp = () => {
    const lines = cart.map((item) => `• ${item.name} — Qtd: ${item.qty}`);
    const msg = `Olá! Vim pelo catálogo online e gostaria de solicitar orçamento:\n\n${lines.join("\n")}\n\nPodem me ajudar?`;
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="container flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <img src={psrLogo} alt="PSR Embalagens" className="h-10" />
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Voltar ao site
            </Link>
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 rounded-lg bg-primary text-primary-foreground"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="container py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Catálogo de Produtos</h1>
          <p className="mt-2 text-muted-foreground">
            Selecione os produtos e envie seu pedido direto pelo WhatsApp
          </p>
        </motion.div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filtered.map((product) => {
              const inCart = cart.find((c) => c.id === product.id);
              return (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  className="bg-card rounded-lg shadow-card overflow-hidden group"
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4">
                    <span className="text-xs font-medium text-primary">{product.category}</span>
                    <h3 className="font-semibold text-foreground mt-1">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{product.description}</p>
                    <div className="mt-3 flex items-center gap-2">
                      {inCart ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQty(product.id, -1)}
                            className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center text-secondary-foreground hover:bg-secondary/80"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="text-sm font-semibold text-foreground w-6 text-center">
                            {inCart.qty}
                          </span>
                          <button
                            onClick={() => updateQty(product.id, 1)}
                            className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center text-secondary-foreground hover:bg-secondary/80"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <Button size="sm" onClick={() => addToCart(product)} className="gap-1">
                          <Plus className="w-4 h-4" /> Adicionar
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-12">
            Nenhum produto encontrado. Tente outra busca ou categoria.
          </p>
        )}
      </div>

      {totalItems > 0 && !cartOpen && (
        <motion.button
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          onClick={() => setCartOpen(true)}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-primary text-primary-foreground px-6 py-3 rounded-full shadow-lg flex items-center gap-2 font-semibold sm:hidden"
        >
          <ShoppingBag className="w-5 h-5" />
          Ver lista ({totalItems})
        </motion.button>
      )}

      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCartOpen(false)}
              className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-background border-l shadow-xl flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="font-bold text-lg text-foreground">Sua Lista ({totalItems})</h2>
                <button onClick={() => setCartOpen(false)} className="p-2 text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cart.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">Lista vazia. Adicione produtos do catálogo.</p>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 bg-card rounded-lg p-3 shadow-card">
                      <img src={item.image} alt={item.name} className="w-14 h-14 rounded-md object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.category}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateQty(item.id, -1)}
                          className="w-7 h-7 rounded bg-secondary flex items-center justify-center text-secondary-foreground"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-semibold w-6 text-center text-foreground">{item.qty}</span>
                        <button
                          onClick={() => updateQty(item.id, 1)}
                          className="w-7 h-7 rounded bg-secondary flex items-center justify-center text-secondary-foreground"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {cart.length > 0 && (
                <div className="p-4 border-t">
                  <Button onClick={sendWhatsApp} className="w-full gap-2" size="lg">
                    <Send className="w-5 h-5" />
                    Enviar lista pelo WhatsApp
                  </Button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Catalogo;