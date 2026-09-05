import type { MetadataRoute } from "next";
import { getCanonicalSiteUrl, isIndexableDeployment } from "@/utils/seo/indexing";

export default function robots(): MetadataRoute.Robots {
  const base = getCanonicalSiteUrl();
  if (!isIndexableDeployment()) {
    return {
      rules: { userAgent: "*", disallow: "/" },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/check/", "/ru/check/", "/login/", "/ru/login/"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
