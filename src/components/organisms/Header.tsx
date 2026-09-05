"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Locale } from "@/i18n/config";
import { localePath, stripLocalePrefix } from "@/i18n/paths";
import type { SiteCopy } from "@/data/types";
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

export function Header({ locale, content }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname() || "/";
  const { path: currentPath } = stripLocalePrefix(pathname);
  const loginHref = localePath(locale, "/login/");
  const homeHref = localePath(locale, "/");

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-lime/90 backdrop-blur-md">
      <div
        className={cn(
          pageContainer,
          "flex min-h-[var(--header-height)] items-center justify-between gap-4",
        )}
      >
        <Link
          href={homeHref}
          className="font-display text-2xl font-semibold tracking-tight text-ink"
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
          <Button href={loginHref} className="px-5">
            {content.ui.login}
          </Button>
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white/70 lg:hidden"
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
          className="border-t border-black/5 bg-lime px-4 py-4 lg:hidden"
        >
          <nav className="flex flex-col gap-3">
            {content.nav.map((item) => (
              <Link
                key={item.href}
                href={localePath(locale, item.href)}
                className="rounded-xl px-3 py-3 text-base font-medium text-ink hover:bg-white/50"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-wrap gap-3">
              <LanguageSwitcher locale={locale} />
              <Button href={loginHref}>{content.ui.login}</Button>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
