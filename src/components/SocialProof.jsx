import { motion } from "framer-motion";
import { MapPin, Truck, MessageCircle, Package } from "lucide-react";

const differentials = [
  {
    icon: MapPin,
    title: "Localização Estratégica",
    desc: "Na CEASA de Brasília — no coração da distribuição do DF, o que garante agilidade e estoque sempre abastecido.",
    gradient: "from-primary/10 to-primary/5",
  },
  {
    icon: Truck,
    title: "Entrega Grátis",
    desc: "Rotas diárias cobrindo todo o Distrito Federal e região do entorno sem custo adicional.",
    gradient: "from-accent/10 to-accent/5",
  },
  {
    icon: MessageCircle,
    title: "Atendimento Direto",
    desc: "Fale com quem entende de embalagem. Atendimento via WhatsApp com resposta rápida e sem enrolação.",
    gradient: "from-primary/10 to-primary/5",
  },
  {
    icon: Package,
    title: "Variedade de Marcas",
    desc: "Trabalhamos com as principais marcas do mercado — descartáveis, biodegradáveis, food service e muito mais.",
    gradient: "from-accent/10 to-accent/5",
  },
];

const SocialProof = () => {
  return (
    <section id="diferenciais" className="py-16 md:py-24 relative">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <p className="text-sm font-semibold text-primary tracking-wide uppercase mb-3">
            Por que a PSR?
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold font-display text-foreground text-balance">
            Direto ao ponto: o que você ganha trabalhando com a gente
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {differentials.map((d, i) => (
            <motion.div
              key={d.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className={`group relative p-6 rounded-2xl bg-gradient-to-br ${d.gradient} border border-border/50 hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 text-center`}
            >
              <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
                <d.icon className="w-6 h-6 text-primary-foreground" strokeWidth={1.5} />
              </div>
              <h3 className="font-bold font-display text-foreground text-lg">{d.title}</h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{d.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProof;