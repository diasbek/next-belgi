import type { Locale } from "@/i18n/config";
import { requireUser } from "@/lib/auth/session";
import { AppShell } from "@/components/templates/AppShell";
import { accountNav } from "@/components/templates/app-shell-nav";
import { ProfileForm } from "@/components/organisms/ProfileForm";
import { getAppCopy } from "@/i18n/app-copy";
import { localePath } from "@/i18n/paths";
import { loginWithNext } from "@/lib/navigation/safe-next";

export async function AccountProfilePage({ locale }: { locale: Locale }) {
  const appUser = await requireUser(
    loginWithNext(locale, localePath(locale, "/account/profile/")),
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
      <ProfileForm
        locale={locale}
        email={appUser.email || ""}
        phone={appUser.phone || appUser.profile.phone || ""}
        hasPassword={appUser.profile.has_password}
        googleLinked={appUser.providers.google}
        initial={{
          full_name: appUser.profile.full_name,
          phone: appUser.profile.phone,
        }}
      />
    </AppShell>
  );
}
