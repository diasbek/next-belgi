import Link from "next/link";
import { PageContainer } from "@/components/atoms/PageContainer";
import { VerifyReportView } from "@/views/VerifyReportView";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/paths";
import { getAppCopy } from "@/i18n/app-copy";
import { getConclusionCopy } from "@/lib/conclusion/copy";
import type { Metadata } from "next";

export function createVerifyPage(locale: Locale) {
  async function generateMetadata({
    params,
  }: {
    params: Promise<{ code: string }>;
  }): Promise<Metadata> {
    const { code } = await params;
    return {
      title: `Belgi.ai — ${code}`,
      robots: { index: false, follow: false },
    };
  }

  async function Page({ params }: { params: Promise<{ code: string }> }) {
    const { code } = await params;
    const app = getAppCopy(locale);
    const conclusion = getConclusionCopy(locale);
    return (
      <div className="flex min-h-dvh flex-col bg-white text-ink">
        <header className="border-b border-border px-4 py-4 sm:px-6">
          <PageContainer>
            <div className="flex items-center justify-between gap-4">
              <Link
                href={localePath(locale, "/")}
                className="font-display text-lg font-semibold tracking-tight text-ink no-underline"
              >
                {app.brand}
              </Link>
              <Link
                href={localePath(locale, "/")}
                className="text-sm font-medium text-ink-muted underline-offset-2 hover:underline"
              >
                {app.backToSite}
              </Link>
            </div>
          </PageContainer>
        </header>
        <main id="main-content" className="flex-1 py-12 md:py-16">
          <PageContainer measure="focus">
            <VerifyReportView locale={locale} code={code} />
          </PageContainer>
        </main>
        <footer className="border-t border-border px-4 py-6 sm:px-6">
          <PageContainer>
            <p className="m-0 text-center text-xs leading-relaxed text-ink-muted">
              {conclusion.disclaimer}
            </p>
          </PageContainer>
        </footer>
      </div>
    );
  }

  return { generateMetadata, Page };
}
