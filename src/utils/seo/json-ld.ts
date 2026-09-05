import { SITE_CONFIG } from "@/utils/consts";
import { getCanonicalSiteUrl } from "@/utils/seo/indexing";

export function getOrganizationSchema() {
  const siteUrl = getCanonicalSiteUrl().replace(/\/$/, "");
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_CONFIG.name,
    legalName: SITE_CONFIG.legalName,
    url: `${siteUrl}/`,
    logo: `${siteUrl}/favicon.svg`,
    image: `${siteUrl}/images/og/default.svg`,
    telephone: SITE_CONFIG.phoneDisplay,
    ...(SITE_CONFIG.email ? { email: SITE_CONFIG.email } : {}),
    sameAs: [SITE_CONFIG.telegramUrl, SITE_CONFIG.instagramUrl].filter(
      Boolean,
    ),
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE_CONFIG.address.line,
      addressLocality: "Tashkent",
      addressCountry: "UZ",
    },
  };
}

export function getGlobalJsonLdGraph() {
  return getOrganizationSchema();
}
