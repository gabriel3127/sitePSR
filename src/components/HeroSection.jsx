import { motion } from "framer-motion";
import { ArrowRight, MessageCircle, MapPin } from "lucide-react";
import heroImg from "@/assets/hero-packaging.jpg";

const WA_LINK =
  "https://wa.me/5561993177107?text=Ol%C3%A1!%20Vim%20pelo%20site%20e%20gostaria%20de%20solicitar%20um%20or%C3%A7amento%20personalizado.%20Podem%20me%20ajudar?";

const stats = [
  { value: "15+", suffix: "anos", label: "no mercado de Brasília" },
  { value: "1.000", suffix: "+", label: "clientes satisfeitos" },
  { value: "4.9", suffix: "★", label: "no Google" },
];

const HeroSection = () => {
  return (
    <section className="relative pt-24 pb-16 md:pt-32 md:pb-28 overflow-hidden bg-[#F4F7FC]">
      {/* Fundo sutil */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[#1A50A0]/5 blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#F5C200]/8 blur-[80px]" />
      </div>

      <div className="container relative">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Texto */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {/* Localização */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#1A50A0]/15 text-[#1A50A0] text-xs font-medium mb-6 shadow-sm">
              <MapPin className="w-3 h-3" />
              Brasília · DF e Entorno
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-[3.25rem] font-extrabold text-[#0D1B2A] leading-[1.1] tracking-tight text-balance">
              Embalagens para{" "}
              <span className="text-[#1A50A0]">quem vende de verdade</span>
            </h1>

            <p className="mt-5 text-[1.05rem] text-[#4A5568] leading-relaxed max-w-[480px]">
              Fornecemos embalagens das melhores marcas do mercado para
              indústrias, comércios e negócios de food service no DF e região
              do entorno. Atendimento direto, estoque pronto e entrega grátis.
            </p>

            {/* Diferenciais reais */}
            <div className="mt-6 grid grid-cols-1 gap-2.5">
              {[
                "Entrega grátis no DF e entorno",
                "Estoque disponível — sem espera por pedido mínimo",
                "Atendimento via WhatsApp com resposta rápida",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2.5">
                  <div className="mt-0.5 w-4 h-4 rounded-full bg-[#1A50A0]/10 flex items-center justify-center shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#1A50A0]" />
                  </div>
                  <span className="text-sm text-[#4A5568]">{item}</span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <a
                href={WA_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg bg-[#1A50A0] text-white font-semibold hover:bg-[#153F80] transition-colors shadow-md shadow-[#1A50A0]/20"
              >
                <MessageCircle className="w-4 h-4" />
                Pedir Orçamento no WhatsApp
              </a>
              <a
                href="/catalogo"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg bg-white text-[#0D1B2A] font-semibold border border-[#D1DAE8] hover:border-[#1A50A0]/40 transition-colors"
              >
                Ver Catálogo
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* Stats */}
            <div className="mt-10 flex items-center gap-8 pt-8 border-t border-[#1A50A0]/10">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1, duration: 0.4 }}
                >
                  <p className="text-2xl font-extrabold text-[#0D1B2A] leading-none">
                    {stat.value}
                    <span className="text-[#1A50A0]">{stat.suffix}</span>
                  </p>
                  <p className="text-xs text-[#718096] mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Imagem */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-[#1A50A0]/10">
              <img
                src={heroImg}
                alt="Embalagens para delivery, food service e comércio em Brasília DF"
                className="w-full aspect-[4/3] object-cover"
                loading="eager"
              />
              {/* Overlay sutil no rodapé da imagem */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D1B2A]/15 to-transparent" />
            </div>

            {/* Card flutuante — avaliação Google */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.4 }}
              className="absolute -bottom-5 -left-5 md:-left-7 bg-white rounded-xl shadow-xl border border-[#E8EDF5] p-4 flex items-center gap-3"
            >
              <div>
                <p className="font-bold text-[#0D1B2A] text-sm leading-tight">
                  4.9 ★ no Google
                </p>
                <p className="text-xs text-[#718096] mt-0.5">
                  Avaliado por clientes reais
                </p>
              </div>
            </motion.div>

            {/* Card flutuante — entrega */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.0, duration: 0.4 }}
              className="absolute -top-4 -right-4 md:-right-6 bg-[#F5C200] rounded-xl shadow-lg p-3.5 flex items-center gap-2.5"
            >
              <MapPin className="w-4 h-4 text-[#1A3060] shrink-0" />
              <p className="text-xs font-semibold text-[#1A3060] leading-tight">
                Entrega grátis<br />DF e Entorno
              </p>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;