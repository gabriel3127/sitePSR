import { motion } from "framer-motion";
import { Instagram, ArrowUpRight } from "lucide-react";
import productDescartaveis from "@/assets/product-descartaveis.jpg";
import productMercado from "@/assets/product-mercado.jpg";
import productLanchonete from "@/assets/product-lanchonete.jpg";
import productFesta from "@/assets/product-festa.jpg";
import productBio from "@/assets/product-bio.jpg";
import productLimpeza from "@/assets/product-limpeza.webp";

const INSTAGRAM_URL = "https://www.instagram.com/psrembalagens";

const instagramPosts = [
  { id: 1, caption: "Novidades biodegradáveis 🌿", image: productBio },
  { id: 2, caption: "Entrega rápida no DF 🚚", image: productMercado },
  { id: 3, caption: "Delivery de qualidade 🍔", image: productLanchonete },
  { id: 4, caption: "Festas e eventos 🎉", image: productFesta },
  { id: 5, caption: "Descartáveis profissionais ✨", image: productDescartaveis },
  { id: 6, caption: "Limpeza profissional 🧹", image: productLimpeza },
];

const InstagramFeed = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <p className="text-sm font-semibold text-primary tracking-wide uppercase mb-3">
            @psrembalagens
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold font-display text-foreground">
            Acompanhe no Instagram
          </h2>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Novidades, promoções e bastidores da PSR Embalagens
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {instagramPosts.map((post, i) => (
            <motion.a
              key={post.id}
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="aspect-square rounded-xl overflow-hidden relative group"
            >
              <img
                src={post.image}
                alt={post.caption}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/50 transition-colors duration-300 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <Instagram className="w-7 h-7 text-background" />
                <p className="text-xs font-medium text-background px-2 text-center leading-tight">{post.caption}</p>
              </div>
            </motion.a>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-8"
        >
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg gradient-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
          >
            <Instagram className="w-5 h-5" />
            Seguir @psrembalagens
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default InstagramFeed;


