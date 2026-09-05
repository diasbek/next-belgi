"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Locale } from "@/i18n/config";
import { localePath, stripLocalePrefix } from "@/i18n/paths";
import { getAppCopy } from "@/i18n/app-copy";
import { LanguageSwitcher } from "@/components/molecules/LanguageSwitcher";
import { cn } from "@/lib/cn";
import type { AppShellNavItem } from "@/components/templates/app-shell-nav";
import { IconHome, NavIcon } from "@/components/atoms/DashIcons";

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
  const drawerId = useId();
  const [drawerMounted, setDrawerMounted] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [portalReady, setPortalReady] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
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

  function openDrawer() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setDrawerMounted(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setDrawerOpen(true));
    });
  }

  function closeDrawer() {
    setDrawerOpen(false);
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => {
      setDrawerMounted(false);
      closeTimer.current = null;
    }, 180);
  }

  function toggleDrawer() {
    if (drawerOpen) closeDrawer();
    else openDrawer();
  }

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    setDrawerOpen(false);
    setDrawerMounted(false);
    setMenuOpen(false);
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, [pathname]);

  useEffect(() => {
    if (!drawerMounted) return;
    const prev = document.body.style.overflow;
    if (drawerOpen) document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeDrawer();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [drawerMounted, drawerOpen]);

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
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

  const mobileDrawer =
    portalReady && drawerMounted
      ? createPortal(
          <div className="lg:hidden" role="presentation">
            <button
              type="button"
              aria-label="Close"
              className={cn(
                "fixed inset-0 z-[80] bg-ink/30 transition-opacity duration-150 ease-out",
                drawerOpen ? "opacity-100" : "opacity-0",
              )}
              onClick={closeDrawer}
            />
            <aside
              id={drawerId}
              role="dialog"
              aria-modal="true"
              aria-label={title}
              className={cn(
                "fixed inset-y-0 right-0 z-[90] flex w-[min(18rem,88vw)] flex-col bg-white shadow-[-8px_0_24px_rgb(26_28_24/0.12)] transition-transform duration-150 ease-out will-change-transform",
                drawerOpen ? "translate-x-0" : "translate-x-full",
              )}
            >
              <div className="flex items-center justify-between border-b border-black/5 px-4 py-3">
                <Link
                  href={homeHref}
                  className="font-display text-lg font-semibold tracking-tight text-ink"
                  onClick={closeDrawer}
                >
                  {copy.brand}
                </Link>
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink hover:bg-black/[0.04]"
                  onClick={closeDrawer}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto overscroll-contain p-3">
                <div className="flex flex-col gap-1">
                  {renderNavLinks(closeDrawer)}
                </div>
              </nav>
              <div className="border-t border-black/5 p-3">
                <Link
                  href={homeHref}
                  onClick={closeDrawer}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-ink-muted hover:bg-black/[0.04] hover:text-ink"
                >
                  {copy.backToSite}
                  <span aria-hidden>↗</span>
                </Link>
              </div>
            </aside>
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="flex min-h-dvh bg-[#f3f4f1] text-ink">
      <aside className="sticky top-0 hidden h-dvh w-[15.5rem] shrink-0 overflow-y-auto border-r border-black/5 bg-white lg:block">
        <nav className="flex flex-col gap-1 p-3">
          <Link
            href={homeHref}
            className="mb-4 px-3 font-display text-lg font-semibold tracking-tight text-ink"
          >
            {copy.brand}
          </Link>
          {renderNavLinks()}
        </nav>
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
              <Link
                href={rootHref}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-black/[0.04] hover:text-ink"
                aria-label={title}
              >
                <IconHome />
              </Link>
              <span aria-hidden>›</span>
              <span className="truncate font-medium text-ink">{crumb}</span>
            </nav>

            <div className="flex items-center gap-2 sm:gap-3">
              {variant === "account" ? (
                <span className="hidden rounded-full bg-[#f3f4f1] px-3 py-1.5 text-sm font-medium sm:inline">
                  {balance} {copy.credits}
                </span>
              ) : null}
              <LanguageSwitcher
                locale={locale}
                className="!min-h-9 !rounded-full !border-black/10 !bg-white !px-2.5 !text-sm sm:!px-3"
              />
              <Link
                href={homeHref}
                className="hidden items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink sm:inline-flex"
              >
                {copy.backToSite}
                <span aria-hidden className="text-xs">
                  ↗
                </span>
              </Link>
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white p-0.5 text-sm font-medium sm:py-1 sm:pl-1 sm:pr-3"
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
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink lg:hidden"
                onClick={toggleDrawer}
                aria-expanded={drawerOpen}
                aria-controls={drawerId}
                aria-label="Menu"
              >
                {drawerOpen ? "×" : "☰"}
              </button>
            </div>
          </div>
        </header>

        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
          {children}
        </main>
      </div>

      {mobileDrawer}
    </div>
  );
}
