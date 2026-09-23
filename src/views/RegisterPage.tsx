import { Suspense } from "react";
import type { Locale } from "@/i18n/config";
import { SiteLayout } from "@/components/templates/SiteLayout";
import { RegisterForm } from "@/components/organisms/RegisterForm";
import { PageSkeleton } from "@/components/atoms/PageSkeleton";

export function RegisterPage({ locale }: { locale: Locale }) {
  return (
    <SiteLayout locale={locale}>
      <Suspense fallback={<PageSkeleton />}>
        <RegisterForm locale={locale} />
      </Suspense>
    </SiteLayout>
  );
}
