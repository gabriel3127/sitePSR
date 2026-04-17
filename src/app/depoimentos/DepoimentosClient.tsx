"use client"

import { motion } from "framer-motion"
import { Star, ExternalLink, ArrowRight, Sparkles,
  Home, ShoppingBag, BookOpen, MessageSquare
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const reviews = [
  { name: "Carlos Mendes", business: "Hamburgueria Artesanal", setor: "Alimentação", rating: 5, text: "A PSR Embalagens é nossa parceira há mais de 2 anos. As caixas kraft para nossos hambúrgueres são de excelente qualidade e o preço é justo. Entrega sempre no prazo!", avatar: "CM" },
  { name: "Ana Paula Souza", business: "Mercado Bom Preço", setor: "Varejo", rating: 5, text: "Atendimento impecável! Sempre que preciso de reposição urgente de bandejas e sacolas, a PSR resolve rapidamente. Recomendo demais!", avatar: "AP" },
  { name: "Roberto Lima", business: "Restaurante Sabor do Cerrado", setor: "Alimentação", rating: 5, text: "Mudamos para biodegradáveis da PSR e nossos clientes adoraram. Além de ajudar o meio ambiente, a qualidade é superior.", avatar: "RL" },
  { name: "Fernanda Oliveira", business: "Doceria Doce Mel", setor: "Confeitaria", rating: 5, text: "Encontrei tudo o que precisava para minha confeitaria em um só lugar. Embalagens para doces e bolos são lindas e resistentes.", avatar: "FO" },
  { name: "Marcos Vieira", business: "Açougue Premium", setor: "Varejo", rating: 5, text: "Compro bandejas, filme stretch e sacolas há mais de 3 anos. Nunca tive problema com qualidade. A PSR é confiança total!", avatar: "MV" },
  { name: "Juliana Costa", business: "Buffet Festas & Cia", setor: "Eventos", rating: 5, text: "Para eventos de grande porte, preciso de fornecedor confiável. A PSR nunca me deixou na mão, mesmo com pedidos de última hora.", avatar: "JC" },
  { name: "Pedro Santos", business: "Lanchonete do Pedro", setor: "Alimentação", rating: 4, text: "Ótimos preços para quem compra em quantidade. O pessoal é muito atencioso e me ajudou a escolher as embalagens certas para meu delivery.", avatar: "PS" },
  { name: "Maria Helena", business: "Padaria Pão Dourado", setor: "Confeitaria", rating: 5, text: "A variedade de produtos é impressionante. Desde sacos de papel até descartáveis para a área de alimentação, tudo de qualidade.", avatar: "MH" },
]

interface Review {
  name: string
  business: string
  setor: string
  rating: number
  text: string
  avatar: string
}

const ReviewCard = ({ review, index }: { review: Review; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.06 }}
    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 relative flex flex-col gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-300"
  >
    <div className="flex items-center gap-3">
      <div className="w-11 h-11 rounded-full bg-[#1A50A0]/10 flex items-center justify-center text-[#1A50A0] font-bold text-sm shrink-0">
        {review.avatar}
      </div>
      <div className="min-w-0">
        <p className="font-bold text-gray-900 text-sm leading-tight truncate">{review.name}</p>
        <p className="text-xs text-gray-400 truncate">{review.business}</p>
      </div>
    </div>
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, j) => (
        <Star key={j} className={`w-4 h-4 ${j < review.rating ? "fill-[#F5C200] text-[#F5C200]" : "text-gray-200 fill-gray-200"}`} />
      ))}
    </div>
    <p className="text-sm text-gray-500 leading-relaxed flex-1">&ldquo;{review.text}&rdquo;</p>
  </motion.div>
)

export default function DepoimentosClient() {
  return (
    <div className="min-h-screen bg-gray-50 pb-16 lg:pb-0">

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="container flex items-center justify-between h-16">
          <Link href="/">
            <Image src="/images/psr-logo.svg" alt="PSR Embalagens" width={100} height={36} className="h-10 w-auto" />
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <Link href="/" className="hover:text-[#1A50A0] transition-colors">Home</Link>
            <Link href="/blog" className="hover:text-[#1A50A0] transition-colors">Blog</Link>
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
            backgroundSize: "48px 48px",
          }} />
        <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-[#1A50A0]/30 to-transparent" />
        <div className="container relative py-16 md:py-24">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-2xl">
            <span className="inline-flex items-center gap-2 bg-[#F5C200]/20 text-[#F5C200] text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-6">
              <Sparkles className="w-3 h-3" /> Clientes Satisfeitos
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
              O que nossos<br /><span className="text-[#F5C200]">clientes dizem</span>
            </h1>
            <p className="mt-4 text-gray-300 text-lg max-w-lg leading-relaxed">
              Mais de 500 estabelecimentos confiam na PSR Embalagens. Depoimentos reais de quem faz parceria com a gente.
            </p>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-8">
              <a href="https://www.google.com/maps/place/PSR+Embalagens" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full px-5 py-2.5 transition-colors">
                <div className="flex">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-[#F5C200] text-[#F5C200]" />)}
                </div>
                <span className="font-bold text-white">4.9</span>
                <span className="text-sm text-gray-300">no Google Reviews</span>
                <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <main>
        <div className="container py-12">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review, i) => (
              <ReviewCard key={review.name} review={review} index={i} />
            ))}
          </div>

          <footer className="border-t border-gray-200 mt-20 py-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
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