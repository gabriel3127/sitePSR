import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import productDescartaveis from "@/assets/product-descartaveis.jpg";
import productMercado from "@/assets/product-mercado.jpg";
import productLanchonete from "@/assets/product-lanchonete.jpg";
import productFesta from "@/assets/product-festa.jpg";
import productLimpeza from "@/assets/product-limpeza.webp";
import productDiversos from "@/assets/product-diversos.webp";
import productBio from "@/assets/product-bio.jpg";

const products = [
  {
    title: "Descartáveis",
    description: "Marmitas, copos e talheres descartáveis resistentes para seu negócio.",
    image: productDescartaveis,
    catalog: "https://drive.google.com/file/d/1LIrOP428rU06KcayxGQaEQGGBOp89a3V/view?usp=drive_link",
  },
  {
    title: "Mercados e Açougues",
    description: "Bandejas, filmes e sacolas essenciais para supermercados e açougues.",
    image: productMercado,
    catalog: "https://drive.google.com/file/d/1iYkthT6MGaOa8F_eBqQLU05lRoCyVhzF/view?usp=drive_link",
  },
  {
    title: "Hamburguerias e Lanchonetes",
    description: "Embalagens kraft e caixas para delivery de hambúrgueres e lanches.",
    image: productLanchonete,
    catalog: "https://drive.google.com/file/d/1uuz4PlmTjHLOMjb0bpSJH1KKxf9g519G/view?usp=drive_link",
  },
  {
    title: "Embalagens para Festas",
    description: "Pratos, copos e utensílios descartáveis para eventos e comemorações.",
    image: productFesta,
    catalog: "https://drive.google.com/file/d/1oSzLXHonf5yhQOXTeeLFRDkbfyUaesLS/view?usp=drive_link",
  },
  {
    title: "Higiene e Limpeza",
    description: "Produtos profissionais de limpeza para estabelecimentos comerciais.",
    image: productLimpeza,
    catalog: "https://drive.google.com/file/d/1Pgh-Ltb-Ek8sx_ivY2Ez6gd9dnjMG9BT/view?usp=drive_link",
  },
  {
    title: "Diversos",
    description: "Fitas, filmes stretch e soluções variadas para embalagem e logística.",
    image: productDiversos,
    catalog: "https://drive.google.com/file/d/1cGcCz__o0PZ9-8A_znL7ym8GwL5k3Bw_/view?usp=drive_link",
  },
  {
    title: "Biodegradáveis",
    description: "Embalagens sustentáveis de cana-de-açúcar e materiais ecológicos.",
    image: productBio,
    catalog: "https://drive.google.com/file/d/12rzp90i3YpxGQ6bIdT_0HGuItn2_90Ac/view?usp=drive_link",
  },
];

const ProductGrid = () => {
  return (
    <section id="produtos" className="py-16 md:py-28 bg-muted relative">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <p className="text-sm font-semibold text-primary tracking-wide uppercase mb-3">
            Nossos Produtos
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold font-display text-foreground">
            Embalagens para todos os segmentos
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-balance leading-relaxed">
            Ampla seleção de embalagens profissionais com pronta entrega em Brasília. 
            Clique em uma categoria para ver o catálogo completo.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {products.map((product, i) => (
            <motion.a
              key={product.title}
              href={product.catalog}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="group bg-card rounded-2xl shadow-card hover:shadow-card-hover hover:-translate-y-1.5 transition-all duration-300 overflow-hidden"
            >
              <div className="aspect-[4/3] overflow-hidden relative">
                <img
                  src={product.image}
                  alt={`Embalagens ${product.title} - PSR Embalagens Brasília`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-card/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                  <ArrowUpRight className="w-4 h-4 text-primary" />
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold font-display text-foreground text-lg">{product.title}</h3>
                <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{product.description}</p>
                <span className="inline-flex items-center gap-1 mt-3 text-sm font-semibold text-primary group-hover:gap-2 transition-all">
                  Ver Catálogo <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;


