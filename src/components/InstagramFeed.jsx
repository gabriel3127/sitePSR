import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { useRef } from "react"
import { Instagram, ArrowUpRight } from "lucide-react"
import productLar from "@/assets/lar.webp"
import productMercado from "@/assets/mercado.webp"
import productFoodservice from "@/assets/foodservice.webp"
import productFesta from "@/assets/product-festa.webp"
import productBio from "@/assets/bio.webp"
import productLimpeza from "@/assets/product-limpeza.webp"

const INSTAGRAM_URL = "https://www.instagram.com/psrembalagens"

const instagramPosts = [
  { id: 1, caption: "Novidades biodegradáveis 🌿", image: productBio },
  { id: 2, caption: "Entrega rápida no DF 🚚", image: productMercado },
  { id: 3, caption: "Delivery de qualidade 🍔", image: productFoodservice },
  { id: 4, caption: "Festas e eventos 🎉", image: productFesta },
  { id: 5, caption: "Descartáveis profissionais ✨", image: productLar },
  { id: 6, caption: "Limpeza profissional 🧹", image: productLimpeza },
]

// ─── Post card com tilt 3D ────────────────────────────────────────────────────
const PostCard = ({ post, index }) => {
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 300, damping: 30 })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 300, damping: 30 })
  const imgScale = useSpring(1, { stiffness: 300, damping: 30 })

  const handleMouse = (e) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    x.set((e.clientX - rect.left) / rect.width - 0.5)
    y.set((e.clientY - rect.top) / rect.height - 0.5)
    imgScale.set(1.08)
  }
  const handleLeave = () => { x.set(0); y.set(0); imgScale.set(1) }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
    >
      <motion.a
        ref={ref}
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        onMouseMove={handleMouse}
        onMouseLeave={handleLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="aspect-square rounded-2xl overflow-hidden relative group block"
      >
        <motion.img
          src={post.image}
          alt={post.caption}
          className="w-full h-full object-cover"
          style={{ scale: imgScale }}
          loading="lazy"
          width={300}
          height={300}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#0D1B2A]/30 to-transparent" />
        <div className="absolute inset-0 bg-[#0D1B2A]/0 group-hover:bg-[#0D1B2A]/55 transition-colors duration-300" />

        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-3"
          style={{ transform: "translateZ(12px)" }}
        >
          <div className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/30">
            <Instagram className="w-4 h-4 text-white" />
          </div>
          <p className="text-xs font-semibold text-white text-center leading-tight">
            {post.caption}
          </p>
        </div>

        <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-white/20 transition-colors duration-300" />
      </motion.a>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
const InstagramFeed = () => (
  <section className="py-16 md:py-24 bg-[#F7F9FC] relative overflow-hidden">

    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-[#1A50A0]/10 to-transparent" />
      <div className="absolute bottom-0 w-full h-px bg-gradient-to-r from-transparent via-[#1A50A0]/10 to-transparent" />
    </div>

    <div className="container relative">

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#833ab4]/10 via-[#fd1d1d]/10 to-[#fcb045]/10 border border-[#833ab4]/15 mb-5">
          <Instagram className="w-4 h-4 text-[#833ab4]" />
          <span className="text-sm font-semibold text-[#833ab4]">@psrembalagens</span>
        </div>

        <h2 className="text-3xl md:text-4xl font-extrabold text-[#0D1B2A] leading-tight">
          Acompanhe no Instagram
        </h2>
        <p className="mt-3 text-[#718096] leading-relaxed">
          Novidades, promoções e bastidores da PSR Embalagens
        </p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3" style={{ perspective: "1000px" }}>
        {instagramPosts.map((post, i) => (
          <PostCard key={post.id} post={post} index={i} />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="text-center mt-10"
      >
        <motion.a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all"
          style={{ background: "linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)" }}
        >
          <Instagram className="w-4 h-4" />
          Seguir @psrembalagens
          <ArrowUpRight className="w-4 h-4" />
        </motion.a>
      </motion.div>

    </div>
  </section>
)

export default InstagramFeed