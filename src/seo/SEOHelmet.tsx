import { Helmet } from "react-helmet-async";
import { SEOData, siteConfig } from "./seo.config";

interface SEOHelmetProps {
  seo: SEOData;
  productName?: string;
  productId?: string;
  productPrice?: string;
  productImage?: string;
  productAvailability?: string;
  productBrand?: string;
  imageAlt?: string;
  breadcrumbs?: { name: string; url: string }[];
}

const SEOHelmet = ({
  seo,
  productName,
  productId,
  productPrice,
  productImage,
  productAvailability,
  productBrand,
  imageAlt,
  breadcrumbs,
}: SEOHelmetProps) => {
  const resolveTemplate = (template: string): string => {
    let resolved = template;
    if (productName) resolved = resolved.replace(/{productName}/g, productName);
    if (productId) resolved = resolved.replace(/{productId}/g, productId);
    return resolved;
  };

  const title = resolveTemplate(seo.title);
  const description = resolveTemplate(seo.description);
  const canonical = resolveTemplate(seo.canonical);
  const ogImage = productImage || seo.ogImage || siteConfig.logo;
  const ogType = seo.ogType || "website";

  // Build breadcrumb structured data
  const breadcrumbSchema = breadcrumbs
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: breadcrumbs.map((crumb, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: crumb.name,
          item: `${siteConfig.url}${crumb.url}`,
        })),
      }
    : null;

  const jsonLd = breadcrumbSchema
    ? JSON.stringify(breadcrumbSchema)
    : null;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={seo.keywords} />
      <link rel="canonical" href={canonical} />
      {seo.noIndex && <meta name="robots" content="noindex, nofollow" />}
      {!seo.noIndex && <meta name="robots" content="index, follow" />}

      {/* Open Graph Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={imageAlt || title} />
      <meta property="og:site_name" content={siteConfig.name} />
      <meta property="og:locale" content="en_RW" />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={imageAlt || title} />
      <meta name="twitter:site" content="@mikaglobalbiz" />

      {/* Product-specific Meta Tags */}
      {ogType === "product" && productPrice && (
        <meta property="product:price:amount" content={productPrice} />
      )}
      {ogType === "product" && productPrice && (
        <meta property="product:price:currency" content="RWF" />
      )}
      {ogType === "product" && productAvailability && (
        <meta property="product:availability" content={productAvailability} />
      )}
      {ogType === "product" && productBrand && (
        <meta property="product:brand" content={productBrand} />
      )}

      {/* Breadcrumb JSON-LD */}
      {jsonLd && (
        <script type="application/ld+json">{jsonLd}</script>
      )}
    </Helmet>
  );
};

export default SEOHelmet;