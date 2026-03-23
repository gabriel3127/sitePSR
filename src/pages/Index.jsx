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

const Index = () => {
  return (
    <div className="min-h-screen bg-background pb-16 lg:pb-0">
      <Navbar />
      <HeroSection />
      <SocialProof />
      <ProductGrid />
      <AboutSection />
      <InstagramFeed />
      <LocationSection />
      <FaqSection />
      <ConversionSection />
      <Footer />
      <WhatsAppButton />
      <MobileBottomNav />
    </div>
  );
};

export default Index;