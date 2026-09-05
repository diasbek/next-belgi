"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import type { Locale } from "@/i18n/config";
import { localePath, stripLocalePrefix } from "@/i18n/paths";
import { getAppCopy } from "@/i18n/app-copy";
import { LanguageSwitcher } from "@/components/molecules/LanguageSwitcher";
import { Button } from "@/components/atoms/Button";
import { cn } from "@/lib/cn";
import { pageContainer } from "@/styles/ui";
import type { AppShellNavItem } from "@/components/templates/app-shell-nav";

export type { AppShellNavItem };

interface AppShellProps {
  locale: Locale;
  variant: "account" | "admin";
  nav: AppShellNavItem[];
  balance?: number;
  email?: string | null;
  children: React.ReactNode;
}

function isActive(currentPath: string, href: string) {
  const c = currentPath.endsWith("/") ? currentPath : `${currentPath}/`;
  const h = href.endsWith("/") ? href : `${href}/`;
  if (h === "/account/" || h === "/admin/") return c === h;
  return c === h || c.startsWith(h);
}

export function AppShell({
  locale,
  variant,
  nav,
  balance = 0,
  email,
  children,
}: AppShellProps) {
  const copy = getAppCopy(locale);
  const pathname = usePathname() || "/";
  const { path } = stripLocalePrefix(pathname);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const homeHref = localePath(locale, "/");
  const title = variant === "admin" ? copy.admin : copy.account;

  async function logout() {
    await fetch("/api/auth/logout/", { method: "POST" });
    router.push(localePath(locale, "/login/"));
    router.refresh();
  }

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <header className="sticky top-0 z-40 border-b border-black/5 bg-lime/90 backdrop-blur-md">
        <div
          className={cn(
            pageContainer,
            "flex min-h-14 items-center justify-between gap-3",
          )}
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/70 lg:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label="Menu"
            >
              {open ? "×" : "☰"}
            </button>
            <Link
              href={homeHref}
              className="font-display text-lg font-semibold text-ink"
            >
              {copy.brand}
            </Link>
            <span className="hidden text-sm text-ink-muted sm:inline">
              / {title}
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {variant === "account" ? (
              <span className="rounded-full bg-white/80 px-3 py-1 text-sm font-medium text-ink">
                {balance} {copy.credits}
              </span>
            ) : null}
            <LanguageSwitcher locale={locale} />
            <Button href={homeHref} variant="ghost" className="hidden sm:inline-flex">
              {copy.backToSite}
            </Button>
            <button
              type="button"
              onClick={() => void logout()}
              className="text-sm font-medium text-ink/80 hover:text-ink"
            >
              {copy.logout}
            </button>
          </div>
        </div>
      </header>

      <div className={cn(pageContainer, "flex flex-1 gap-0 py-6 lg:gap-8")}>
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-30 w-64 translate-x-[-100%] border-r border-black/5 bg-surface-muted pt-[4.5rem] transition-transform lg:static lg:translate-x-0 lg:w-56 lg:shrink-0 lg:border-0 lg:bg-transparent lg:pt-0",
            open && "translate-x-0 shadow-md",
          )}
        >
          <nav className="flex flex-col gap-1 p-4 lg:p-0">
            {email ? (
              <p className="mb-3 truncate px-3 text-xs text-ink-muted">{email}</p>
            ) : null}
            {nav.map((item) => {
              const href = localePath(locale, item.href);
              const active = isActive(path, item.href);
              return (
                <Link
                  key={item.href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-lime text-ink"
                      : "text-ink-muted hover:bg-black/5 hover:text-ink",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {open ? (
          <button
            type="button"
            className="fixed inset-0 z-20 bg-ink/20 lg:hidden"
            aria-label="Close"
            onClick={() => setOpen(false)}
          />
        ) : null}

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
