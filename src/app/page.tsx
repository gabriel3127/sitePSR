import type { Metadata } from "next"
import Navbar from "@/components/Navbar"
import HeroSection from "@/components/sections/HeroSection"
import SocialProof from "@/components/sections/SocialProof"
import ProductGrid from "@/components/sections/ProductGrid"
import AboutSection from "@/components/sections/AboutSection"
import InstagramFeed from "@/components/sections/InstagramFeed"
import LocationSection from "@/components/sections/LocationSection"
import ConversionSection from "@/components/sections/ConversionSection"
import FaqSection from "@/components/sections/FaqSection"
import Footer from "@/components/Footer"
import WhatsAppButton from "@/components/WhatsAppButton"
import MobileBottomNav from "@/components/MobileBottomNav"

export const metadata: Metadata = {
  title: "PSR Embalagens | Distribuidora de Embalagens em Brasília",
  description:
    "Distribuidora de embalagens para mercados, gastronomia, lavanderias e muito mais. Veja nosso catálogo completo com entrega grátis no DF e entorno.",
  alternates: {
    canonical: "https://www.psrembalagens.com.br/",
  },
  openGraph: {
    title: "PSR Embalagens | Distribuidora de Embalagens em Brasília",
    description:
      "Embalagens para mercados, gastronomia, lavanderias e mais. Entrega grátis no DF.",
    url: "https://www.psrembalagens.com.br/",
    images: [
      {
        url: "https://www.psrembalagens.com.br/og-image.webp",
        width: 1200,
        height: 630,
        alt: "PSR Embalagens",
      },
    ],
  },
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background pb-16 lg:pb-0">
      <Navbar />
      <main>
        <HeroSection />
        <SocialProof />
        <ProductGrid />
        <AboutSection />
        <InstagramFeed />
        <LocationSection />
        <ConversionSection />
        <FaqSection />
      </main>
      <Footer />
      <WhatsAppButton />
      <MobileBottomNav />
    </div>
  )
}