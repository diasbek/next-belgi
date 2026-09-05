import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/paths";
import type { SiteCopy } from "@/data/types";
import { PageContainer } from "@/components/atoms/PageContainer";
import { SITE_CONFIG } from "@/utils/consts";

export function SiteFooter({
  locale,
  content,
}: {
  locale: Locale;
  content: SiteCopy;
}) {
  return (
    <footer className="border-t border-white/10 bg-primary text-white">
      <PageContainer className="grid gap-8 py-10 sm:py-12 md:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="m-0 font-display text-2xl font-semibold">Belgi.ai</p>
          <p className="mt-3 max-w-[var(--content-copy)] text-sm leading-relaxed text-white/75">
            {content.footer.blurb}
          </p>
          {SITE_CONFIG.phoneDisplay ? (
            <p className="mt-4 text-sm text-white/80">{SITE_CONFIG.phoneDisplay}</p>
          ) : null}
        </div>
        <div className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-2">
          {content.nav.map((item) => (
            <Link
              key={item.href}
              href={localePath(locale, item.href)}
              className="min-h-[var(--tap-min)] py-2 text-sm text-white/85 hover:text-white sm:min-h-0 sm:py-1"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href={localePath(locale, "/privacy/")}
            className="min-h-[var(--tap-min)] py-2 text-sm text-white/85 hover:text-white sm:min-h-0 sm:py-1"
          >
            {content.footer.privacy}
          </Link>
          <Link
            href={localePath(locale, "/terms/")}
            className="min-h-[var(--tap-min)] py-2 text-sm text-white/85 hover:text-white sm:min-h-0 sm:py-1"
          >
            {content.footer.terms}
          </Link>
        </div>
      </PageContainer>
      <PageContainer className="border-t border-white/10 py-4 text-xs text-white/55">
        © {new Date().getFullYear()} Belgi.ai
      </PageContainer>
    </footer>
  );
}
