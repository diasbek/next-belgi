"use client";

import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/paths";
import { LanguageSwitcher } from "@/components/molecules/LanguageSwitcher";
import { BottomSheet } from "@/components/molecules/BottomSheet";
import { NavIcon } from "@/components/atoms/DashIcons";
import type { AppShellNavItem } from "@/components/templates/app-shell-nav";
import { cn } from "@/lib/cn";

function isActive(currentPath: string, href: string) {
  const c = currentPath.endsWith("/") ? currentPath : `${currentPath}/`;
  const h = href.endsWith("/") ? href : `${href}/`;
  if (h === "/account/" || h === "/admin/") return c === h;
  return c === h || c.startsWith(h);
}

export function DashMoreSheet({
  open,
  onOpenChange,
  locale,
  path,
  moreNav,
  title,
  accountMenuLabel,
  logoutLabel,
  email,
  avatarLetter,
  profileLabel,
  onLogout,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locale: Locale;
  path: string;
  moreNav: AppShellNavItem[];
  title: string;
  accountMenuLabel: string;
  logoutLabel: string;
  email?: string | null;
  avatarLetter: string;
  profileLabel: string;
  onLogout: () => void;
}) {
  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} title={title}>
      {moreNav.length > 0 ? (
        <div className="mb-3 flex flex-col gap-0.5">
          {moreNav.map((item) => {
            const active = isActive(path, item.href);
            return (
              <Link
                key={item.href}
                href={localePath(locale, item.href)}
                onClick={() => onOpenChange(false)}
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
          })}
        </div>
      ) : null}

      <div className="rounded-2xl border border-black/5 bg-[#f3f4f1] p-3">
        <p className="m-0 mb-2 px-1 text-[0.65rem] font-semibold tracking-[0.08em] text-ink-muted/80 uppercase">
          {accountMenuLabel}
        </p>
        <div className="mb-3 flex items-center gap-3 px-1">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lime text-sm font-semibold">
            {avatarLetter}
          </span>
          <div className="min-w-0">
            <p className="m-0 truncate text-sm font-medium text-ink">
              {profileLabel}
            </p>
            {email ? (
              <p className="m-0 truncate text-xs text-ink-muted">{email}</p>
            ) : null}
          </div>
        </div>
        <div className="mb-2">
          <LanguageSwitcher locale={locale} variant="inline" />
        </div>
        <button
          type="button"
          onClick={() => {
            onOpenChange(false);
            onLogout();
          }}
          className="flex min-h-10 w-full items-center justify-center rounded-xl bg-white px-3 text-sm font-medium text-ink hover:bg-black/[0.04]"
        >
          {logoutLabel}
        </button>
      </div>
    </BottomSheet>
  );
}
