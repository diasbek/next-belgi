import { createServiceDetailPage } from "@/i18n/create-pages";
import { SERVICE_SLUGS } from "@/data/services-catalog";

const { generateMetadata, Page } = createServiceDetailPage("en");
export { generateMetadata };
export default Page;

export function generateStaticParams() {
  return SERVICE_SLUGS.map((slug) => ({ slug }));
}
