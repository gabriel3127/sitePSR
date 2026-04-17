"use client"

import { motion, useMotionValue, useSpring, useTransform, useScroll } from "framer-motion"
import { useRef } from "react"
import { ArrowRight, MessageCircle, MapPin, Star, Truck } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const WA_LINK =
  "https://wa.me/5561993177107?text=Ol%C3%A1!%20Vim%20pelo%20site%20e%20gostaria%20de%20solicitar%20um%20or%C3%A7amento%20personalizado.%20Podem%20me%20ajudar?"

// ─── Card com tilt 3D ────────────────────────────────────────────────────────
const TiltCard = ({
  children,
  className,
  intensity = 8,
}: {
  children: React.ReactNode
  className?: string
  intensity?: number
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [intensity, -intensity]), { stiffness: 300, damping: 30 })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-intensity, intensity]), { stiffness: 300, damping: 30 })

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
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
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── Texto animado por palavra ────────────────────────────────────────────────
const AnimatedHeading = () => {
  const line1 = ["Embalagens", "para"]
  const line2 = ["quem", "vende", "de", "verdade"]

  return (
    <h1 className="text-4xl md:text-5xl lg:text-[3.25rem] font-extrabold text-[#0D1B2A] leading-[1.08] tracking-tight">
      <span className="block">
        {line1.map((word, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.06, ease: [0.25, 0.1, 0.25, 1] }}
            className="inline-block mr-[0.25em]"
          >
            {word}
          </motion.span>
        ))}
      </span>
      <span className="block text-[#1A50A0]">
        {line2.map((word, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.12 + i * 0.06, ease: [0.25, 0.1, 0.25, 1] }}
            className="inline-block mr-[0.25em]"
          >
            {word}
          </motion.span>
        ))}
      </span>
    </h1>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
