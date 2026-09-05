import { Suspense } from "react";
import type { Locale } from "@/i18n/config";
import { SiteLayout } from "@/components/templates/SiteLayout";
import { RegisterForm } from "@/components/organisms/RegisterForm";

export function RegisterPage({ locale }: { locale: Locale }) {
  return (
    <SiteLayout locale={locale}>
      <Suspense fallback={null}>
        <RegisterForm locale={locale} />
      </Suspense>
    </SiteLayout>
  );
}
