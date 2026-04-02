import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { useRef } from "react"
import { ArrowUpRight } from "lucide-react"
import { Link } from "react-router-dom"
import productLar from "@/assets/lar.webp"
import productMercado from "@/assets/mercado.webp"
import productFoodservice from "@/assets/foodservice.webp"
import productFesta from "@/assets/product-festa.jpg"
import productLimpeza from "@/assets/product-limpeza.webp"
import productLavanderia from "@/assets/lavanderia.webp"
import productBio from "@/assets/bio.webp"

// Slugs conforme Supabase (imagem do admin)
const featuredProduct = {
  title: "Gastronomia",
  description: "Embalagens para restaurantes, hamburguerias, padarias, festas e todo tipo de food service. O setor que mais cresce no DF.",
  image: productFoodservice,
  setor: "gastronomia",
  tag: "Mais vendido",
}

const products = [
  {
    title: "Mercados e Açougues",
    description: "Bandejas, filmes e sacolas essenciais para supermercados e açougues.",
    image: productMercado,
    setor: "mercados",
  },
  {
    title: "Lavanderias",
    description: "Embalagens e produtos para lavanderias profissionais.",
    image: productLavanderia,
    setor: "lavanderias",
  },
  {
    title: "Produtos de Limpeza",
    description: "Produtos profissionais de higiene e limpeza para estabelecimentos comerciais.",
    image: productLimpeza,
    setor: "produtos-de-limpeza",
  },
  {
    title: "Para o Lar",
    description: "Descartáveis, utensílios e embalagens para uso residencial e consumo doméstico.",
    image: productLar,
    setor: "para-o-lar",
  },
  {
    title: "Sustentáveis",
    description: "Embalagens biodegradáveis de cana-de-açúcar e materiais ecológicos.",
    image: productBio,
    setor: "sustentaveis",
    tag: "Eco",
  },
  {
    title: "Festas e Eventos",
    description: "Pratos, copos e utensílios descartáveis para eventos e comemorações.",
    image: productFesta,
    setor: "festas-eventos",
  },
]

// ─── Card com tilt 3D ─────────────────────────────────────────────────────────
const TiltCard = ({ product }) => {
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [5, -5]), { stiffness: 300, damping: 30 })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-5, 5]), { stiffness: 300, damping: 30 })
  const imgScale = useSpring(1, { stiffness: 300, damping: 30 })

  const handleMouse = (e) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    x.set((e.clientX - rect.left) / rect.width - 0.5)
    y.set((e.clientY - rect.top) / rect.height - 0.5)
    imgScale.set(1.06)
  }
  const handleLeave = () => { x.set(0); y.set(0); imgScale.set(1) }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className="h-full"
    >
      <Link
        to={`/catalogo?setor=${product.setor}`}
        className="group relative bg-white rounded-2xl overflow-hidden border border-[#E8EDF5] hover:border-[#1A50A0]/20 hover:shadow-xl transition-shadow duration-300 flex flex-col h-full"
      >
        {/* Brilho dinâmico */}
        <motion.div
          className="absolute inset-0 pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
          style={{ background: "radial-gradient(circle at 50% 50%, rgba(26,80,160,0.07) 0%, transparent 55%)" }}
        />

        <div className="aspect-[4/3] overflow-hidden relative">
          <motion.img
            src={product.image}
            alt={`Embalagens ${product.title} - PSR Embalagens Brasília`}
            className="w-full h-full object-cover"
            style={{ scale: imgScale }}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D1B2A]/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {product.tag && (
            <div className="absolute top-3 left-3 bg-[#F5C200] text-[#1A3060] text-[11px] font-bold px-2.5 py-1 rounded-full z-10">
              {product.tag}
            </div>
          )}
          <div className="absolute bottom-3 right-3 w-9 h-9 rounded-xl bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300 z-10">
            <ArrowUpRight className="w-4 h-4 text-[#1A50A0]" />
          </div>
        </div>

        <div className="p-5 flex flex-col flex-1" style={{ transform: "translateZ(8px)" }}>
          <h3 className="font-bold text-[#0D1B2A] text-base leading-snug">{product.title}</h3>
          <p className="text-sm text-[#718096] mt-1.5 leading-relaxed flex-1">{product.description}</p>
          <span className="inline-flex items-center gap-1 mt-4 text-sm font-semibold text-[#1A50A0] group-hover:gap-2 transition-all">
            Ver no Catálogo <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#1A50A0] to-[#F5C200] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
      </Link>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
