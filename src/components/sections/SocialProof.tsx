"use client"

import { LazyMotion, m, useMotionValue, useSpring, useTransform } from "framer-motion"
import { useRef, useEffect, useState } from "react"
import { MapPin, Truck, MessageCircle, Package } from "lucide-react"

const loadFeatures = () => import("framer-motion").then((r) => r.domAnimation)

// ─── Types ────────────────────────────────────────────────────────────────────
interface TiltCardProps {
  children: React.ReactNode
  className?: string
  disabled?: boolean
}

interface Differential {
  icon: React.ElementType
  title: string
  desc: string
  accent: string
  iconBg: string
}

interface Stat {
  value: string
  label: string
  suffix: string
}

interface StatCardProps {
  stat: Stat
  index: number
  inView: boolean
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

// ─── Counter animado ──────────────────────────────────────────────────────────
const useCounter = (target: string, duration = 1.5, inView: boolean) => {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!inView) return
    const numeric = parseFloat(target.replace(/[^0-9.]/g, ""))
    if (!numeric) return
    let start: number | null = null
    const step = (ts: number) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / (duration * 1000), 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(eased * numeric)
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [inView, target, duration])
  return count
}

// ─── Card com tilt 3D — só ativo no desktop ───────────────────────────────────
const TiltCard = ({ children, className, disabled = false }: TiltCardProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  // Springs mais leves + glow radial removido (imperceptível, custoso)
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [6, -6]), { stiffness: 200, damping: 25 })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-6, 6]), { stiffness: 200, damping: 25 })

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    x.set((e.clientX - rect.left) / rect.width - 0.5)
    y.set((e.clientY - rect.top) / rect.height - 0.5)
  }
  const handleLeave = () => { x.set(0); y.set(0) }

  return (
    <m.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      style={disabled ? {} : { rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={className}
    >
      {children}
    </m.div>
  )
}

// ─── Dados ────────────────────────────────────────────────────────────────────
const differentials: Differential[] = [
  {
    icon: MapPin,
    title: "Localização Estratégica",
    desc: "Na CEASA de Brasília — no coração da distribuição do DF, garantindo agilidade e estoque sempre abastecido.",
    accent: "#1A50A0",
    iconBg: "bg-[#1A50A0]",
  },
  {
    icon: Truck,
    title: "Entrega Grátis",
    desc: "Rotas diárias cobrindo todo o Distrito Federal e região do entorno sem custo adicional.",
    accent: "#F5C200",
    iconBg: "bg-[#F5C200]",
  },
  {
    icon: MessageCircle,
    title: "Atendimento Direto",
    desc: "Fale com quem entende de embalagem. WhatsApp com resposta rápida e sem enrolação.",
    accent: "#1A50A0",
    iconBg: "bg-[#1A50A0]",
  },
  {
    icon: Package,
    title: "Variedade de Marcas",
    desc: "As principais marcas do mercado — descartáveis, biodegradáveis, food service e muito mais.",
    accent: "#F5C200",
    iconBg: "bg-[#F5C200]",
  },
]

const stats: Stat[] = [
  { value: "15+", label: "anos no mercado", suffix: "anos" },
  { value: "1000+", label: "clientes ativos", suffix: "clientes" },
  { value: "4.9", label: "estrelas no Google", suffix: "★" },
]

// ─── Stat counter card — hover via CSS, sem whileHover ───────────────────────
const StatCard = ({ stat, index, inView }: StatCardProps) => {
  const count = useCounter(stat.value, 1.5, inView)
  const isRating = stat.value.includes(".")
  const displayed = isRating
    ? count.toFixed(1)
    : Math.floor(count).toLocaleString("pt-BR")

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="text-center p-6 rounded-2xl bg-white border border-[#E8EDF5] shadow-sm
                 hover:shadow-md hover:-translate-y-1 transition-all duration-300"
    >
      <p className="text-4xl font-extrabold text-[#0D1B2A] leading-none tabular-nums">
        {displayed}
        <span className="text-[#1A50A0]">
          {stat.value.includes("+") ? "+" : ""}
          {stat.suffix === "★" ? "★" : ""}
        </span>
      </p>
      <p className="mt-2 text-sm font-medium text-[#556070]">{stat.label}</p>
    </m.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
const SocialProof = () => {
  const [statsInView, setStatsInView] = useState(false)
  const statsRef = useRef<HTMLDivElement>(null)
  const isDesktop = useIsDesktop()

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsInView(true) },
      { threshold: 0.3 }
    )
    if (statsRef.current) observer.observe(statsRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <LazyMotion features={loadFeatures} strict>
      <section id="diferenciais" className="py-16 md:py-24 bg-[#F7F9FC] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#1A50A0]/15 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#1A50A0]/15 to-transparent" />

        <div className="container">
          <m.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <p className="text-sm font-semibold text-[#1A50A0] tracking-widest uppercase mb-3">
              Por que a PSR?
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0D1B2A] text-balance leading-tight">
              Direto ao ponto: o que você ganha<br className="hidden md:block" />
              trabalhando com a gente
            </h2>
          </m.div>

          {/* Grid de diferenciais — tilt só no desktop */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16" style={{ perspective: "1000px" }}>
            {differentials.map((d, i) => (
              <m.div
                key={d.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <TiltCard
                  disabled={!isDesktop}
                  className="group relative p-6 rounded-2xl bg-white border border-[#E8EDF5]
                             hover:border-[#1A50A0]/20 hover:shadow-lg transition-all duration-300
                             cursor-default h-full overflow-hidden"
                >
                  {/* Linha top — CSS transition, sem motion */}
                  <div
                    className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl opacity-0
                                group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: `linear-gradient(90deg, ${d.accent}, transparent)` }}
                  />
                  <div
                    className={`w-12 h-12 rounded-xl ${d.iconBg} flex items-center justify-center mb-4
                                group-hover:scale-110 transition-transform duration-300`}
                    style={{ transform: "translateZ(8px)" }}
                  >
                    <d.icon className="w-5 h-5 text-white" strokeWidth={1.8} />
                  </div>
                  <h3
                    className="font-bold text-[#0D1B2A] text-base leading-snug mb-2"
                    style={{ transform: "translateZ(4px)" }}
                  >
                    {d.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#556070]">{d.desc}</p>
                </TiltCard>
              </m.div>
            ))}
          </div>

          {/* Stats */}
          <div ref={statsRef} className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.map((stat, i) => (
              <StatCard key={stat.label} stat={stat} index={i} inView={statsInView} />
            ))}
          </div>
        </div>
      </section>
    </LazyMotion>
  )
}

export default SocialProof
