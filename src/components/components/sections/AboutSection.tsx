"use client"

import { motion, useMotionValue, useSpring, useTransform, useScroll } from "framer-motion"
import { useRef, useEffect, useState } from "react"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Stat {
  value: string
  label: string
  color: string
}

interface StatCardProps {
  stat: Stat
  index: number
  disabled?: boolean
}

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

const stats: Stat[] = [
  { value: "15+", label: "Anos no mercado", color: "#1A50A0" },
  { value: "1.000+", label: "Clientes satisfeitos", color: "#1A50A0" },
  { value: "Grátis", label: "Entrega no DF e entorno", color: "#F5C200" },
  { value: "Rápido", label: "Atendimento via WhatsApp", color: "#F5C200" },
]

// ─── Stat card — tilt só no desktop, whileHover via CSS ──────────────────────
const StatCard = ({ stat, index, disabled = false }: StatCardProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [7, -7]), { stiffness: 200, damping: 25 })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-7, 7]), { stiffness: 200, damping: 25 })

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    x.set((e.clientX - rect.left) / rect.width - 0.5)
    y.set((e.clientY - rect.top) / rect.height - 0.5)
  }
  const handleLeave = () => { x.set(0); y.set(0) }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      style={disabled ? {} : { rotateX, rotateY, transformStyle: "preserve-3d" }}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: 0.2 + index * 0.08 }}
      className="p-5 rounded-2xl bg-white border border-[#E8EDF5]
                 hover:border-[#1A50A0]/20 hover:shadow-lg hover:-translate-y-0.5
                 transition-all duration-300 cursor-default relative overflow-hidden group"
    >
      <div
        className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
        style={{
          background: stat.color === "#F5C200"
            ? "linear-gradient(90deg, #F5C200, transparent)"
            : "linear-gradient(90deg, #1A50A0, transparent)",
        }}
      />
      <p className="text-2xl font-extrabold leading-none" style={{ color: stat.color }}>
        {stat.value}
      </p>
      <p className="text-xs text-[#718096] mt-1.5 uppercase tracking-wide font-medium">
        {stat.label}
      </p>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
const AboutSection = () => {
  const sectionRef = useRef<HTMLElement>(null)
  const isDesktop = useIsDesktop()

  // Parallax só no desktop — mobile retorna [0,0]
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] })
  const imgY = useTransform(scrollYProgress, [0, 1], isDesktop ? [-30, 30] : [0, 0])

  return (
    <section ref={sectionRef} id="sobre" className="py-16 md:py-28 bg-white relative overflow-hidden">

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-[#1A50A0]/10 to-transparent" />
        <div className="absolute bottom-0 w-full h-px bg-gradient-to-r from-transparent via-[#1A50A0]/10 to-transparent" />
        <div
          className="absolute -right-32 top-1/4 w-[500px] h-[500px] rounded-full opacity-[0.03]"
          style={{ background: "radial-gradient(circle, #1A50A0, transparent)" }}
        />
      </div>

      <div className="container relative">
        <div className="grid md:grid-cols-2 gap-10 lg:gap-20 items-start">

          {/* Imagem com parallax */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative"
          >
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <p className="text-sm font-semibold text-[#1A50A0] tracking-widest uppercase mb-2">
                Sobre a PSR Embalagens
              </p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#0D1B2A] leading-tight">
                Distribuidora de confiança em Brasília
              </h2>
            </motion.div>

            <div className="relative rounded-2xl overflow-hidden shadow-xl shadow-[#1A50A0]/10">
              <motion.div style={{ y: imgY }}>
                <Image
                  src="/images/about-estoque.webp"
                  alt="Estoque de embalagens da PSR Embalagens no CEASA Brasília DF"
                  width={600}
                  height={450}
                  className="w-full aspect-[4/3] object-cover scale-110"
                  loading="lazy"
                />
              </motion.div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D1B2A]/20 to-transparent" />
            </div>
          </motion.div>

          {/* Texto + stats */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <p className="text-[#4A5568] leading-relaxed text-[1.05rem]">
              Há mais de uma década, a PSR Embalagens abastece indústrias,
              comércios e negócios de food service no DF e região do entorno.
              Localizada no CEASA, trabalhamos com as melhores marcas do mercado
              e mantemos estoque pronto para entrega imediata — sem burocracia.
            </p>

            <div className="mt-6 space-y-3">
              {[
                {
                  title: "Atendimento direto e humano",
                  desc: "Você fala com quem entende de embalagem. Sem chatbot, sem fila — resposta rápida via WhatsApp.",
                },
                {
                  title: "Catálogo interativo no site",
                  desc: "Navegue pelo catálogo completo, monte sua lista de produtos e envie o pedido direto pelo WhatsApp com um clique.",
                },
              ].map((item, i) => (
                <div key={i} className="flex gap-3 p-4 rounded-xl bg-[#F7F9FC] border border-[#E8EDF5]">
                  <div className="w-1.5 flex-shrink-0 rounded-full bg-gradient-to-b from-[#1A50A0] to-[#F5C200] mt-1" />
                  <div>
                    <p className="text-sm font-bold text-[#0D1B2A]">{item.title}</p>
                    <p className="text-sm text-[#718096] mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3" style={{ perspective: "800px" }}>
              {stats.map((s, i) => (
                <StatCard key={s.label} stat={s} index={i} disabled={!isDesktop} />
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="mt-6 flex justify-center"
            >
              <Link
                href="/catalogo"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1A50A0] text-white font-semibold
                           hover:bg-[#153F80] transition-all duration-200 shadow-lg shadow-[#1A50A0]/20
                           hover:-translate-y-0.5 text-sm"
              >
                Explorar catálogo interativo
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Citação */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-20 relative"
        >
          <div className="max-w-2xl mx-auto">
            <div className="relative bg-[#F7F9FC] border border-[#E8EDF5] rounded-2xl px-8 py-10 text-center">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white border border-[#E8EDF5] flex items-center justify-center shadow-sm">
                <span className="text-[#1A50A0] text-xl font-serif leading-none select-none">&ldquo;</span>
              </div>
              <p className="text-base md:text-lg text-[#0D1B2A] font-medium leading-relaxed">
                Acreditamos na construção de relacionamentos duradouros, fornecendo
                não apenas embalagens, mas segurança e confiança que sustentam o
                crescimento dos nossos parceiros.
              </p>
              <div className="mt-6 flex items-center justify-center gap-3">
                <div className="h-px w-8 bg-gradient-to-r from-transparent to-[#1A50A0]/30" />
                <div>
                  <p className="font-bold text-[#0D1B2A] text-sm">PSR Embalagens</p>
                  <p className="text-xs text-[#718096] tracking-widest uppercase mt-0.5">Compromisso com o cliente</p>
                </div>
                <div className="h-px w-8 bg-gradient-to-l from-transparent to-[#1A50A0]/30" />
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  )
}

export default AboutSection