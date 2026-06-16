import Layout from "@/components/Layout";
import HeroSection from "@/components/home/HeroSection";
import ProductShowcaseSection from "@/components/home/ProductShowcaseSection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import SpecialOffers from "@/components/home/SpecialOffers";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import BrandsCarousel from "@/components/home/BrandsCarousel";
import PartnersSection from "@/components/home/PartnersSection";
import Testimonials from "@/components/home/Testimonials";
import Newsletter from "@/components/home/Newsletter";
import { SEOHelmet } from "@/seo";
import { pageSEO } from "@/seo";

const Index = () => {
  return (
    <Layout>
      <SEOHelmet seo={pageSEO.home} />
      <HeroSection />
      <ProductShowcaseSection />
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