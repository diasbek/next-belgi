import type { MetadataRoute } from "next";
import { pagePaths, type PageKey } from "@/i18n/config";
import { localePath } from "@/i18n/paths";
import { getCanonicalSiteUrl, isIndexableDeployment } from "@/utils/seo/indexing";

const indexablePages: PageKey[] = [
  "home",
  "agency",
  "works",
  "services",
  "contacts",
  "privacy",
  "terms",
];

export default function sitemap(): MetadataRoute.Sitemap {
  if (!isIndexableDeployment()) return [];

  const base = getCanonicalSiteUrl();
  const entries: MetadataRoute.Sitemap = [];

  for (const key of indexablePages) {
    const path = pagePaths[key];
    for (const locale of ["uz", "ru"] as const) {
      entries.push({
        url: `${base}${localePath(locale, path)}`,
        changeFrequency: key === "home" ? "weekly" : "monthly",
        priority: key === "home" ? 1 : 0.7,
      });
    }
  }

  return entries;
}
