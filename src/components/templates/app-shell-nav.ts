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

const ACCOUNT_PRIMARY = new Set([
  "/account/",
  "/account/check/",
  "/account/history/",
  "/account/billing/",
]);

const ADMIN_PRIMARY = new Set([
  "/admin/",
  "/admin/users/",
  "/admin/payments/",
  "/admin/checks/",
]);

export function splitMobileNav(
  variant: "account" | "admin",
  nav: AppShellNavItem[],
): { primary: AppShellNavItem[]; more: AppShellNavItem[] } {
  const primaryHrefs = variant === "account" ? ACCOUNT_PRIMARY : ADMIN_PRIMARY;
  const primary: AppShellNavItem[] = [];
  const more: AppShellNavItem[] = [];
  for (const item of nav) {
    if (primaryHrefs.has(item.href)) primary.push(item);
    else more.push(item);
  }
  // Keep primary order as defined in primaryHrefs insertion order via nav order
  return { primary, more };
}

export function isPrimaryMobilePath(
  variant: "account" | "admin",
  path: string,
): boolean {
  const c = path.endsWith("/") ? path : `${path}/`;
  const set = variant === "account" ? ACCOUNT_PRIMARY : ADMIN_PRIMARY;
  for (const href of set) {
    if (href === "/account/" || href === "/admin/") {
      if (c === href) return true;
      continue;
    }
    if (c === href || c.startsWith(href)) return true;
  }
  return false;
}
