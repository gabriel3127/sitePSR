import { useState, useRef } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { ArrowRight, Send, MessageCircle, Star, Clock } from "lucide-react"

const WA_LINK = "https://wa.me/5561993177107?text=Ol%C3%A1!%20Vim%20pelo%20site%20e%20gostaria%20de%20solicitar%20um%20or%C3%A7amento%20personalizado.%20Podem%20me%20ajudar?"

const ramos = [
  "Restaurante",
  "Hamburgueria / Lanchonete",
  "Mercado / Supermercado",
  "Padaria / Confeitaria",
  "Food service / Delivery",
  "Indústria",
  "Comércio em geral",
  "Evento / Buffet",
  "Farmácia / Drogaria",
]

// ─── Card lateral com tilt 3D ─────────────────────────────────────────────────
const SideCard = ({ children, index }) => {
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
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
      className="p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/8 hover:border-white/20 transition-all duration-300 cursor-default"
    >
      {children}
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
const ConversionSection = () => {
  const [form, setForm] = useState({ nome: "", telefone: "", ramo: "", mensagem: "" })
  const [focused, setFocused] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    const partes = [
      "Olá! Vim pelo site da PSR Embalagens.",
      "",
      "*Nome:* " + form.nome,
      "*Telefone:* " + form.telefone,
      ...(form.ramo ? ["*Ramo:* " + form.ramo] : []),
      "",
      "*Mensagem:*",
      form.mensagem,
    ]
    window.open("https://wa.me/5561993177107?text=" + encodeURIComponent(partes.join("\n")), "_blank")
  }

  const inputClass = (name) => `
    w-full px-4 py-3.5 rounded-xl text-white placeholder:text-white/35 border
    focus:outline-none transition-all duration-200 bg-white/5 text-sm
    ${focused === name
      ? "border-[#F5C200]/60 bg-white/8 ring-1 ring-[#F5C200]/20"
      : "border-white/10 hover:border-white/20"
    }
  `

  return (
    <section id="contato" className="py-16 md:py-28 relative overflow-hidden bg-[#0D1B2A]">

      {/* Fundo decorativo */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #1A50A0, transparent)" }} />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #f5c400ff, transparent)" }} />
        {/* Grade pontilhada */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      <div className="container max-w-6xl relative">

        {/* Cabeçalho */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <p className="text-sm font-semibold text-[#F5C200] tracking-widest uppercase mb-3">
            Fale Conosco
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
            Solicite seu orçamento agora
          </h2>
          <p className="mt-4 text-white/50 max-w-xl mx-auto leading-relaxed">
            Preencha o formulário ou fale diretamente pelo WhatsApp. Respondemos em minutos!
          </p>
        </motion.div>

        <div className="grid md:grid-cols-5 gap-8 items-start">

          {/* ── Formulário — 3/5 ── */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            className="flex flex-col gap-4 md:col-span-3 p-7 rounded-2xl border border-white/10 bg-white/3"
          >
            <h3 className="text-white font-bold text-lg mb-1">Enviar mensagem</h3>

            <div className="grid sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Nome completo *"
                required
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                onFocus={() => setFocused("nome")}
                onBlur={() => setFocused(null)}
                className={inputClass("nome")}
              />
              <input
                type="tel"
                placeholder="Telefone *"
                required
                value={form.telefone}
                onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                onFocus={() => setFocused("tel")}
                onBlur={() => setFocused(null)}
                className={inputClass("tel")}
              />
            </div>

            <input
              type="text"
              list="ramos-list"
              placeholder="Ramo de atuação (opcional)"
              value={form.ramo}
              onChange={(e) => setForm({ ...form, ramo: e.target.value })}
              onFocus={() => setFocused("ramo")}
              onBlur={() => setFocused(null)}
              className={inputClass("ramo")}
            />
            <datalist id="ramos-list">
              {ramos.map((r) => <option key={r} value={r} />)}
            </datalist>

            <textarea
              placeholder="Descreva o que precisa (produtos, quantidades, etc.) *"
              required
              value={form.mensagem}
              onChange={(e) => setForm({ ...form, mensagem: e.target.value })}
              onFocus={() => setFocused("msg")}
              onBlur={() => setFocused(null)}
              className={`${inputClass("msg")} resize-none min-h-[340px]`}
            />

            <motion.button
              type="submit"
              whileHover={{ scale: 1.01, y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-[#1A50A0] hover:bg-[#153F80] text-white font-bold transition-colors shadow-lg shadow-[#1A50A0]/30"
            >
              <Send className="w-4 h-4" />
              Enviar via WhatsApp
            </motion.button>
          </motion.form>

          {/* ── Cards laterais — 2/5 ── */}
          <div className="flex flex-col gap-4 md:col-span-2" style={{ perspective: "800px" }}>

            {/* WhatsApp */}
            <SideCard index={0}>
              <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="group block">
                <div className="w-10 h-10 rounded-xl bg-green-500/15 flex items-center justify-center mb-4">
                  <MessageCircle className="w-5 h-5 text-green-400" />
                </div>
                <h3 className="font-bold text-white text-base">WhatsApp Direto</h3>
                <p className="text-white/50 text-sm mt-1">(61) 99317-7107</p>
                <span className="inline-flex items-center gap-1 mt-3 text-sm font-semibold text-[#F5C200] group-hover:gap-2 transition-all">
                  Iniciar conversa <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </a>
            </SideCard>

            {/* Horário */}
            <SideCard index={1}>
              <div className="w-10 h-10 rounded-xl bg-[#1A50A0]/30 flex items-center justify-center mb-4">
                <Clock className="w-5 h-5 text-[#6B9FE4]" />
              </div>
              <h3 className="font-bold text-white text-base">Horário</h3>
              <div className="text-white/45 text-sm mt-2 space-y-1 leading-relaxed">
                <p>Seg e Qui: <span className="text-white/70">5h–17h</span></p>
                <p>Ter, Qua e Sex: <span className="text-white/70">6h–17h</span></p>
                <p>Sábado: <span className="text-white/70">5h–12h</span></p>
                <p>Domingo: <span className="text-red-400 font-medium">Fechado</span></p>
              </div>
            </SideCard>

            {/* Google */}
            <SideCard index={2}>
              <div className="w-10 h-10 rounded-xl bg-[#F5C200]/15 flex items-center justify-center mb-4">
                <Star className="w-5 h-5 text-[#F5C200] fill-[#F5C200]" />
              </div>
              <h3 className="font-bold text-white text-base">4.9 no Google</h3>
              <p className="text-white/45 text-sm mt-1">+40 avaliações de clientes reais</p>
              <a
                href="https://www.google.com/search?q=psr+embalagens+brasilia"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-3 text-sm font-semibold text-[#F5C200] hover:underline"
              >
                Ver avaliações <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </SideCard>

          </div>
        </div>
      </div>
    </section>
  )
}

export default ConversionSection
