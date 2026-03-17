import { motion } from "framer-motion";
import { ArrowRight, Star, CheckCircle } from "lucide-react";
import heroImg from "@/assets/hero-packaging.jpg";

const WA_LINK = "https://wa.me/5561993177107?text=Ol%C3%A1!%20Vim%20pelo%20site%20e%20gostaria%20de%20solicitar%20um%20or%C3%A7amento%20personalizado.%20Podem%20me%20ajudar?";

const HeroSection = () => {
  return (
    <section className="relative pt-24 pb-16 md:pt-32 md:pb-28 overflow-hidden bg-[#EEF3FB]">
      <div className="absolute top-20 -left-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-accent/5 blur-3xl" />

      <div className="container relative">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide uppercase mb-6">
              <Star className="w-3.5 h-3.5 fill-primary" />
              PSR Embalagens — Desde 2010
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold font-display text-foreground leading-[1.1] text-balance">
              Embalagens profissionais para{" "}
              <span className="text-[#1A50A0]">seu negócio crescer</span>
            </h1>

            <p className="mt-6 text-lg text-muted-foreground text-balance max-w-lg leading-relaxed">
              A distribuidora de embalagens mais completa de Brasília.
              Descartáveis, biodegradáveis e delivery com entrega grátis no DF.
            </p>

            <div className="mt-4 flex flex-col gap-2">
              {["Entrega grátis para todo o DF", "Mais de 1.000 clientes satisfeitos", "Estoque pronto para envio imediato"].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <a
                href={WA_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg gradient-primary text-primary-foreground font-semibold hover:opacity-90 transition-all shadow-lg shadow-primary/25"
              >
                Solicitar Orçamento
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="/catalogo"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg bg-card text-foreground font-semibold shadow-card hover:shadow-card-hover transition-all border border-border"
              >
                Ver Catálogo
              </a>
            </div>

            <div className="mt-10 flex items-center gap-8">
              {[
                { value: "15+", label: "Anos no mercado" },
                { value: "1000+", label: "Clientes ativos" },
                { value: "4.9★", label: "No Google" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-extrabold font-display text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-elevated">
              <img
                src={heroImg}
                alt="Embalagens descartáveis e biodegradáveis para delivery e comércio em Brasília DF"
                className="w-full aspect-[4/3] object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent" />
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.4 }}
              className="absolute -bottom-4 -left-4 md:-left-6 bg-card rounded-xl shadow-elevated p-4 flex items-center gap-3 animate-float"
            >
              <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                <Star className="w-5 h-5 text-primary-foreground fill-primary-foreground" />
              </div>
              <div>
                <p className="font-bold font-display text-foreground text-sm">4.9 no Google</p>
                <p className="text-xs text-muted-foreground">+80 avaliações</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;