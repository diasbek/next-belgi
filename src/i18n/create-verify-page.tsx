import { PageContainer } from "@/components/atoms/PageContainer";
import { VerifyReportView } from "@/views/VerifyReportView";
import type { Locale } from "@/i18n/config";
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
    return (
      <section className="bg-white py-12 md:py-16">
        <PageContainer measure="focus">
          <VerifyReportView locale={locale} code={code} />
        </PageContainer>
      </section>
    );
  }

  return { generateMetadata, Page };
}
