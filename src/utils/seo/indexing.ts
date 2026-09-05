import type { Metadata } from "next";

/** Public origin used for canonical, Open Graph, sitemap, robots, JSON-LD. */
export const CANONICAL_SITE_URL = "https://belgi.ai";

export const PRODUCTION_HOSTS = new Set(["belgi.ai", "www.belgi.ai"]);

const STAGING_HOSTS = new Set(["localhost", "127.0.0.1"]);

export function getCanonicalSiteUrl(): string {
  return CANONICAL_SITE_URL;
}

export function isStagingHost(host: string | null | undefined): boolean {
  const hostname = (host ?? "").split(":")[0].toLowerCase();
  if (!hostname) return false;
  return STAGING_HOSTS.has(hostname) || hostname.endsWith(".vercel.app");
}

export function isIndexableDeployment(): boolean {
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production") {
    return false;
  }
  if (process.env.NODE_ENV === "development") return false;
  return true;
}

export function robotsForDeployment(): Metadata["robots"] {
  if (!isIndexableDeployment()) {
    return { index: false, follow: false, nocache: true };
  }
  return { index: true, follow: true };
}
