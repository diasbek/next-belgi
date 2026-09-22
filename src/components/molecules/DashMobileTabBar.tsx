"use client";

import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/paths";
import { cn } from "@/lib/cn";
import type { AppShellNavItem } from "@/components/templates/app-shell-nav";
import { IconMore, NavIcon } from "@/components/atoms/DashIcons";

function isActive(currentPath: string, href: string) {
  const c = currentPath.endsWith("/") ? currentPath : `${currentPath}/`;
  const h = href.endsWith("/") ? href : `${href}/`;
  if (h === "/account/" || h === "/admin/") return c === h;
  return c === h || c.startsWith(h);
}

export function DashMobileTabBar({
  locale,
  path,
  primary,
  moreLabel,
  moreActive,
  onMoreClick,
}: {
  locale: Locale;
  path: string;
  primary: AppShellNavItem[];
  moreLabel: string;
  moreActive: boolean;
  onMoreClick: () => void;
}) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-[70] border-t border-black/5 bg-white/95 backdrop-blur-md lg:hidden"
      style={{ paddingBottom: "var(--safe-bottom)" }}
      aria-label="Primary"
    >
      <ul
        className="m-0 grid list-none gap-0 p-0"
        style={{
          height: "var(--dash-tabbar-height)",
          gridTemplateColumns: `repeat(${primary.length + 1}, minmax(0, 1fr))`,
        }}
      >
        {primary.map((item) => {
          const active = isActive(path, item.href);
          return (
            <li key={item.href} className="min-w-0">
              <Link
                href={localePath(locale, item.href)}
                className={cn(
                  "flex h-full min-h-[var(--tap-min)] flex-col items-center justify-center gap-0.5 px-1 text-[0.65rem] font-medium transition-colors",
                  active ? "text-ink" : "text-ink-muted",
                )}
              >
                <span
                  className={cn(
                    "inline-flex items-center justify-center rounded-lg px-2.5 py-1 transition-transform active:scale-[0.96]",
                    active && "bg-lime",
                  )}
                >
                  <NavIcon href={item.href} />
                </span>
                <span className="max-w-full truncate">{item.label}</span>
              </Link>
            </li>
          );
        })}
        <li className="min-w-0">
          <button
            type="button"
            onClick={onMoreClick}
            className={cn(
              "flex h-full min-h-[var(--tap-min)] w-full flex-col items-center justify-center gap-0.5 px-1 text-[0.65rem] font-medium transition-colors",
              moreActive ? "text-ink" : "text-ink-muted",
            )}
          >
            <span
              className={cn(
                "inline-flex items-center justify-center rounded-lg px-2.5 py-1 transition-transform active:scale-[0.96]",
                moreActive && "bg-lime",
              )}
            >
              <IconMore />
            </span>
            <span className="max-w-full truncate">{moreLabel}</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
