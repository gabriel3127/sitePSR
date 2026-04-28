import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Script from "next/script"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

const GA4_ID = "G-X2XTHETLWD"

export const metadata: Metadata = {
  title: {
    default: "PSR Embalagens | Distribuidora de Embalagens em Brasília",
    template: "%s | PSR Embalagens",
  },
  description:
    "Distribuidora de embalagens para mercados, gastronomia, lavanderias e muito mais. Entrega grátis no DF e entorno. Atendimento rápido no CEASA Brasília.",
  metadataBase: new URL("https://psrembalagens.com.br"),
  alternates: { 
    canonical: "/", // This will correctly resolve to https://psrembalagens.com.br/
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://psrembalagens.com.br",
    siteName: "PSR Embalagens",
    title: "PSR Embalagens | Distribuidora de Embalagens em Brasília",
    description: "Distribuidora de embalagens para mercados, gastronomia, lavanderias e muito mais. Entrega grátis no DF e entorno.",
    images: [
      { 
        // TIP: Convert your logo to PNG for social sharing. SVGs are rarely supported by social crawlers.
        url: "/images/og-image.png", 
        width: 1200, 
        height: 630, 
        alt: "PSR Embalagens" 
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PSR Embalagens | Distribuidora de Embalagens em Brasília",
    description: "Distribuidora de embalagens para mercados, gastronomia, lavanderias e muito mais. Entrega grátis no DF e entorno.",
    images: ["/images/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/images/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/images/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/images/favicon.ico" },
    ],
    apple: "/images/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
}

const schemaOrg = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://psrembalagens.com.br/#organization",
      name: "PSR Embalagens",
      url: "https://psrembalagens.com.br",
      logo: { "@type": "ImageObject", url: "https://psrembalagens.com.br/images/psr-logo.svg" },
      sameAs: ["https://instagram.com/psrembalagens", "https://facebook.com/psrembalagens"],
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+55-61-99317-7107",
        contactType: "customer service",
        availableLanguage: "Portuguese",
        areaServed: "BR",
      },
    },
    {
      "@type": "LocalBusiness",
      "@id": "https://psrembalagens.com.br/#localbusiness",
      name: "PSR Embalagens",
      description: "Distribuidora de embalagens, descartáveis e produtos de limpeza para mercados, gastronomia, lavanderias e muito mais. Entrega grátis no DF e entorno desde 2010.",
      url: "https://psrembalagens.com.br",
      telephone: "+55-61-99317-7107",
      email: "contato@psrembalagens.com.br",
      foundingDate: "2010",
      priceRange: "$$",
      image: "https://psrembalagens.com.br/images/psr-logo.svg",
      address: {
        "@type": "PostalAddress",
        streetAddress: "CEASA — SIA Trecho 3, Lote 1.245",
        addressLocality: "Brasília",
        addressRegion: "DF",
        postalCode: "71200-030",
        addressCountry: "BR",
      },
      geo: { "@type": "GeoCoordinates", latitude: -15.7942, longitude: -47.9292 },
      openingHoursSpecification: [
        { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday"], opens: "07:00", closes: "17:00" },
        { "@type": "OpeningHoursSpecification", dayOfWeek: "Saturday", opens: "07:00", closes: "12:00" },
      ],
      areaServed: [{ "@type": "City", name: "Brasília" }, { "@type": "State", name: "Distrito Federal" }],
      hasOfferCatalog: { "@type": "OfferCatalog", name: "Catálogo de Embalagens e Descartáveis", url: "https://psrembalagens.com.br/catalogo" },
      sameAs: ["https://instagram.com/psrembalagens", "https://facebook.com/psrembalagens"],
    },
    {
      "@type": "WebSite",
      "@id": "https://psrembalagens.com.br/#website",
      url: "https://psrembalagens.com.br",
      name: "PSR Embalagens",
      publisher: { "@id": "https://psrembalagens.com.br/#organization" },
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: "https://psrembalagens.com.br/catalogo?q={search_term_string}" },
        "query-input": "required name=search_term_string",
      },
    },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fqzxnnylmzjwvcukfxba.supabase.co" />
      </head>
      <body className={`${inter.className} antialiased`}>
        {/* JSON-LD Schema inside the body is better for hydration in some Next.js versions */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
        />
        
        {children}

        {/* GA4 — 'afterInteractive' is usually preferred over 'lazyOnload' for analytics accuracy */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA4_ID}', { page_path: window.location.pathname });
          `}
        </Script>
      </body>
    </html>
  )
}