"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Locale } from "@/i18n/config";
import { localePath, stripLocalePrefix } from "@/i18n/paths";
import type { SiteCopy } from "@/data/types";
import { getAppCopy } from "@/i18n/app-copy";
import { LanguageSwitcher } from "@/components/molecules/LanguageSwitcher";
import { Button } from "@/components/atoms/Button";
import { cn } from "@/lib/cn";
import { pageContainer } from "@/styles/ui";

interface HeaderProps {
  locale: Locale;
  content: SiteCopy;
}

function normalizeNavPath(path: string) {
  if (!path || path === "/") return "/";
  const withLeading = path.startsWith("/") ? path : `/${path}`;
  return withLeading.endsWith("/") ? withLeading : `${withLeading}/`;
}

function isActivePath(currentPath: string, href: string) {
  const current = normalizeNavPath(currentPath);
  const target = normalizeNavPath(href);
  if (target === "/") return current === "/";
  return current === target || current.startsWith(target);
}

type AuthState =
  | { status: "loading" }
  | { status: "guest" }
  | { status: "user"; isAdmin: boolean };

export function Header({ locale, content }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const [auth, setAuth] = useState<AuthState>({ status: "loading" });
  const pathname = usePathname() || "/";
  const { path: currentPath } = stripLocalePrefix(pathname);
  const appCopy = getAppCopy(locale);
  const loginHref = localePath(locale, "/login/");
  const accountHref = localePath(locale, "/account/");
  const adminHref = localePath(locale, "/admin/");
  const homeHref = localePath(locale, "/");

  const loggedIn = auth.status === "user";
  const isAdmin = auth.status === "user" && auth.isAdmin;
  const ctaHref = loggedIn ? accountHref : loginHref;
  const ctaLabel = loggedIn ? appCopy.account : content.ui.login;

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    let cancelled = false;
    setAuth({ status: "loading" });
    (async () => {
      try {
        const res = await fetch("/api/auth/me/", { credentials: "include" });
        if (cancelled) return;
        if (!res.ok) {
          setAuth({ status: "guest" });
          return;
        }
        const json = (await res.json()) as {
          ok?: boolean;
          user?: { role?: string };
        };
        if (!json.ok || !json.user) {
          setAuth({ status: "guest" });
          return;
        }
        setAuth({
          status: "user",
          isAdmin: json.user.role === "admin",
        });
      } catch {
        if (!cancelled) setAuth({ status: "guest" });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const ctaButton = (
    <Button
      href={ctaHref}
      className="px-5"
      aria-busy={auth.status === "loading"}
    >
      {auth.status === "loading" ? "…" : ctaLabel}
    </Button>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-lime/90 backdrop-blur-md">
      <div
        className={cn(
          pageContainer,
          "flex min-h-[var(--header-height)] items-center justify-between gap-3 sm:gap-4",
        )}
      >
        <Link
          href={homeHref}
          className="font-display text-xl font-semibold tracking-tight text-ink md:text-2xl"
        >
          Belgi.ai
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Main">
          {content.nav.map((item) => {
            const href = localePath(locale, item.href);
            const active = isActivePath(currentPath, item.href);
            return (
              <Link
                key={item.href}
                href={href}
                className={cn(
                  "text-sm font-medium transition-opacity hover:opacity-70",
                  active ? "text-ink" : "text-ink/80",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <LanguageSwitcher locale={locale} />
          {isAdmin ? (
            <Button href={adminHref} variant="ghost" className="px-4">
              {appCopy.admin}
            </Button>
          ) : null}
          {ctaButton}
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white/70 lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">
            {open ? content.ui.close : content.ui.menu}
          </span>
          <span aria-hidden className="text-lg leading-none">
            {open ? "×" : "☰"}
          </span>
        </button>
      </div>

      {open ? (
        <div
          id="mobile-nav"
          className="border-t border-black/5 bg-lime pb-[max(1rem,env(safe-area-inset-bottom))] lg:hidden"
        >
          <nav
            className={cn(pageContainer, "flex flex-col gap-2 py-4")}
            aria-label="Mobile"
          >
            {content.nav.map((item) => (
              <Link
                key={item.href}
                href={localePath(locale, item.href)}
                className="rounded-xl px-3 py-3 text-base font-medium text-ink hover:bg-white/50"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <LanguageSwitcher locale={locale} className="w-full sm:w-auto" />
              {isAdmin ? (
                <Button
                  href={adminHref}
                  variant="secondary"
                  className="w-full sm:w-auto"
                >
                  {appCopy.admin}
                </Button>
              ) : null}
              <Button href={ctaHref} className="w-full sm:w-auto">
                {auth.status === "loading" ? "…" : ctaLabel}
              </Button>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
