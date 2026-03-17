import { motion } from "framer-motion";
import { Award, Users, Package, Target } from "lucide-react";
import aboutImg from "@/assets/about-estoque.jpg";

const features = [
  { icon: Award, title: "15+ anos no mercado", desc: "Referência em embalagens no DF desde 2010." },
  { icon: Users, title: "1000+ clientes ativos", desc: "Base sólida de clientes em todos os segmentos." },
  { icon: Package, title: "Estoque diversificado", desc: "Ampla variedade para todas." },
  { icon: Target, title: "Parceiro estratégico", desc: "Soluções completas para PMEs crescerem." },
];

const AboutSection = () => {
  return (
    <section id="sobre" className="py-16 md:py-28 bg-muted relative">
      <div className="container">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-sm font-semibold text-primary tracking-wide uppercase mb-3">
              Sobre a PSR Embalagens
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold font-display text-foreground text-balance">
              Distribuidora de embalagens de confiança em Brasília
            </h2>
            <p className="mt-5 text-muted-foreground text-balance leading-relaxed">
              Desde 2010, a PSR Embalagens fornece embalagens descartáveis, biodegradáveis e para delivery 
              a restaurantes, mercados, hamburguerias e eventos em todo o Distrito Federal. 
              Localizada no CEASA, garantimos estoque pronto e entrega rápida.
            </p>
            <p className="mt-3 text-muted-foreground text-balance leading-relaxed">
              Nosso compromisso é oferecer o melhor custo-benefício do mercado, 
              com atendimento personalizado e consultoria para cada tipo de negócio.
            </p>

            <blockquote className="mt-8 border-l-4 border-primary pl-5 py-2 bg-primary/5 rounded-r-lg">
              <p className="italic text-muted-foreground leading-relaxed">
                "Acreditamos na construção de relacionamentos duradouros através de 
                produtos confiáveis e atendimento excepcional."
              </p>
              <footer className="mt-2 not-italic font-bold font-display text-foreground text-sm">— Equipe PSR Embalagens</footer>
            </blockquote>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="space-y-5"
          >
            <div className="rounded-2xl overflow-hidden shadow-elevated">
              <img
                src={aboutImg}
                alt="Estoque de embalagens da PSR Embalagens no CEASA Brasília DF"
                className="w-full aspect-[4/3] object-cover"
                loading="lazy"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="p-4 rounded-xl bg-card shadow-card hover:shadow-card-hover transition-all duration-300 group"
                >
                  <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                    <f.icon className="w-4.5 h-4.5 text-primary-foreground" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-bold font-display text-foreground text-sm">{f.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;


