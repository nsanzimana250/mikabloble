export interface SEOData {
  title: string;
  description: string;
  keywords: string;
  canonical: string;
  ogImage?: string;
  ogType?: string;
  noIndex?: boolean;
}

export const siteConfig = {
  name: "MIKA GLOBAL BUSINESS LTD",
  shortName: "MIKA Global",
  url: "https://www.mikaglobalbusiness.com",
  logo: "https://www.mikaglobalbusiness.com/images/mika-logo.png",
  defaultDescription:
    "MIKA GLOBAL BUSINESS LTD supplies high-quality automotive parts, engine oils, lubricants, and car accessories from Kigali, Rwanda with free delivery and expert support.",
  defaultKeywords:
    "automotive parts Rwanda, car accessories Kigali, auto supplies Rwanda, genuine car parts, replacement components, MIKA GLOBAL BUSINESS, engine oil Rwanda, lubricants Kigali, auto parts supplier",
  phone: "+250-788-123-456",
  email: "info@mikaglobalbusiness.com",
  address: {
    street: "KN 4 Ave",
    city: "Kigali City",
    country: "RW",
  },
  social: {
    facebook: "https://facebook.com/mikaglobalbusiness",
    twitter: "https://twitter.com/mikaglobalbiz",
    instagram: "https://instagram.com/mikaglobalbusiness",
    whatsapp: "https://wa.me/250788123456",
  },
};

export const pageSEO: Record<string, SEOData> = {
  home: {
    title: "MIKA GLOBAL BUSINESS LTD | Premium Auto Parts & Accessories in Rwanda",
    description:
      "Your trusted supplier of genuine automotive parts, engine oils, lubricants, and car accessories in Kigali, Rwanda. Free delivery, expert support, quality guaranteed.",
    keywords: siteConfig.defaultKeywords,
    canonical: siteConfig.url,
    ogType: "website",
  },
  products: {
    title: "Auto Parts & Accessories | MIKA GLOBAL BUSINESS LTD Rwanda",
    description:
      "Browse our extensive catalog of genuine automotive parts, engine oils, lubricants, shock absorbers, car lighting, and accessories. Quality auto supplies in Kigali, Rwanda.",
    keywords:
      "auto parts catalog, car parts Rwanda, engine oil brands, automotive accessories, vehicle parts Kigali, car spare parts, MIKA GLOBAL products",
    canonical: `${siteConfig.url}/products`,
    ogType: "website",
  },
  productDetail: {
    title: "{productName} | MIKA GLOBAL BUSINESS LTD",
    description:
      "Shop {productName} at MIKA GLOBAL BUSINESS LTD. Premium quality auto parts with free delivery in Rwanda. Order now for expert support and genuine products.",
    keywords: siteConfig.defaultKeywords,
    canonical: `${siteConfig.url}/products/{productId}`,
    ogType: "product",
  },
  cart: {
    title: "Shopping Cart | MIKA GLOBAL BUSINESS LTD",
    description:
      "Review your selected auto parts and accessories in your shopping cart. Secure checkout and free delivery available in Rwanda.",
    keywords: "shopping cart, auto parts cart, car accessories order, MIKA GLOBAL cart",
    canonical: `${siteConfig.url}/cart`,
    ogType: "website",
  },
  checkout: {
    title: "Checkout | MIKA GLOBAL BUSINESS LTD",
    description:
      "Complete your order securely. Quality automotive parts delivered to your doorstep in Rwanda.",
    keywords: "checkout, order auto parts, secure payment, auto parts delivery Rwanda",
    canonical: `${siteConfig.url}/checkout`,
    ogType: "website",
    noIndex: true,
  },
  about: {
    title: "About Us | MIKA GLOBAL BUSINESS LTD - Auto Parts Supplier Rwanda",
    description:
      "Learn about MIKA GLOBAL BUSINESS LTD, a trusted Kigali-based supplier of high-quality automotive parts, engine oils, and accessories. Serving Rwanda with genuine products since our founding.",
    keywords:
      "about MIKA GLOBAL, auto parts company Rwanda, automotive supplier Kigali, car parts history, MIKA GLOBAL mission",
    canonical: `${siteConfig.url}/about`,
    ogType: "website",
  },
  contact: {
    title: "Contact Us | MIKA GLOBAL BUSINESS LTD - Kigali, Rwanda",
    description:
      "Get in touch with MIKA GLOBAL BUSINESS LTD. Visit our showroom in Kigali, call us, or send a message. We're here to help with all your automotive parts needs.",
    keywords:
      "contact MIKA GLOBAL, auto parts Kigali location, car parts supplier contact, Rwanda automotive help, MIKA GLOBAL address",
    canonical: `${siteConfig.url}/contact`,
    ogType: "website",
  },
  login: {
    title: "Sign In | MIKA GLOBAL BUSINESS LTD",
    description:
      "Sign in to your MIKA GLOBAL BUSINESS LTD account to manage orders, track deliveries, and access your personalized auto parts dashboard.",
    keywords: "login, sign in, customer account, auto parts account, MIKA GLOBAL login",
    canonical: `${siteConfig.url}/login`,
    ogType: "website",
    noIndex: true,
  },
  signup: {
    title: "Create Account | MIKA GLOBAL BUSINESS LTD",
    description:
      "Create your MIKA GLOBAL BUSINESS LTD account for faster checkout, order tracking, and exclusive auto parts deals in Rwanda.",
    keywords: "signup, create account, register, new customer, auto parts account registration",
    canonical: `${siteConfig.url}/signup`,
    ogType: "website",
    noIndex: true,
  },
  profile: {
    title: "My Profile | MIKA GLOBAL BUSINESS LTD",
    description: "Manage your MIKA GLOBAL BUSINESS LTD account profile, orders, and preferences.",
    keywords: "profile, account settings, my account, customer profile, MIKA GLOBAL profile",
    canonical: `${siteConfig.url}/profile`,
    ogType: "website",
    noIndex: true,
  },
  notifications: {
    title: "Notifications | MIKA GLOBAL BUSINESS LTD",
    description: "View your notifications and order updates from MIKA GLOBAL BUSINESS LTD.",
    keywords: "notifications, order updates, alerts, MIKA GLOBAL notifications",
    canonical: `${siteConfig.url}/notifications`,
    ogType: "website",
    noIndex: true,
  },
  notFound: {
    title: "Page Not Found (404) | MIKA GLOBAL BUSINESS LTD",
    description: "The page you're looking for doesn't exist. Browse our automotive parts catalog or contact us for assistance.",
    keywords: "404, page not found, error, MIKA GLOBAL 404",
    canonical: `${siteConfig.url}/404`,
    ogType: "website",
    noIndex: true,
  },
};