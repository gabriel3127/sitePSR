import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Star, Quote, ExternalLink } from "lucide-react";
import psrLogo from "@/assets/psr-logo.svg";

const reviews = [
  { name: "Carlos Mendes", business: "Hamburgueria Artesanal", rating: 5, text: "A PSR Embalagens é nossa parceira há mais de 2 anos. As caixas kraft para nossos hambúrgueres são de excelente qualidade e o preço é justo. Entrega sempre no prazo!", avatar: "CM" },
  { name: "Ana Paula Souza", business: "Mercado Bom Preço", rating: 5, text: "Atendimento impecável! Sempre que preciso de reposição urgente de bandejas e sacolas, a PSR resolve rapidamente. Recomendo demais!", avatar: "AP" },
  { name: "Roberto Lima", business: "Restaurante Sabor do Cerrado", rating: 5, text: "Mudamos para biodegradáveis da PSR e nossos clientes adoraram. Além de ajudar o meio ambiente, a qualidade é superior.", avatar: "RL" },
  { name: "Fernanda Oliveira", business: "Doceria Doce Mel", rating: 5, text: "Encontrei tudo o que precisava para minha confeitaria em um só lugar. Embalagens para doces e bolos são lindas e resistentes.", avatar: "FO" },
  { name: "Marcos Vieira", business: "Açougue Premium", rating: 5, text: "Compro bandejas, filme stretch e sacolas há mais de 3 anos. Nunca tive problema com qualidade. A PSR é confiança total!", avatar: "MV" },
  { name: "Juliana Costa", business: "Buffet Festas & Cia", rating: 5, text: "Para eventos de grande porte, preciso de fornecedor confiável. A PSR nunca me deixou na mão, mesmo com pedidos de última hora.", avatar: "JC" },
  { name: "Pedro Santos", business: "Lanchonete do Pedro", rating: 4, text: "Ótimos preços para quem compra em quantidade. O pessoal é muito atencioso e me ajudou a escolher as embalagens certas para meu delivery.", avatar: "PS" },
  { name: "Maria Helena", business: "Padaria Pão Dourado", rating: 5, text: "A variedade de produtos é impressionante. Desde sacos de papel até descartáveis para a área de alimentação, tudo de qualidade.", avatar: "MH" },
];

const Depoimentos = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="container flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <img src={psrLogo} alt="PSR Embalagens" className="h-10" />
          </Link>
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Voltar ao site
          </Link>
        </div>
      </header>

      <div className="container py-12">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-4">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">O Que Nossos Clientes Dizem</h1>
          <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
            Mais de 500 estabelecimentos confiam na PSR Embalagens. Veja depoimentos reais de clientes satisfeitos.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-12"
        >
          <a
            href="https://www.google.com/maps/place/PSR+Embalagens"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-card rounded-full px-6 py-3 shadow-card hover:shadow-card-hover transition-shadow"
          >
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-accent text-accent" />
              ))}
            </div>
            <span className="font-bold text-foreground">4.9</span>
            <span className="text-sm text-muted-foreground">no Google Reviews</span>
            <ExternalLink className="w-4 h-4 text-muted-foreground" />
          </a>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review, i) => (
            <motion.div
              key={review.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card rounded-lg p-6 shadow-card relative"
            >
              <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/10" />
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                  {review.avatar}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{review.name}</p>
                  <p className="text-xs text-muted-foreground">{review.business}</p>
                </div>
              </div>
              <div className="flex gap-0.5 mb-3">
                {[...Array(review.rating)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-accent text-accent" />
                ))}
                {[...Array(5 - review.rating)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 text-muted-foreground/30" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{review.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Depoimentos;