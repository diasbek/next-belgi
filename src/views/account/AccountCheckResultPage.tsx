import type { Locale } from "@/i18n/config";
import { requireUser } from "@/lib/auth/session";
import { AppShell } from "@/components/templates/AppShell";
import { accountNav } from "@/components/templates/app-shell-nav";
import { CheckResultPageView } from "@/views/CheckResultPageView";
import { getAppCopy } from "@/i18n/app-copy";
import { localePath } from "@/i18n/paths";
import { loginWithNext } from "@/lib/navigation/safe-next";

export async function AccountCheckResultPage({
  locale,
  query = "",
  activity = "",
  checkId = "",
}: {
  locale: Locale;
  query?: string;
  activity?: string;
  checkId?: string;
}) {
  const appUser = await requireUser(
    loginWithNext(
      locale,
      checkId
        ? `${localePath(locale, "/account/check/result/")}?checkId=${encodeURIComponent(checkId)}`
        : localePath(locale, "/account/check/"),
    ),
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
      <CheckResultPageView
        locale={locale}
        query={query}
        activity={activity}
        checkId={checkId}
        embedded
        actionPath="/account/check/"
      />
    </AppShell>
  );
}
