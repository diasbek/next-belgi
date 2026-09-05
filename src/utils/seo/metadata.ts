import type { Metadata } from "next";
import { SITE_CONFIG } from "@/utils/consts";
import {
  getCanonicalSiteUrl,
  isIndexableDeployment,
  robotsForDeployment,
} from "@/utils/seo/indexing";

export function canonicalPageUrl(path: string): string {
  const base = getCanonicalSiteUrl().replace(/\/$/, "");
  if (!path || path === "/") return `${base}/`;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized.endsWith("/") ? normalized : `${normalized}/`}`;
}

export function createPageMetadata(
  title: string,
  description: string,
  path: string,
  options?: {
    image?: string;
    locale?: string;
    ogLocale?: string;
    robots?: Metadata["robots"];
    alternates?: Record<string, string>;
    noIndex?: boolean;
  },
): Metadata {
  const url = canonicalPageUrl(path);
  const robots =
    options?.robots ??
    (options?.noIndex
      ? { index: false, follow: false }
      : robotsForDeployment());

  return {
    title,
    description,
    metadataBase: new URL(getCanonicalSiteUrl()),
    alternates: {
      canonical: url,
      languages: options?.alternates,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_CONFIG.name,
      locale: options?.ogLocale ?? "uz_UZ",
      type: "website",
      images: [
        {
          url: options?.image ?? "/images/og/default.svg",
          width: 1200,
          height: 630,
          alt: SITE_CONFIG.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [options?.image ?? "/images/og/default.svg"],
    },
    robots,
  };
}

export const rootMetadata: Metadata = {
  metadataBase: new URL(getCanonicalSiteUrl()),
  title: {
    default: SITE_CONFIG.title,
    template: `%s — ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  applicationName: SITE_CONFIG.name,
  robots: robotsForDeployment(),
  openGraph: {
    type: "website",
    siteName: SITE_CONFIG.name,
    locale: "uz_UZ",
    images: [
      {
        url: "/images/og/default.svg",
        width: 1200,
        height: 630,
        alt: SITE_CONFIG.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    images: ["/images/og/default.svg"],
  },
  other: {
    "theme-color": SITE_CONFIG.themeColor,
  },
};

export function isProdIndexable() {
  return isIndexableDeployment();
}