const HeroSection = () => {
  const sectionRef = useRef<HTMLElement>(null)

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] })
  const imgY  = useTransform(scrollYProgress, [0, 1], [0, 60])
  const textY = useTransform(scrollYProgress, [0, 1], [0, -30])

  return (
    <section
      ref={sectionRef}
      className="relative pt-24 pb-16 md:pt-32 md:pb-28 overflow-hidden bg-[#F7F9FC]"
    >
      {/* Fundo decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        <div
          className="absolute -top-32 -right-32 w-[700px] h-[700px] rounded-full opacity-[0.06]"
          style={{ background: "radial-gradient(circle, #1A50A0 0%, transparent 70%)" }}
        />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: "radial-gradient(circle, #1A50A0 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        {/* Linha vertical removida — visível e indesejada no mobile */}
      </div>

      <div className="container relative">
        <div className="grid md:grid-cols-2 gap-6 lg:gap-20 items-center">

          {/* ── Texto ── */}
          <motion.div style={{ y: textY }} className="relative z-10">
            {/* Badge localização */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0 }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#1A50A0]/15 text-[#1A50A0] text-xs font-semibold shadow-sm w-fit mb-4"
            >
              <MapPin className="w-3 h-3" />
              Brasília · DF e Entorno
            </motion.div>

            {/* Título */}
            <AnimatedHeading />

            {/* Subtítulo */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="mt-5 text-[1.05rem] text-[#4A5568] leading-relaxed max-w-[480px]"
            >
              Embalagens das melhores marcas para indústrias, comércios e food
              service no DF. Atendimento direto, estoque pronto e entrega grátis.
            </motion.p>

            {/* Bullets */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="mt-6 flex flex-col gap-2"
            >
              {[
                "Entrega grátis no DF e entorno",
                "Estoque disponível — sem pedido mínimo",
                "Atendimento via WhatsApp com resposta rápida",
              ].map((item, i) => (
                <motion.div
                  key={item}
                  className="flex items-center gap-2.5"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45 + i * 0.06, duration: 0.35 }}
                >
                  <div className="w-4 h-4 rounded-full bg-[#1A50A0]/10 flex items-center justify-center shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#1A50A0]" />
                  </div>
                  <span className="text-sm text-[#4A5568]">{item}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
              className="mt-8 flex flex-col sm:flex-row gap-3"
            >
              <motion.div whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/catalogo"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#1A50A0] text-white font-bold hover:bg-[#153F80] transition-colors shadow-lg shadow-[#1A50A0]/25 w-full"
                >
                  Confira nosso Catálogo
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
              <motion.a
                href={WA_LINK}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white text-[#0D1B2A] font-semibold border border-[#D1DAE8] hover:border-[#1A50A0]/40 transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                Whatsapp
              </motion.a>
            </motion.div>

          </motion.div>

          {/* ── Imagem com 3D tilt ── */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
            style={{ y: imgY }}
            className="relative"
          >
            {/* DESKTOP: tilt com cards flutuantes */}
            <TiltCard className="relative hidden md:block" intensity={6}>
              <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-2xl bg-[#1A50A0]/10 blur-sm" />
              <div
                className="relative rounded-2xl overflow-hidden shadow-2xl shadow-[#1A50A0]/12"
                style={{ transform: "translateZ(0)" }}
              >
                <Image
                  src="/images/hero-packaging.webp"
                  alt="Embalagens para delivery, food service e comércio em Brasília DF"
                  width={600}
                  height={450}
                  className="w-full aspect-[4/3] object-cover"
                  priority
                  fetchPriority="high"
                  sizes="(max-width: 1200px) 400px, 600px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D1B2A]/20 to-transparent" />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-sm">
                  <p className="text-xs font-bold text-[#0D1B2A]">Entrega em Brasília</p>
                </div>
              </div>
              {/* Card Google — desktop */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.4, type: "spring" }}
                whileHover={{ y: -3, scale: 1.02 }}
                style={{ transform: "translateZ(20px)" }}
                className="absolute -bottom-5 -left-6 bg-white rounded-2xl shadow-xl border border-[#E8EDF5] px-4 py-3 flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-[#1A50A0]/10 flex items-center justify-center shrink-0">
                  <Star className="w-4 h-4 text-[#1A50A0] fill-[#1A50A0]" />
                </div>
                <div>
                  <p className="font-bold text-[#0D1B2A] text-sm leading-tight">4.9 no Google</p>
                  <p className="text-[11px] text-[#718096] mt-0.5">+40 avaliações reais</p>
                </div>
              </motion.div>
              {/* Card entrega grátis — desktop */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.85, duration: 0.4, type: "spring" }}
                whileHover={{ y: -3, scale: 1.02 }}
                style={{ transform: "translateZ(20px)" }}
                className="absolute -top-4 -right-4 bg-[#F5C200] rounded-2xl shadow-lg px-3.5 py-3 flex items-center gap-2"
              >
                <Truck className="w-4 h-4 text-[#1A3060] shrink-0" />
                <div>
                  <p className="text-xs font-bold text-[#1A3060] leading-tight">Entrega grátis</p>
                  <p className="text-[11px] font-medium text-[#1A3060]/70">DF e Entorno</p>
                </div>
              </motion.div>
            </TiltCard>

            {/* MOBILE: imagem limpa + cards abaixo lado a lado */}
            <div className="md:hidden">
              <div className="relative rounded-2xl overflow-hidden shadow-xl shadow-[#1A50A0]/10">
                <Image
                  src="/images/hero-packaging.webp"
                  alt="Embalagens para delivery, food service e comércio em Brasília DF"
                  width={600}
                  height={450}
                  className="w-full aspect-[4/3] object-cover"
                  priority
                  fetchPriority="high"
                  sizes="100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D1B2A]/20 to-transparent" />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-sm">
                  <p className="text-xs font-bold text-[#0D1B2A]">Entrega em Brasília</p>
                </div>
              </div>

              {/* Cards lado a lado abaixo da imagem */}
              <div className="grid grid-cols-2 gap-2 mt-2">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                  className="bg-white rounded-xl shadow-md border border-[#E8EDF5] px-3 py-2 flex items-center gap-2.5"
                >
                  <div className="w-7 h-7 rounded-full bg-[#1A50A0]/10 flex items-center justify-center shrink-0">
                    <Star className="w-3.5 h-3.5 text-[#1A50A0] fill-[#1A50A0]" />
                  </div>
                  <div>
                    <p className="font-bold text-[#0D1B2A] text-xs leading-tight">4.9 no Google</p>
                    <p className="text-[10px] text-[#718096] mt-0.5">+40 avaliações</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                  className="bg-[#F5C200] rounded-xl shadow-md px-3 py-2 flex items-center gap-2.5"
                >
                  <Truck className="w-4 h-4 text-[#1A3060] shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-[#1A3060] leading-tight">Entrega grátis</p>
                    <p className="text-[10px] font-medium text-[#1A3060]/70">DF e Entorno</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection