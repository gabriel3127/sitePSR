"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { Plus, Minus, MessageCircle } from "lucide-react"

const WA_LINK = "https://wa.me/5561993177107?text=Ol%C3%A1!%20Vim%20pelo%20site%20e%20gostaria%20de%20solicitar%20um%20or%C3%A7amento%20personalizado.%20Podem%20me%20ajudar?"

interface Faq {
  q: string
  a: string
}

interface FaqItemProps {
  faq: Faq
  index: number
  isOpen: boolean
  onToggle: () => void
  isDesktop: boolean
}

const faqs: Faq[] = [
  {
    q: "Vocês fazem entrega grátis em Brasília?",
    a: "Sim! Fazemos entrega grátis para todo o DF e entorno. A entrega é realizada em rotas diárias, sujeita à disponibilidade de horário e localização. Entre em contato para confirmar se sua região está na nossa rota.",
  },
  {
    q: "Qual o horário de funcionamento?",
    a: "Funcionamos de segunda a sexta das 5h às 17h e aos sábados das 5h às 12h. Domingos permanecemos fechados. Estamos localizados no CEASA, Guará, Brasília — DF.",
  },
  {
    q: "Vocês vendem embalagens para delivery?",
    a: "Sim! Temos uma linha completa para delivery: marmitas, caixas para hambúrguer, sacolas kraft, garrafas e muito mais — resistentes e que mantêm a qualidade dos alimentos.",
  },
  {
    q: "Como posso fazer um orçamento?",
    a: "Você pode solicitar orçamento pelo WhatsApp (61) 99317-7107, pelo formulário de contato do site, ou visitando nossa loja no CEASA.",
  },
  {
    q: "Vocês têm embalagens biodegradáveis?",
    a: "Sim! Oferecemos linha completa de embalagens biodegradáveis e sustentáveis feitas de cana-de-açúcar e outros materiais ecológicos, sem abrir mão da qualidade.",
  },
  {
    q: "Qual a localização da PSR Embalagens?",
    a: "SIA Trecho 10, LOTE 05, PAV B-10B, BOX 07, CEASA, Guará, Brasília — DF. CEP: 71200-100.",
  },
]

// ─── Item FAQ ─────────────────────────────────────────────────────────────────
const FaqItem = ({ faq, index, isOpen, onToggle, isDesktop }: FaqItemProps) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    // Delay escalonado só no desktop — no mobile todos entram juntos
    transition={{ duration: 0.4, delay: isDesktop ? index * 0.07 : 0 }}
    className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
      isOpen
        ? "border-[#1A50A0]/25 bg-white shadow-md shadow-[#1A50A0]/8"
        : "border-[#E8EDF5] bg-white hover:border-[#1A50A0]/20 hover:shadow-sm"
    }`}
  >
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
    >
      <span className={`font-bold text-base leading-snug transition-colors duration-200 ${
        isOpen ? "text-[#1A50A0]" : "text-[#0D1B2A]"
      }`}>
        {faq.q}
      </span>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
        isOpen ? "bg-[#1A50A0] text-white" : "bg-[#F7F9FC] text-[#718096]"
      }`}>
        {isOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
      </div>
    </button>

    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          key="content"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div className="px-6 pb-5">
            <div className="h-px bg-[#E8EDF5] mb-4" />
            <p className="text-[#4A5568] leading-relaxed text-sm">{faq.a}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
)

// ═══════════════════════════════════════════════════════════════════════════════
const FaqSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)")
    setIsDesktop(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  const toggle = (i: number) => setOpenIndex(prev => prev === i ? null : i)

  return (
    <section id="faq" className="py-16 md:py-24 bg-[#F7F9FC] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-[#1A50A0]/10 to-transparent" />
        <div className="absolute bottom-0 w-full h-px bg-gradient-to-r from-transparent via-[#1A50A0]/10 to-transparent" />
      </div>

      <div className="container max-w-3xl relative">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <p className="text-sm font-semibold text-[#1A50A0] tracking-widest uppercase mb-3">
            Dúvidas Frequentes
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0D1B2A] leading-tight">
            Perguntas e respostas
          </h2>
          <p className="mt-3 text-[#718096]">
            Encontre respostas rápidas sobre nossos produtos e serviços
          </p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <FaqItem
              key={i}
              faq={faq}
              index={i}
              isOpen={openIndex === i}
              onToggle={() => toggle(i)}
              isDesktop={isDesktop}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 text-center"
        >
          <p className="text-[#718096] mb-5 text-sm">Não encontrou a resposta que procurava?</p>
          {/* motion.a → <a> com CSS — sem instância Framer num link externo */}
          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#1A50A0] text-white
                       font-semibold hover:bg-[#153F80] active:scale-[0.98] transition-all duration-200
                       shadow-lg shadow-[#1A50A0]/25 hover:-translate-y-px"
          >
            <MessageCircle className="w-4 h-4" />
            Fale Conosco no WhatsApp
          </a>
        </motion.div>
      </div>
    </section>
  )
}

export default FaqSection