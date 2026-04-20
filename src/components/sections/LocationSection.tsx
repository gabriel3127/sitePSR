"use client"

import { motion } from "framer-motion"
import { MapPin, Clock, Phone, Navigation, ExternalLink } from "lucide-react"

interface InfoCardProps {
  icon: React.ElementType
  title: string
  children: React.ReactNode
  index: number
  accent?: string
}

const InfoCard = ({ icon: Icon, title, children, index, accent = "#1A50A0" }: InfoCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
    className="group p-5 rounded-2xl bg-white border border-[#E8EDF5] hover:border-[#1A50A0]/20 hover:shadow-lg transition-all duration-300 relative overflow-hidden"
  >
    <div
      className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
      style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }}
    />
    <div className="flex items-start gap-4">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: accent === "#F5C200" ? "#F5C200" : "#1A50A0" }}
      >
        <Icon className="w-5 h-5 text-white" strokeWidth={1.8} />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-bold text-[#0D1B2A] text-sm leading-snug">{title}</h3>
        <div className="mt-1">{children}</div>
      </div>
    </div>
  </motion.div>
)

const GMAPS_LINK = "https://maps.app.goo.gl/si3YPWmrvmkxojZC6"
const WAZE_LINK  = "https://waze.com/ul?ll=-15.7886105,-47.946408&navigate=yes"

const StaticMap = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
    className="rounded-2xl overflow-hidden border border-[#E8EDF5] shadow-lg shadow-[#1A50A0]/8"
  >
    {/* Imagem do mapa */}
    <div className="relative w-full h-56 sm:h-72 md:h-80 overflow-hidden">
      <img
        src="/images/mapa-psr.webp"
        alt="Mapa de localização da PSR Embalagens no CEASA Brasília"
        className="w-full h-full object-cover object-center"
        loading="lazy"
      />

      {/* Overlay hover — desktop only */}
      <a
        href={GMAPS_LINK}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Abrir localização no Google Maps"
        className="absolute inset-0 hidden md:flex items-center justify-center bg-black/0 hover:bg-black/15 transition-colors duration-300 group"
      >
        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white text-[#1A50A0] text-sm font-semibold px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
          <ExternalLink className="w-4 h-4" /> Ver no Google Maps
        </span>
      </a>

      {/* Badge — canto superior esquerdo */}
      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm rounded-xl shadow-md px-3 py-1.5 flex items-center gap-2 border border-[#E8EDF5] pointer-events-none">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
        <span className="text-xs font-bold text-[#0D1B2A] whitespace-nowrap">PSR Embalagens · CEASA</span>
      </div>
    </div>

    {/* Barra de ações — abaixo do mapa, sempre visível, fácil de tocar */}
    <div className="bg-white border-t border-[#E8EDF5] grid grid-cols-2 divide-x divide-[#E8EDF5]">
      <a
        href={GMAPS_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 py-4 text-sm font-bold text-[#1A50A0] hover:bg-[#F0F4FB] active:bg-[#E8EDF5] transition-colors duration-150"
      >
        <Navigation className="w-4 h-4 shrink-0" />
        Google Maps
      </a>
      <a
        href={WAZE_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 py-4 text-sm font-bold text-[#6B4EFF] hover:bg-[#F5F3FF] active:bg-[#EDE9FE] transition-colors duration-150"
      >
        <Navigation className="w-4 h-4 shrink-0" />
        Waze
      </a>
    </div>
  </motion.div>
)

// ═══════════════════════════════════════════════════════════════════════════════
const LocationSection = () => (
  <section id="localizacao" className="py-12 md:py-24 bg-white relative overflow-hidden">
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-[#1A50A0]/10 to-transparent" />
      <div className="absolute bottom-0 w-full h-px bg-gradient-to-r from-transparent via-[#1A50A0]/10 to-transparent" />
      <div
        className="absolute -left-40 bottom-0 w-[500px] h-[500px] rounded-full opacity-[0.03]"
        style={{ background: "radial-gradient(circle, #1A50A0, transparent)" }}
      />
    </div>

    <div className="container relative">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-8 md:mb-12"
      >
        <p className="text-xs font-semibold text-[#1A50A0] tracking-widest uppercase mb-2">
          Nossa Localização
        </p>
        <h2 className="text-2xl md:text-4xl font-extrabold text-[#0D1B2A] leading-tight">
          Visite nossa loja no CEASA
        </h2>
        <p className="mt-1.5 text-sm md:text-base text-[#718096]">
          Localização estratégica para atendimento rápido em todo o DF
        </p>
      </motion.div>

      {/* Mobile: mapa em cima, cards abaixo. Desktop: lado a lado */}
      <div className="flex flex-col md:grid md:grid-cols-2 gap-5 md:gap-8 items-start">
        <StaticMap />

        <div className="space-y-3">
          <InfoCard icon={MapPin} title="Endereço" index={0}>
            <p className="text-sm text-[#718096] leading-relaxed">
              SIA Trecho 10, LOTE 05, PAV B-10B, BOX 07<br />
              CEASA, Guará, Brasília — DF<br />
              CEP: 71200-100
            </p>
            <a
              href={GMAPS_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-2 text-sm font-semibold text-[#1A50A0] hover:underline"
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
            <a href="tel:+5561993177107" className="text-lg font-bold text-[#1A50A0] hover:underline">
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