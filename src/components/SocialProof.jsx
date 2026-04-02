import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { useRef, useEffect, useState } from "react"
import { MapPin, Truck, MessageCircle, Package } from "lucide-react"

// ─── Counter animado ──────────────────────────────────────────────────────────
const useCounter = (target, duration = 1.5, inView) => {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!inView) return
    const numeric = parseFloat(target.replace(/[^0-9.]/g, ""))
    if (!numeric) return
    let start = null
    const step = (ts) => {
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

// ─── Card com tilt 3D ─────────────────────────────────────────────────────────
const TiltCard = ({ children, className }) => {
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [6, -6]), { stiffness: 300, damping: 30 })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-6, 6]), { stiffness: 300, damping: 30 })
  const glowX = useTransform(x, [-0.5, 0.5], [0, 100])
  const glowY = useTransform(y, [-0.5, 0.5], [0, 100])

  const handleMouse = (e) => {
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
      {/* Brilho dinâmico */}
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${glowX}% ${glowY}%, rgba(26,80,160,0.08) 0%, transparent 60%)`,
        }}
      />
      {children}
    </motion.div>
  )
}

// ─── Dados ────────────────────────────────────────────────────────────────────
const differentials = [
  {
    icon: MapPin,
    title: "Localização Estratégica",
    desc: "Na CEASA de Brasília — no coração da distribuição do DF, garantindo agilidade e estoque sempre abastecido.",
    accent: "#1A50A0",
    accentBg: "bg-[#1A50A0]/8",
    iconBg: "bg-[#1A50A0]",
  },
  {
    icon: Truck,
    title: "Entrega Grátis",
    desc: "Rotas diárias cobrindo todo o Distrito Federal e região do entorno sem custo adicional.",
    accent: "#F5C200",
    accentBg: "bg-[#F5C200]/10",
    iconBg: "bg-[#F5C200]",
  },
  {
    icon: MessageCircle,
    title: "Atendimento Direto",
    desc: "Fale com quem entende de embalagem. WhatsApp com resposta rápida e sem enrolação.",
    accent: "#1A50A0",
    accentBg: "bg-[#1A50A0]/8",
    iconBg: "bg-[#1A50A0]",
  },
  {
    icon: Package,
    title: "Variedade de Marcas",
    desc: "As principais marcas do mercado — descartáveis, biodegradáveis, food service e muito mais.",
    accent: "#F5C200",
    accentBg: "bg-[#F5C200]/10",
    iconBg: "bg-[#F5C200]",
  },
]

const stats = [
  { value: "15+", label: "anos no mercado", suffix: "anos" },
  { value: "1000+", label: "clientes ativos", suffix: "clientes" },
  { value: "4.9", label: "estrelas no Google", suffix: "★" },
]

// ─── Stat counter card ────────────────────────────────────────────────────────
const StatCard = ({ stat, index, inView }) => {
  const numeric = parseFloat(stat.value.replace(/[^0-9.]/g, ""))
  const hasDecimal = stat.value.includes(".")
  const count = useCounter(stat.value, 1.5, inView)
  const prefix = stat.value.includes("+") ? "+" : stat.value.includes("%") ? "%" : ""
  const isRating = stat.value.includes(".")

  const displayed = isRating
    ? count.toFixed(1)
    : Math.floor(count).toLocaleString("pt-BR")

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className="text-center p-6 rounded-2xl bg-white border border-[#E8EDF5] shadow-sm hover:shadow-md transition-all duration-300"
    >
      <p className="text-4xl font-extrabold text-[#0D1B2A] leading-none tabular-nums">
        {displayed}
        <span className="text-[#1A50A0]">
          {stat.value.includes("+") ? "+" : ""}
          {stat.suffix === "★" ? "★" : ""}
        </span>
      </p>
      <p className="text-sm text-[#718096] mt-2 font-medium">{stat.label}</p>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
const SocialProof = () => {
  const [statsInView, setStatsInView] = useState(false)
  const statsRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsInView(true) },
      { threshold: 0.3 }
    )
    if (statsRef.current) observer.observe(statsRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="diferenciais" className="py-16 md:py-24 bg-[#F7F9FC] relative overflow-hidden">

      {/* Fundo decorativo */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#1A50A0]/15 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#1A50A0]/15 to-transparent" />

      <div className="container">

        {/* Título */}
        <motion.div
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
        </motion.div>

        {/* Cards de diferenciais com tilt 3D */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16" style={{ perspective: "1000px" }}>
          {differentials.map((d, i) => (
            <motion.div
              key={d.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <TiltCard className="group relative p-6 rounded-2xl bg-white border border-[#E8EDF5] hover:border-[#1A50A0]/20 hover:shadow-lg transition-all duration-300 cursor-default h-full overflow-hidden">
                {/* Linha de cor no topo */}
                <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `linear-gradient(90deg, ${d.accent}, transparent)` }} />

                {/* Ícone */}
                <div className={`w-12 h-12 rounded-xl ${d.iconBg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                  style={{ transform: "translateZ(8px)" }}>
                  <d.icon className="w-5 h-5 text-white" strokeWidth={1.8} />
                </div>

                <h3 className="font-bold text-[#0D1B2A] text-base leading-snug mb-2"
                  style={{ transform: "translateZ(4px)" }}>
                  {d.title}
                </h3>
                <p className="text-sm text-[#718096] leading-relaxed">{d.desc}</p>
              </TiltCard>
            </motion.div>
          ))}
        </div>

        {/* Stats com contador animado */}
        <div ref={statsRef} className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} index={i} inView={statsInView} />
          ))}
        </div>

      </div>
    </section>
  )
}

export default SocialProof