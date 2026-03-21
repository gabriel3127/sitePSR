import { motion } from "framer-motion";
import aboutImg from "@/assets/about-estoque.jpg";

const stats = [
  { value: "15+", label: "Anos no mercado" },
  { value: "1.000+", label: "Clientes Satisfeitos" },
  { value: "Grátis", label: "Entrega no DF e entorno" },
  { value: "Rápido", label: "Atendimento via WhatsApp" },
];

const AboutSection = () => {
  return (
    <section id="sobre" className="py-16 md:py-28 bg-muted relative">
      <div className="container">

        {/* Linha superior: imagem + stats */}
        <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Imagem */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="rounded-2xl overflow-hidden shadow-elevated">
              <img
                src={aboutImg}
                alt="Estoque de embalagens da PSR Embalagens no CEASA Brasília DF"
                className="w-full aspect-[4/3] object-cover"
                loading="lazy"
              />
            </div>

            {/* Badge sobre a imagem */}
            <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg px-3 py-2 flex items-center gap-2 border border-border/40">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs font-semibold text-foreground">CEASA · Brasília</span>
            </div>
          </motion.div>

          {/* Texto + stats */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <p className="text-sm font-semibold text-primary tracking-wide uppercase mb-3">
              Sobre a PSR Embalagens
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold font-display text-foreground text-balance">
              Distribuidora de confiança em Brasília
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Há mais de uma década, a PSR Embalagens abastece indústrias,
              comércios e consumidores no DF e região do entorno.
              Localizada no CEASA, trabalhamos com as melhores marcas do mercado
              e mantemos estoque pronto para entrega imediata.
            </p>

            {/* Stats grid */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: 0.2 + i * 0.08 }}
                  className="p-4 rounded-xl bg-card border border-border/50 shadow-card"
                >
                  <p className="text-2xl font-extrabold font-display text-[#1A50A0] leading-none">
                    {s.value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wide font-medium">
                    {s.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Citação centralizada embaixo */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-16 text-center max-w-2xl mx-auto"
        >
          <div className="text-[#1A50A0] text-5xl font-serif leading-none mb-4">"</div>
          <p className="text-lg md:text-xl text-foreground font-medium leading-relaxed text-balance">
            "Acreditamos na construção de relacionamentos duradouros, fornecendo não apenas embalagens,
            mas segurança e confiança que sustentam o crescimento dos nossos parceiros."
          </p>
          <div className="mt-5">
            <p className="font-bold font-display text-foreground text-sm">
              PSR Embalagens
            </p>
            <p className="text-xs text-muted-foreground tracking-widest uppercase mt-0.5">
              Compromisso com o cliente
            </p>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default AboutSection;