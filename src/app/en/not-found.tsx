import { SiteLayout } from "@/components/templates/SiteLayout";
import { NotFoundView } from "@/views/ContentPageViews";

export default function NotFound() {
  return (
    <SiteLayout locale="en">
      <NotFoundView locale="en" />
    </SiteLayout>
  );
}
