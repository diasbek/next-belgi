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
      disallow: [
        "/api/",
        "/deck/",
        "/check/",
        "/ru/check/",
        "/en/check/",
        "/login/",
        "/ru/login/",
        "/en/login/",
        "/register/",
        "/ru/register/",
        "/en/register/",
      ],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
