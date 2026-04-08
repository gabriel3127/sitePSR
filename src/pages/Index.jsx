import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import SocialProof from "@/components/SocialProof";
import ProductGrid from "@/components/ProductGrid";
import AboutSection from "@/components/AboutSection";
import InstagramFeed from "@/components/InstagramFeed";
import LocationSection from "@/components/LocationSection";
import FaqSection from "@/components/FaqSection";
import ConversionSection from "@/components/ConversionSection";
import WhatsAppButton from "@/components/WhatsAppButton";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import { useCanonical } from "@/hooks/useCanonical"

const Index = () => {
  useCanonical("https://www.psrembalagens.com.br/")
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
  );
};

export default Index;