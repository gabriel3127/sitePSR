"use client"

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { useRef, useEffect, useState } from "react"
import { ArrowUpRight } from "lucide-react"
import Image from "next/image"

// ─── Ícone Instagram ──────────────────────────────────────────────────────────
const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
)

// ─── Hook: detecta desktop ────────────────────────────────────────────────────
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)")
    setIsDesktop(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])
  return isDesktop
}

const INSTAGRAM_URL = "https://www.instagram.com/psrembalagens"

interface Post {
  id: number
  caption: string
  image: string
  alt: string
}

interface PostCardProps {
  post: Post
  index: number
  isDesktop: boolean
}

const instagramPosts: Post[] = [
  { id: 1, caption: "Novidades biodegradáveis 🌿", image: "/images/bio.webp", alt: "Embalagens biodegradáveis PSR" },
  { id: 2, caption: "Entrega rápida no DF 🚚", image: "/images/mercado.webp", alt: "Embalagens para mercado PSR" },
  { id: 3, caption: "Delivery de qualidade 🍔", image: "/images/foodservice.webp", alt: "Embalagens food service PSR" },
  { id: 4, caption: "Festas e eventos 🎉", image: "/images/product-festa.webp", alt: "Embalagens para festas PSR" },
  { id: 5, caption: "Descartáveis profissionais ✨", image: "/images/lar.webp", alt: "Descartáveis para o lar PSR" },
  { id: 6, caption: "Limpeza profissional 🧹", image: "/images/product-limpeza.webp", alt: "Produtos de limpeza PSR" },
]

// ─── PostCard — tilt + imgScale só no desktop ─────────────────────────────────
// No mobile: card estático com hover CSS — elimina 30 motion values no mount
const PostCard = ({ post, index, isDesktop }: PostCardProps) => {
  const ref = useRef<HTMLAnchorElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 200, damping: 25 })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 200, damping: 25 })
  const imgScale = useSpring(1, { stiffness: 200, damping: 25 })

  const handleMouse = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isDesktop || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    x.set((e.clientX - rect.left) / rect.width - 0.5)
    y.set((e.clientY - rect.top) / rect.height - 0.5)
    imgScale.set(1.08)
  }
  const handleLeave = () => {
    if (!isDesktop) return
    x.set(0); y.set(0); imgScale.set(1)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-20px" }}
      // Delay zerado no mobile — 6 cards entrando ao mesmo tempo
      transition={{ duration: 0.4, delay: isDesktop ? index * 0.07 : 0 }}
    >
      <motion.a
        ref={ref}
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        onMouseMove={handleMouse}
        onMouseLeave={handleLeave}
        style={isDesktop ? { rotateX, rotateY, transformStyle: "preserve-3d" } : {}}
        className="aspect-square rounded-2xl overflow-hidden relative group block"
      >
        <motion.div className="w-full h-full" style={isDesktop ? { scale: imgScale } : {}}>
          <Image
            src={post.image}
            alt={post.alt}
            width={300}
            height={300}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </motion.div>

        <div className="absolute inset-0 bg-gradient-to-t from-[#0D1B2A]/30 to-transparent" />
        <div className="absolute inset-0 bg-[#0D1B2A]/0 group-hover:bg-[#0D1B2A]/55 transition-colors duration-300" />

        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-2
                     opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-3"
          style={isDesktop ? { transform: "translateZ(12px)" } : {}}
        >
          <div className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/30">
            <InstagramIcon className="w-4 h-4 text-white" />
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
const InstagramFeed = () => {
  const isDesktop = useIsDesktop()

  return (
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
            <InstagramIcon className="w-4 h-4 text-[#833ab4]" />
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
            <PostCard key={post.id} post={post} index={i} isDesktop={isDesktop} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-10"
        >
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-white
                       shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
            style={{ background: "linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)" }}
          >
            <InstagramIcon className="w-4 h-4" />
            Seguir @psrembalagens
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}

export default InstagramFeed