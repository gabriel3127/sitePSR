import { motion } from "framer-motion";
import { ExternalLink, ShoppingBag, MessageCircle, MapPin, Instagram, Facebook, Star, FileText } from "lucide-react";
import psrLogo from "@/assets/psr-logo.svg";

const WA_LINK = "https://wa.me/5561993177107?text=Ol%C3%A1!%20Vim%20pelo%20Instagram%20e%20gostaria%20de%20mais%20informa%C3%A7%C3%B5es.";

const links = [
  {
    icon: ShoppingBag,
    label: "Catálogo de Produtos",
    description: "Veja nossos produtos e monte sua lista",
    href: "/catalogo",
    external: false,
    accent: true,
  },
  {
    icon: MessageCircle,
    label: "Fale no WhatsApp",
    description: "Solicite orçamento personalizado",
    href: WA_LINK,
    external: true,
    accent: true,
  },
  {
    icon: FileText,
    label: "Blog — Dicas de Embalagens",
    description: "Conteúdo para seu negócio",
    href: "/blog",
    external: false,
    accent: false,
  },
  {
    icon: Star,
    label: "Depoimentos de Clientes",
    description: "Veja o que dizem sobre a PSR",
    href: "/depoimentos",
    external: false,
    accent: false,
  },
  {
    icon: MapPin,
    label: "Nossa Localização",
    description: "CEASA-DF, Núcleo Rural — Brasília",
    href: "https://maps.app.goo.gl/PSREmbalagens",
    external: true,
    accent: false,
  },
  {
    icon: Instagram,
    label: "Siga no Instagram",
    description: "@psrembalagens",
    href: "https://www.instagram.com/psrembalagens",
    external: true,
    accent: false,
  },
  {
    icon: Facebook,
    label: "Curta no Facebook",
    description: "/psrembalagens",
    href: "https://www.facebook.com/psrembalagens",
    external: true,
    accent: false,
  },
];

const Links = () => {
  return (
    <div className="min-h-screen bg-muted flex flex-col items-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <img src={psrLogo} alt="PSR Embalagens" className="h-16 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-foreground">PSR Embalagens</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Distribuidora de embalagens no DF · Desde 2009
        </p>
      </motion.div>

      <div className="w-full max-w-md space-y-3">
        {links.map((link, i) => {
          const Icon = link.icon;
          const Tag = link.external ? "a" : "a";
          const props = link.external
            ? { href: link.href, target: "_blank", rel: "noopener noreferrer" }
            : { href: link.href };

          return (
            <motion.a
              key={link.label}
              {...props}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-200 hover:-translate-y-0.5 ${
                link.accent
                  ? "bg-primary text-primary-foreground shadow-lg hover:opacity-90"
                  : "bg-card text-foreground shadow-card hover:shadow-card-hover"
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                link.accent ? "bg-primary-foreground/20" : "bg-secondary"
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{link.label}</p>
                <p className={`text-xs mt-0.5 ${link.accent ? "opacity-80" : "text-muted-foreground"}`}>
                  {link.description}
                </p>
              </div>
              <ExternalLink className={`w-4 h-4 shrink-0 ${link.accent ? "opacity-60" : "text-muted-foreground"}`} />
            </motion.a>
          );
        })}
      </div>

      <p className="mt-10 text-xs text-muted-foreground">
        © {new Date().getFullYear()} PSR Embalagens
      </p>
    </div>
  );
};

export default Links;


