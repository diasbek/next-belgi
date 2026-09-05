import type { Locale } from "@/i18n/config";
import { requireUser } from "@/lib/auth/session";
import { AppShell } from "@/components/templates/AppShell";
import { accountNav } from "@/components/templates/app-shell-nav";
import { CheckPageView } from "@/views/CheckPageView";
import { getAppCopy } from "@/i18n/app-copy";
import { localePath } from "@/i18n/paths";
import { loginWithNext } from "@/lib/navigation/safe-next";

export async function AccountCheckPage({
  locale,
  query = "",
  activity = "",
}: {
  locale: Locale;
  query?: string;
  activity?: string;
}) {
  const appUser = await requireUser(
    loginWithNext(locale, localePath(locale, "/account/check/")),
  );
  const copy = getAppCopy(locale);

  return (
    <AppShell
      locale={locale}
      variant="account"
      nav={accountNav(copy)}
      balance={appUser.balance}
      email={appUser.email}
    >
      <CheckPageView
        locale={locale}
        query={query}
        activity={activity}
        embedded
        actionPath="/account/check/"
      />
    </AppShell>
  );
}
