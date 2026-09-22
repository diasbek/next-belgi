"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * On route change: scroll to top unless a hash/anchor is present.
 */
export function HashScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const hash = window.location.hash.slice(1);
    if (hash) {
      const scrollToHash = () => {
        const el = document.getElementById(hash);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      };
      // Wait a tick for layout / sticky header scroll-padding
      requestAnimationFrame(() => {
        requestAnimationFrame(scrollToHash);
      });
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}
