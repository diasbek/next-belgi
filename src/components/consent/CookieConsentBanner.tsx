"use client";

import { useEffect, useState } from "react";

export function CookieConsentBanner({
  text,
  acceptLabel,
  declineLabel,
}: {
  text: string;
  acceptLabel: string;
  declineLabel: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("belgi_cookie_consent");
      if (!stored) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  function save(value: "accepted" | "declined") {
    try {
      localStorage.setItem("belgi_cookie_consent", value);
    } catch {
      // ignore
    }
    setVisible(false);
  }

  return (
    <div className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-[60] mx-auto w-[min(100%-1.5rem,var(--content-band))] rounded-2xl border border-black/10 bg-white p-4 shadow-md md:inset-x-auto md:right-4 md:bottom-4">
      <p className="m-0 text-sm leading-relaxed text-ink">{text}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className="min-h-[var(--tap-min)] rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white"
          onClick={() => save("accepted")}
        >
          {acceptLabel}
        </button>
        <button
          type="button"
          className="min-h-[var(--tap-min)] rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-ink"
          onClick={() => save("declined")}
        >
          {declineLabel}
        </button>
      </div>
    </div>
  );
}
