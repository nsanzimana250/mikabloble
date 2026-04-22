import Layout from "@/components/Layout";
import HeroSection from "@/components/home/HeroSection";
import CategoriesSection from "@/components/home/CategoriesSection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import SpecialOffers from "@/components/home/SpecialOffers";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import BrandsCarousel from "@/components/home/BrandsCarousel";
import PartnersSection from "@/components/home/PartnersSection";
import Testimonials from "@/components/home/Testimonials";
import Newsletter from "@/components/home/Newsletter";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <CategoriesSection />
      <FeaturedProducts />
      <SpecialOffers />
      <WhyChooseUs />
      <BrandsCarousel />
      <PartnersSection />
      <Testimonials />
      <Newsletter />
    </Layout>
  );
};

export default Index;
