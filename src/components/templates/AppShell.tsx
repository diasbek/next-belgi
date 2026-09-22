"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Locale } from "@/i18n/config";
import { localePath, stripLocalePrefix } from "@/i18n/paths";
import { getAppCopy } from "@/i18n/app-copy";
import { LanguageSwitcher } from "@/components/molecules/LanguageSwitcher";
import { DashMobileTabBar } from "@/components/molecules/DashMobileTabBar";
import { DashMoreSheet } from "@/components/molecules/DashMoreSheet";
import { cn } from "@/lib/cn";
import {
  isPrimaryMobilePath,
  splitMobileNav,
  type AppShellNavItem,
} from "@/components/templates/app-shell-nav";
import { IconCoins, NavIcon } from "@/components/atoms/DashIcons";

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
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const homeHref = localePath(locale, "/");
  const rootHref =
    variant === "admin"
      ? localePath(locale, "/admin/")
      : localePath(locale, "/account/");
  const title = variant === "admin" ? copy.admin : copy.account;
  const activeItem = nav.find((item) => isActive(path, item.href));
  const crumb = activeItem?.label || title;
  const avatarLetter = (email || title).trim().charAt(0).toUpperCase() || "U";
  const profileLabel =
    variant === "admin"
      ? email?.split("@")[0] || "admin"
      : email?.split("@")[0] || copy.account;

  const { primary, more } = useMemo(
    () => splitMobileNav(variant, nav),
    [variant, nav],
  );
  const moreActive = !isPrimaryMobilePath(variant, path);

  useEffect(() => {
    setMenuOpen(false);
    setMoreOpen(false);
  }, [pathname]);

  // Dashboard owns safe-area via tab bar — avoid double body padding on mobile
  useEffect(() => {
    const prev = document.body.style.paddingBottom;
    document.body.style.paddingBottom = "0px";
    return () => {
      document.body.style.paddingBottom = prev;
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    function onDoc(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);

  async function logout() {
    await fetch("/api/auth/logout/", { method: "POST" });
    router.push(localePath(locale, "/login/"));
    router.refresh();
  }

  function renderNavLinks(onNavigate?: () => void) {
    return nav.map((item) => {
      const href = localePath(locale, item.href);
      const active = isActive(path, item.href);
      return (
        <Link
          key={item.href}
          href={href}
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
            active
              ? "bg-lime text-ink"
              : "text-ink-muted hover:bg-black/[0.04] hover:text-ink",
          )}
        >
          <NavIcon href={item.href} />
          <span className="truncate">{item.label}</span>
        </Link>
      );
    });
  }

  return (
    <div className="flex min-h-dvh bg-[#f3f4f1] text-ink">
      <aside className="sticky top-0 hidden h-dvh w-[15.5rem] shrink-0 flex-col border-r border-black/5 bg-white lg:flex">
        <div className="flex flex-1 flex-col overflow-y-auto p-3">
          <Link
            href={homeHref}
            className="mb-5 px-3 font-display text-lg font-semibold tracking-tight text-ink"
          >
            {copy.brand}
          </Link>
          <p className="mb-2 px-3 text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-ink-muted/80">
            {copy.workspace}
          </p>
          <nav className="flex flex-col gap-1">{renderNavLinks()}</nav>
        </div>
        <p className="border-t border-black/5 px-4 py-3 text-xs text-ink-muted">
          © {copy.brand}
        </p>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b border-black/5 bg-white/90 backdrop-blur-md">
          <div className="flex min-h-14 items-center justify-between gap-3 px-4 sm:px-6">
            <Link
              href={homeHref}
              className="font-display text-base font-semibold tracking-tight text-ink lg:hidden"
            >
              {copy.brand}
            </Link>

            <nav
              className="hidden min-w-0 items-center gap-1.5 text-sm text-ink-muted lg:flex"
              aria-label="Breadcrumb"
            >
              <Link href={rootHref} className="truncate hover:text-ink">
                {title}
              </Link>
              <span aria-hidden>/</span>
              <span className="truncate font-medium text-ink">{crumb}</span>
            </nav>

            <div className="flex items-center gap-2 sm:gap-3">
              {variant === "account" ? (
                <div className="flex items-center gap-1.5 rounded-full bg-[#f3f4f1] py-1 pr-2.5 pl-2 text-xs sm:gap-2 sm:py-1 sm:pr-3 sm:pl-2.5 sm:text-sm">
                  <span className="text-ink" aria-hidden>
                    <IconCoins />
                  </span>
                  <span className="font-medium text-ink">
                    {balance} {copy.credits}
                  </span>
                  <Link
                    href={localePath(locale, "/account/billing/")}
                    className="hidden font-medium text-ink-muted underline-offset-2 hover:text-ink hover:underline sm:inline"
                  >
                    {copy.overview.topUp}
                  </Link>
                </div>
              ) : null}
              <div className="hidden lg:block">
                <LanguageSwitcher
                  locale={locale}
                  className="!min-h-9 !rounded-full !border-black/10 !bg-white !px-2.5 !text-sm sm:!px-3"
                />
              </div>
              <div className="relative hidden lg:block" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white p-0.5 text-sm font-medium sm:py-1 sm:pr-3 sm:pl-1"
                  aria-label={profileLabel}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-lime text-xs font-semibold">
                    {avatarLetter}
                  </span>
                  <span className="hidden max-w-[7rem] truncate sm:inline">
                    {profileLabel}
                  </span>
                  <span
                    className="mr-1.5 hidden text-ink-muted sm:inline"
                    aria-hidden
                  >
                    ▾
                  </span>
                </button>
                {menuOpen ? (
                  <div className="absolute right-0 mt-2 w-44 overflow-hidden rounded-xl border border-black/10 bg-white py-1 shadow-md">
                    {email ? (
                      <p className="truncate px-3 py-2 text-xs text-ink-muted">
                        {email}
                      </p>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => void logout()}
                      className="block w-full px-3 py-2 text-left text-sm hover:bg-black/[0.04]"
                    >
                      {copy.logout}
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </header>

        <main
          className={cn(
            "min-w-0 flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-8",
            "pb-[calc(var(--dash-tabbar-height)+var(--safe-bottom)+1.25rem)] lg:pb-6",
          )}
        >
          {children}
        </main>
      </div>

      <DashMobileTabBar
        locale={locale}
        path={path}
        primary={primary}
        moreLabel={copy.nav.more}
        moreActive={moreActive || moreOpen}
        onMoreClick={() => setMoreOpen(true)}
      />
      <DashMoreSheet
        open={moreOpen}
        onOpenChange={setMoreOpen}
        locale={locale}
        path={path}
        moreNav={more}
        title={copy.nav.more}
        accountMenuLabel={copy.nav.accountMenu}
        logoutLabel={copy.logout}
        email={email}
        avatarLetter={avatarLetter}
        profileLabel={profileLabel}
        onLogout={() => void logout()}
      />
    </div>
  );
}
