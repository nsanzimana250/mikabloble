import Navbar from "./Navbar";
import Footer from "./Footer";
import WhatsAppWidget from "./WhatsAppWidget";
import { Analytics } from "@vercel/analytics/react";
import { JsonLdSchema } from "@/seo";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <JsonLdSchema />
      <Navbar />
      <main className="flex-1 pt-16 md:pt-20">{children}</main>
      <Footer />
      <WhatsAppWidget />
      <Analytics />
    </div>
  );
};

export default Layout;