const ProductGrid = () => (
  <section id="produtos" className="py-16 md:py-28 bg-[#F7F9FC] relative overflow-hidden">

    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-[#1A50A0]/12 to-transparent" />
      <div className="absolute bottom-0 w-full h-px bg-gradient-to-r from-transparent via-[#1A50A0]/12 to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-[0.03]"
        style={{ background: "radial-gradient(circle, #1A50A0 0%, transparent 70%)" }} />
    </div>

    <div className="container relative">

      {/* Cabeçalho */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-14"
      >
        <p className="text-sm font-semibold text-[#1A50A0] tracking-widest uppercase mb-3">
          Nossos Produtos
        </p>
        <h2 className="text-3xl md:text-4xl font-extrabold text-[#0D1B2A] leading-tight">
          Embalagens para todos os segmentos
        </h2>
        <p className="mt-4 text-[#718096] max-w-2xl mx-auto leading-relaxed">
          Ampla seleção de embalagens profissionais com pronta entrega em Brasília.
          Clique em uma categoria para ver o catálogo completo.
        </p>
      </motion.div>

      {/* Layout: 1 card grande + 6 menores */}
      <div className="flex flex-col lg:flex-row gap-5" style={{ perspective: "1200px" }}>

        {/* Card destaque — Gastronomia */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="lg:w-[38%] flex-shrink-0"
        >
          <Link
            to={`/catalogo?setor=${featuredProduct.setor}`}
            className="group relative bg-white rounded-2xl overflow-hidden border border-[#E8EDF5] hover:border-[#1A50A0]/20 hover:shadow-xl transition-shadow duration-300 flex flex-col h-full"
          >
            <div className="flex-1 overflow-hidden relative" style={{ minHeight: "280px" }}>
              <img
                src={featuredProduct.image}
                alt={featuredProduct.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D1B2A]/50 to-transparent" />
              {featuredProduct.tag && (
                <div className="absolute top-4 left-4 bg-[#F5C200] text-[#1A3060] text-xs font-bold px-3 py-1.5 rounded-full">
                  {featuredProduct.tag}
                </div>
              )}
            </div>
            <div className="p-6 flex-shrink-0">
              <h3 className="font-bold text-[#0D1B2A] text-xl leading-tight">{featuredProduct.title}</h3>
              <p className="text-[#718096] mt-2 text-sm leading-relaxed">{featuredProduct.description}</p>
              <span className="inline-flex items-center gap-1.5 mt-5 text-sm font-semibold text-[#1A50A0] group-hover:gap-2.5 transition-all">
                Explorar categoria <ArrowUpRight className="w-4 h-4" />
              </span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#1A50A0] to-[#F5C200] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          </Link>
        </motion.div>

        {/* 6 cards menores — grid 2x3 */}
        <div className="flex-1 grid grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((product, i) => (
            <motion.div
              key={product.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              className="h-full"
            >
              <TiltCard product={product} />
            </motion.div>
          ))}
        </div>

      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="text-center mt-12"
      >
        <Link
          to="/catalogo"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#1A50A0] text-white font-semibold hover:bg-[#153F80] shadow-lg shadow-[#1A50A0]/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
        >
          Ver catálogo completo
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </motion.div>

    </div>
  </section>
)

export default ProductGrid