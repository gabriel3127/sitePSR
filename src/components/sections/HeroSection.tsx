import { ArrowRight, MessageCircle, MapPin, Star, Truck } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const WA_LINK =
  "https://wa.me/5561993177107?text=Olá!%20Vim%20pelo%20site%20e%20gostaria%20de%20solicitar%20um%20orçamento%20personalizado.%20Podem%20me%20ajudar?"

const benefits = [
  "Entrega grátis no DF e entorno",
  "Estoque disponível sem pedido mínimo",
  "Atendimento via WhatsApp com resposta rápida",
]

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-[#F7F9FC] pt-24 pb-16 md:pt-32 md:pb-28">
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        <div
          className="absolute -top-32 -right-32 h-[700px] w-[700px] rounded-full opacity-[0.06]"
          style={{ background: "radial-gradient(circle, #1A50A0 0%, transparent 70%)" }}
        />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: "radial-gradient(circle, #1A50A0 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="container relative">
        <div className="grid items-center gap-6 md:grid-cols-2 lg:gap-20">
          <div className="relative z-10">
            <div className="hero-fade-in mb-4 inline-flex w-fit items-center gap-1.5 rounded-full border border-[#1A50A0]/15 bg-white px-3 py-1.5 text-xs font-semibold text-[#1A50A0] shadow-sm">
              <MapPin className="h-3 w-3" />
              Brasília · DF e Entorno
            </div>

            <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight text-[#0D1B2A] md:text-5xl lg:text-[3.25rem]">
              <span className="block">Embalagens para</span>
              <span className="block text-[#1A50A0]">quem vende de verdade</span>
            </h1>

            <p className="hero-fade-in-delay-1 mt-5 max-w-[480px] text-[1.05rem] leading-relaxed text-[#4A5568]">
              Embalagens das melhores marcas para indústrias, comércios e food
              service no DF. Atendimento direto, estoque pronto e entrega grátis.
            </p>

            <div className="hero-fade-in-delay-2 mt-6 flex flex-col gap-2">
              {benefits.map((item) => (
                <div key={item} className="flex items-center gap-2.5">
                  <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#1A50A0]/10">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#1A50A0]" />
                  </div>
                  <span className="text-sm text-[#4A5568]">{item}</span>
                </div>
              ))}
            </div>

            <div className="hero-fade-in-delay-3 mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/catalogo"
                prefetch={false}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1A50A0] px-7 py-3.5 font-bold text-white shadow-lg shadow-[#1A50A0]/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#153F80] sm:w-auto"
              >
                Confira nosso Catálogo
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={WA_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#D1DAE8] bg-white px-7 py-3.5 font-semibold text-[#0D1B2A] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#1A50A0]/40"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="group relative">
              <div className="absolute inset-0 hidden translate-x-3 translate-y-3 rounded-2xl bg-[#1A50A0]/10 blur-sm md:block" />
              <div className="relative overflow-hidden rounded-2xl shadow-xl shadow-[#1A50A0]/10 transition-transform duration-300 md:shadow-2xl md:shadow-[#1A50A0]/12 md:group-hover:-translate-y-1">
                <Image
                  src="/images/hero-packaging-800.webp"
                  alt="Embalagens para delivery, food service e comércio em Brasília DF"
                  width={800}
                  height={600}
                  className="aspect-[4/3] w-full object-cover object-[50%_20%]"
                  priority
                  fetchPriority="high"
                  quality={70}
                  sizes="(max-width: 767px) calc(100vw - 4rem), (max-width: 1200px) 42vw, 600px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D1B2A]/20 to-transparent" />
                <div className="absolute top-3 left-3 rounded-lg bg-white/92 px-3 py-1.5 shadow-sm md:top-4 md:left-4">
                  <p className="text-xs font-bold text-[#0D1B2A]">Entrega em Brasília</p>
                </div>
              </div>

              <div className="absolute -bottom-5 -left-6 hidden items-center gap-3 rounded-2xl border border-[#E8EDF5] bg-white px-4 py-3 shadow-xl transition-transform duration-300 group-hover:-translate-y-1 md:flex">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1A50A0]/10">
                  <Star className="h-4 w-4 fill-[#1A50A0] text-[#1A50A0]" />
                </div>
                <div>
                  <p className="text-sm font-bold leading-tight text-[#0D1B2A]">4.9 no Google</p>
                  <p className="mt-0.5 text-[11px] text-[#718096]">+40 avaliações reais</p>
                </div>
              </div>

              <div className="absolute -top-4 -right-4 hidden items-center gap-2 rounded-2xl bg-[#F5C200] px-3.5 py-3 shadow-lg transition-transform duration-300 group-hover:-translate-y-1 md:flex">
                <Truck className="h-4 w-4 shrink-0 text-[#1A3060]" />
                <div>
                  <p className="text-xs font-bold leading-tight text-[#1A3060]">Entrega grátis</p>
                  <p className="text-[11px] font-medium text-[#1A3060]/70">DF e Entorno</p>
                </div>
              </div>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2 md:hidden">
              <div className="flex items-center gap-2.5 rounded-xl border border-[#E8EDF5] bg-white px-3 py-2 shadow-md">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1A50A0]/10">
                  <Star className="h-3.5 w-3.5 fill-[#1A50A0] text-[#1A50A0]" />
                </div>
                <div>
                  <p className="text-xs font-bold leading-tight text-[#0D1B2A]">4.9 no Google</p>
                  <p className="mt-0.5 text-[10px] text-[#718096]">+40 avaliações</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 rounded-xl bg-[#F5C200] px-3 py-2 shadow-md">
                <Truck className="h-4 w-4 shrink-0 text-[#1A3060]" />
                <div>
                  <p className="text-xs font-bold leading-tight text-[#1A3060]">Entrega grátis</p>
                  <p className="text-[10px] font-medium text-[#1A3060]/70">DF e Entorno</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
