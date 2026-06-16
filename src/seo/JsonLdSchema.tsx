import { Helmet } from "react-helmet-async";
import { siteConfig } from "./seo.config";

const JsonLdSchema = () => {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    alternateName: siteConfig.shortName,
    url: siteConfig.url,
    logo: siteConfig.logo,
    description: siteConfig.defaultDescription,
    foundingDate: "2016",
    telephone: siteConfig.phone,
    email: siteConfig.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.address.street,
      addressLocality: siteConfig.address.city,
      addressCountry: siteConfig.address.country,
    },
    sameAs: [siteConfig.social.facebook, siteConfig.social.twitter, siteConfig.social.instagram],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: siteConfig.phone,
      contactType: "Customer Service",
      areaServed: "RW",
      availableLanguage: ["English", "Kinyarwanda", "French", "Swahili"],
    },
    areaServed: [
      {
        "@type": "Country",
        name: "Rwanda",
      },
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Automotive Parts & Accessories",
      itemListElement: [
        {
          "@type": "OfferCatalog",
          name: "Engine Oils & Lubricants",
          url: `${siteConfig.url}/products`,
        },
        {
          "@type": "OfferCatalog",
          name: "Auto Parts & Accessories",
          url: `${siteConfig.url}/products`,
        },
      ],
    },
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteConfig.url}/products?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: siteConfig.name,
    image: siteConfig.logo,
    url: siteConfig.url,
    telephone: siteConfig.phone,
    email: siteConfig.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.address.street,
      addressLocality: siteConfig.address.city,
      addressCountry: siteConfig.address.country,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "08:00",
        closes: "18:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Saturday",
        opens: "08:00",
        closes: "14:00",
      },
    ],
    priceRange: "$$",
    currencyAccepted: "RWF",
    paymentAccepted: ["Cash", "Mobile Money", "Bank Transfer"],
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(organizationSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(websiteSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(localBusinessSchema)}</script>

      {/* Dublin Core Meta Tags */}
      <meta name="dc.title" content={siteConfig.name} />
      <meta name="dc.description" content={siteConfig.defaultDescription} />
      <meta name="dc.identifier" content={siteConfig.url} />
      <meta name="dc.language" content="en" />
      <meta name="dc.coverage" content="Rwanda" />
      <meta name="dc.subject" content="Automotive Parts, Auto Accessories, Car Parts" />

      {/* Geo Tags */}
      <meta name="geo.region" content="RW-KG" />
      <meta name="geo.placename" content="Kigali" />

      {/* Mobile SEO */}
      <meta name="format-detection" content="telephone=yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-title" content={siteConfig.shortName} />
      <meta name="apple-mobile-web-app-status-bar-style" content="#1f3f94" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="HandheldFriendly" content="True" />
    </Helmet>
  );
};

export default JsonLdSchema;