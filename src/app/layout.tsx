import type { Metadata, Viewport } from "next";
import { manrope } from "@/assets/fonts";
import "./globals.css";
import { SiteAnalytics } from "@/components/analytics/SiteAnalytics";
import { JsonLd } from "@/components/seo/JsonLd";
import { AppToaster } from "@/components/providers/AppToaster";
import { rootMetadata } from "@/utils/seo/metadata";
import { getGlobalJsonLdGraph } from "@/utils/seo/json-ld";
import { SITE_CONFIG } from "@/utils/consts";

export const viewport: Viewport = {
  themeColor: SITE_CONFIG.themeColor,
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  ...rootMetadata,
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
  other: {
    ...(typeof rootMetadata.other === "object" && rootMetadata.other
      ? rootMetadata.other
      : {}),
    "theme-color": SITE_CONFIG.themeColor,
    ...(SITE_CONFIG.seo.googleSiteVerification
      ? {
          "google-site-verification":
            SITE_CONFIG.seo.googleSiteVerification,
        }
      : {}),
    ...(SITE_CONFIG.seo.yandexSiteVerification
      ? { "yandex-verification": SITE_CONFIG.seo.yandexSiteVerification }
      : {}),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="uz"
      className={`${manrope.variable} scroll-smooth scroll-pt-[var(--header-height)]`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              '(function(){try{var p=location.pathname;document.documentElement.lang=(p==="/ru"||p.indexOf("/ru/")===0)?"ru":"uz"}catch(e){}})();',
          }}
        />
      </head>
      <body className="flex min-h-dvh flex-col bg-white font-sans text-ink antialiased">
        <JsonLd data={getGlobalJsonLdGraph()} />
        {children}
        <SiteAnalytics />
        <AppToaster />
      </body>
    </html>
  );
}
