import { createLegalSlugPage } from "@/i18n/create-pages";
import { LEGAL_DOCS } from "@/data/legal/catalog";

export function generateStaticParams() {
  return LEGAL_DOCS.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return createLegalSlugPage("uz", slug).generateMetadata();
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { Page: LegalPage } = createLegalSlugPage("uz", slug);
  return <LegalPage />;
}
