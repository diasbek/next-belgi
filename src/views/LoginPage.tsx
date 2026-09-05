import { Suspense } from "react";
import type { Locale } from "@/i18n/config";
import { SiteLayout } from "@/components/templates/SiteLayout";
import { LoginForm } from "@/components/organisms/LoginForm";

export function LoginPage({ locale }: { locale: Locale }) {
  return (
    <SiteLayout locale={locale}>
      <Suspense fallback={null}>
        <LoginForm locale={locale} />
      </Suspense>
    </SiteLayout>
  );
}
