import type { Locale } from "@/i18n/config";
import { getContent } from "@/i18n/get-content";
import { localePath } from "@/i18n/paths";
import { Header } from "@/components/organisms/Header";
import { SiteFooter } from "@/components/organisms/SiteFooter";
import { HashScroll } from "@/components/organisms/HashScroll";
import { CookieConsentBanner } from "@/components/consent/CookieConsentBanner";

interface SiteLayoutProps {
  locale: Locale;
  children: React.ReactNode;
}

export function SiteLayout({ locale, children }: SiteLayoutProps) {
  const content = getContent(locale);

  return (
    <>
      <a href="#main-content" className="skip-link">
        {locale === "ru"
          ? "К основному содержимому"
          : locale === "en"
            ? "Skip to main content"
            : "Asosiy kontentga oʻtish"}
      </a>
      <HashScroll />
      <Header locale={locale} content={content} />
      <div id="site-content" className="flex-1">
        <main id="main-content">{children}</main>
      </div>
      <SiteFooter locale={locale} content={content} />
      <CookieConsentBanner
        text={content.ui.cookieText}
        acceptLabel={content.ui.cookieAccept}
        declineLabel={content.ui.cookieDecline}
        policyHref={localePath(locale, "/cookies/")}
        policyLabel={
          locale === "ru"
            ? "Политика cookie"
            : locale === "en"
              ? "Cookie policy"
              : "Cookie siyosati"
        }
      />
    </>
  );
}
