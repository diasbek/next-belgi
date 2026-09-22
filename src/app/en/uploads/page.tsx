import { createLegalAliasPage } from "@/i18n/create-pages";

const { generateMetadata, Page } = createLegalAliasPage("en", "/uploads/");
export { generateMetadata };
export default Page;
