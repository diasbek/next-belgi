"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import type { DeckOfferItem } from "@/data/deck";
import { cn } from "@/lib/cn";

function OfferIcon({ index }: { index: number }) {
  const common = "size-5 shrink-0 text-ink sm:size-6";
  if (index === 0) {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M7 4h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path
          d="M8 8h8M8 12h8M8 16h5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (index === 1) {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M4 7h16v10H4V7Z"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path
          d="M8 11h8M8 15h5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M7 7V5.5A1.5 1.5 0 0 1 8.5 4h7A1.5 1.5 0 0 1 17 5.5V7"
          stroke="currentColor"
          strokeWidth="1.6"
        />
      </svg>
    );
  }
  return (
    <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="7.25" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M8.5 12.2 10.8 14.5 15.5 9.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DeckOfferSlide({
  heading,
  items,
  contact,
}: {
  heading: string;
  items: DeckOfferItem[];
  contact: {
    name: string;
    role: string;
    initials: string;
    telegramLabel: string;
    telegramUrl: string;
    email: string;
    qrUrl: string;
  };
}) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(contact.qrUrl, {
      margin: 1,
      width: 220,
      color: { dark: "#111311", light: "#ffffff" },
    })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, [contact.qrUrl]);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(16rem,0.75fr)] lg:items-start lg:gap-10">
      <div>
        <h2 className="m-0 font-display text-[clamp(1.35rem,3.2vw,2.1rem)] font-semibold uppercase leading-[1.15] tracking-[-0.02em] text-white">
          {heading}
        </h2>

        <ol className="mt-8 m-0 list-none space-y-6 p-0 sm:mt-10 sm:space-y-7">
          {items.slice(0, 3).map((item, i) => (
            <li key={item.segment} className="grid gap-3">
              <div className="flex gap-3 sm:gap-4">
                <span className="font-display text-2xl font-semibold tabular-nums leading-none text-lime sm:text-3xl">
                  {i + 1}
                </span>
                <p className="m-0 pt-0.5 text-sm font-semibold uppercase leading-snug tracking-[0.02em] text-white sm:text-[0.9375rem]">
                  {item.segment}
                </p>
              </div>
              <div
                className={cn(
                  "flex items-start gap-3 rounded-2xl bg-lime px-4 py-3.5 text-ink sm:gap-4 sm:px-5 sm:py-4",
                )}
              >
                <OfferIcon index={i} />
                <p className="m-0 text-[0.8125rem] font-medium leading-snug sm:text-sm">
                  {item.offer}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <aside className="rounded-3xl border border-white/10 bg-[#222622] px-5 py-6 text-center sm:px-6 sm:py-7">
        <div
          className="mx-auto flex size-20 items-center justify-center rounded-full bg-lime font-display text-xl font-semibold text-ink sm:size-24 sm:text-2xl"
          aria-hidden
        >
          {contact.initials}
        </div>
        <p className="m-0 mt-4 text-sm font-semibold uppercase tracking-[0.04em] text-white sm:text-base">
          {contact.name}
        </p>
        <p className="m-0 mt-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-lime">
          {contact.role}
        </p>

        <div className="mx-auto mt-5 w-fit rounded-xl bg-white p-2.5">
          {qrDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qrDataUrl}
              alt="QR-код на страницу контактов"
              width={160}
              height={160}
              className="size-36 sm:size-40"
            />
          ) : (
            <div className="flex size-36 items-center justify-center bg-white text-xs text-ink/40 sm:size-40">
              QR
            </div>
          )}
        </div>

        <ul className="mt-5 m-0 list-none space-y-2.5 p-0 text-left text-sm text-white/85">
          <li>
            <a
              href={contact.telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-white/85 no-underline hover:text-lime"
            >
              <span aria-hidden>✈</span>
              {contact.telegramLabel}
            </a>
          </li>
          <li>
            <a
              href={`mailto:${contact.email}`}
              className="inline-flex items-center gap-2 text-white/85 no-underline hover:text-lime"
            >
              <span aria-hidden>✉</span>
              {contact.email}
            </a>
          </li>
        </ul>
      </aside>
    </div>
  );
}
