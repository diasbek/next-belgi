import type { AppCopy } from "@/i18n/app-copy";

export type AppShellNavItem = {
  href: string;
  label: string;
};

export function accountNav(copy: AppCopy): AppShellNavItem[] {
  return [
    { href: "/account/", label: copy.nav.overview },
    { href: "/account/check/", label: copy.nav.newCheck },
    { href: "/account/history/", label: copy.nav.history },
    { href: "/account/billing/", label: copy.nav.billing },
    { href: "/account/profile/", label: copy.nav.profile },
  ];
}

export function adminNav(copy: AppCopy): AppShellNavItem[] {
  return [
    { href: "/admin/", label: copy.nav.dashboard },
    { href: "/admin/users/", label: copy.nav.users },
    { href: "/admin/payments/", label: copy.nav.payments },
    { href: "/admin/plans/", label: copy.nav.plans },
    { href: "/admin/checks/", label: copy.nav.checks },
    { href: "/admin/leads/", label: copy.nav.leads },
    { href: "/admin/registry/", label: copy.nav.registry },
    { href: "/admin/attorneys/", label: copy.nav.attorneys },
    { href: "/admin/ledger/", label: copy.nav.ledger },
    { href: "/admin/notifications/", label: copy.nav.notifications },
    { href: "/admin/sessions/", label: copy.nav.sessions },
    { href: "/admin/integrations/", label: copy.nav.integrations },
    { href: "/admin/settings/", label: copy.nav.settings },
  ];
}
