import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { useRef } from "react"
import { MapPin, Clock, Phone, Navigation } from "lucide-react"

// ─── Info card com tilt 3D ────────────────────────────────────────────────────
const InfoCard = ({ icon: Icon, title, children, index, accent = "#1A50A0" }) => {
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [4, -4]), { stiffness: 300, damping: 30 })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-4, 4]), { stiffness: 300, damping: 30 })

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
      initial={{ opacity: 0, x: 24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
      whileHover={{ y: -2 }}
      className="group p-6 rounded-2xl bg-white border border-[#E8EDF5] hover:border-[#1A50A0]/20 hover:shadow-lg transition-all duration-300 relative overflow-hidden cursor-default"
    >
      {/* Linha de cor no topo ao hover */}
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
        style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }}
      />

      <div className="flex items-start gap-4">
        {/* Ícone */}
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300"
          style={{ background: accent === "#F5C200" ? "#F5C200" : "#1A50A0", transform: "translateZ(6px)" }}
        >
          <Icon className="w-5 h-5 text-white" strokeWidth={1.8} />
        </div>

        <div style={{ transform: "translateZ(4px)" }}>
          <h3 className="font-bold text-[#0D1B2A] text-base leading-snug">{title}</h3>
          <div className="mt-1.5">{children}</div>
        </div>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
const LocationSection = () => (
  <section id="localizacao" className="py-16 md:py-24 bg-white relative overflow-hidden">

    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-[#1A50A0]/10 to-transparent" />
      <div className="absolute bottom-0 w-full h-px bg-gradient-to-r from-transparent via-[#1A50A0]/10 to-transparent" />
      <div className="absolute -left-40 bottom-0 w-[500px] h-[500px] rounded-full opacity-[0.03]"
        style={{ background: "radial-gradient(circle, #1A50A0, transparent)" }} />
    </div>

    <div className="container relative">

      {/* Cabeçalho */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-12"
      >
        <p className="text-sm font-semibold text-[#1A50A0] tracking-widest uppercase mb-3">
          Nossa Localização
        </p>
        <h2 className="text-3xl md:text-4xl font-extrabold text-[#0D1B2A] leading-tight">
          Visite nossa loja no CEASA
        </h2>
        <p className="mt-2 text-[#718096]">
          Localização estratégica para atendimento rápido em todo o DF
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8 items-start">

        {/* Mapa — entra da esquerda */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative"
        >
          {/* Sombra deslocada decorativa */}
          <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-2xl bg-[#1A50A0]/8 blur-sm" />

          <div className="relative rounded-2xl overflow-hidden shadow-xl shadow-[#1A50A0]/10 border border-[#E8EDF5]" style={{ minHeight: "420px" }}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3838.5!2d-47.946408!3d-15.7886105!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x935a311d2a52c945%3A0x3495b53058238b45!2sPSR%20Embalagens!5e0!3m2!1spt-BR!2sbr!4v1"
              width="100%"
              height="420"
              style={{ border: 0, display: "block" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Localização PSR Embalagens no CEASA Brasília"
            />
          </div>

          {/* Badge sobre o mapa */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, type: "spring" }}
            className="absolute bottom-4 left-4 bg-white rounded-xl shadow-lg px-4 py-2.5 flex items-center gap-2 border border-[#E8EDF5]"
          >
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-bold text-[#0D1B2A]">PSR Embalagens · CEASA</span>
          </motion.div>
        </motion.div>

        {/* Cards de info — entram da direita */}
        <div className="space-y-3" style={{ perspective: "800px" }}>

          <InfoCard icon={MapPin} title="Endereço" index={0}>
            <p className="text-sm text-[#718096] leading-relaxed">
              SIA Trecho 10, LOTE 05, PAV B-10B, BOX 07<br />
              CEASA, Guará, Brasília — DF<br />
              CEP: 71200-100
            </p>
            <a
              href="https://maps.app.goo.gl/si3YPWmrvmkxojZC6"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-2.5 text-sm font-semibold text-[#1A50A0] hover:underline"
            >
              <Navigation className="w-3.5 h-3.5" /> Abrir no Google Maps
            </a>
          </InfoCard>

          <InfoCard icon={Clock} title="Horário de Funcionamento" index={1}>
            <div className="text-sm text-[#718096] space-y-0.5 leading-relaxed">
              <p>Segunda e Quinta: <span className="text-[#0D1B2A] font-medium">5h às 17h</span></p>
              <p>Terça, Quarta e Sexta: <span className="text-[#0D1B2A] font-medium">6h às 17h</span></p>
              <p>Sábado: <span className="text-[#0D1B2A] font-medium">5h às 12h</span></p>
              <p>Domingo: <span className="text-red-500 font-medium">Fechado</span></p>
            </div>
          </InfoCard>

          <InfoCard icon={Phone} title="Contato" index={2} accent="#F5C200">
            <a
              href="tel:+5561993177107"
              className="text-lg font-bold text-[#1A50A0] hover:underline"
            >
              (61) 99317-7107
            </a>
            <p className="text-xs text-[#718096] mt-0.5">WhatsApp e ligações</p>
          </InfoCard>

        </div>
      </div>
    </div>
  </section>
)

export default LocationSection