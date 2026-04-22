import Link from "next/link"
import Image from "next/image"
import { ExternalLink, ShoppingBag, MessageCircle, MapPin, Star, FileText, Camera, Share2 } from "lucide-react"

export const metadata = {
  title: "Links | PSR Embalagens",
  description: "Todos os links da PSR Embalagens — catálogo, WhatsApp, redes sociais e mais.",
}

const WA_LINK = "https://wa.me/5561993177107?text=Ol%C3%A1!%20Vim%20pelo%20Instagram%20e%20gostaria%20de%20mais%20informa%C3%A7%C3%B5es."

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
    description: "Fale com um de nossos atendentes",
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
    description: "Confira a opinião de nossos clientes",
    href: "/depoimentos",
    external: false,
    accent: false,
  },
  {
    icon: MapPin,
    label: "Nossa Localização",
    description: "Ceasa-DF - SIA Trecho 16 CEASA DF PAV B-10B, BOX 07 - Brasília - DF, 71200-100",
    href: "https://maps.app.goo.gl/LHUQzJKfSZ3tSbJW8", // Fixed potentially broken URL
    external: true,
    accent: false,
  },
  {
    icon: Camera,
    label: "Siga-nos no Instagram",
    description: "@psrembalagens",
    href: "https://www.instagram.com/psrembalagens",
    external: true,
    accent: false,
  },
  {
    icon: Share2,
    label: "Curta no Facebook",
    description: "www.facebook.com/PSRembalagens/",
    href: "https://www.facebook.com/psrembalagens",
    external: true,
    accent: false,
  },
]

export default function LinksPage() {
  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col items-center px-4 py-12">
      <div className="text-center mb-8">
        <Image
          src="/images/psr-logo.svg"
          alt="PSR Embalagens"
          width={64}
          height={64}
          className="h-16 w-auto mx-auto mb-4"
        />
        <h1 className="text-xl font-bold text-[#0D1B2A]">PSR Embalagens</h1>
        <p className="text-sm text-[#718096] mt-1">
          Distribuidora de embalagens no DF · Desde 2010
        </p>
      </div>

      <div className="w-full max-w-md flex flex-col gap-3">
        {links.map((link) => {
          const Icon = link.icon
          
          // Shared styles to avoid repetition
          const baseStyles = "flex items-center gap-4 p-4 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
          const variantStyles = link.accent
            ? "bg-[#1A50A0] text-white shadow-lg shadow-[#1A50A0]/25 hover:bg-[#153F80]"
            : "bg-white text-[#0D1B2A] shadow-sm border border-[#E8EDF5] hover:border-[#1A50A0]/30"

          if (link.external) {
            return (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`${baseStyles} ${variantStyles}`}
              >
                <LinkContent Icon={Icon} link={link} />
              </a>
            )
          }

          return (
            <Link
              key={link.label}
              href={link.href}
              className={`${baseStyles} ${variantStyles}`}
            >
              <LinkContent Icon={Icon} link={link} />
            </Link>
          )
        })}
      </div>

      <p className="mt-10 text-xs text-[#718096]">
        © {new Date().getFullYear()} PSR Embalagens
      </p>
    </div>
  )
}

function LinkContent({
  Icon,
  link,
}: {
  Icon: React.ElementType
  link: { label: string; description: string; accent: boolean }
}) {
  return (
    <>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
        link.accent ? "bg-white/20" : "bg-[#F0F4FA]"
      }`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">{link.label}</p>
        <p className={`text-xs mt-0.5 ${link.accent ? "opacity-80" : "text-[#718096]"}`}>
          {link.description}
        </p>
      </div>
      <ExternalLink className={`w-4 h-4 shrink-0 ${link.accent ? "opacity-60" : "text-[#718096]"}`} />
    </>
  )
}