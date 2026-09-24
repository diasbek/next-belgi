"use client";

import {
  useCallback,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { deckCopy } from "@/data/deck";
import { cn } from "@/lib/cn";
import { Button } from "@/components/atoms/Button";

export type DeckContacts = {
  phone: string | null;
  email: string | null;
  telegramUrl: string | null;
};

const SLIDE_IDS = [
  "title",
  "problem",
  "how",
  "why",
  "business",
  "gtm",
  "team",
  "offer",
] as const;

type SlideId = (typeof SLIDE_IDS)[number];

function SlideShell({
  id,
  children,
  className,
}: {
  id: SlideId;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      id={`slide-${id}`}
      data-slide={id}
      className={cn(
        "flex min-h-dvh w-full snap-start snap-always flex-col justify-center px-5 py-16 sm:px-10 lg:px-16",
        className,
      )}
    >
      <div className="mx-auto w-full max-w-4xl">{children}</div>
    </section>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">
      {children}
    </p>
  );
}

function SlideHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="m-0 mt-3 font-display text-[clamp(1.5rem,3.5vw,2.35rem)] font-semibold leading-[1.15] tracking-[-0.03em] text-ink">
      {children}
    </h2>
  );
}

export function DeckView({ contacts }: { contacts: DeckContacts }) {
  const copy = deckCopy;
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const scrollToIndex = useCallback((index: number) => {
    const root = scrollerRef.current;
    if (!root) return;
    const sections = root.querySelectorAll<HTMLElement>("[data-slide]");
    const target = sections[index];
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const onScroll = useEffectEvent(() => {
    const root = scrollerRef.current;
    if (!root) return;
    const sections = root.querySelectorAll<HTMLElement>("[data-slide]");
    let best = 0;
    let bestDist = Infinity;
    const mid = root.scrollTop + root.clientHeight / 2;
    sections.forEach((el, i) => {
      const center = el.offsetTop + el.offsetHeight / 2;
      const dist = Math.abs(center - mid);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });
    setActive(best);
  });

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;
    onScroll();
    root.addEventListener("scroll", onScroll, { passive: true });
    return () => root.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        scrollToIndex(Math.min(active + 1, SLIDE_IDS.length - 1));
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        scrollToIndex(Math.max(active - 1, 0));
      } else if (e.key === "Home") {
        e.preventDefault();
        scrollToIndex(0);
      } else if (e.key === "End") {
        e.preventDefault();
        scrollToIndex(SLIDE_IDS.length - 1);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, scrollToIndex]);

  const hasContacts =
    Boolean(contacts.phone) ||
    Boolean(contacts.email) ||
    Boolean(contacts.telegramUrl);

  return (
    <div className="relative bg-white text-ink">
      <div
        ref={scrollerRef}
        className="h-dvh snap-y snap-mandatory overflow-y-auto overscroll-y-contain"
      >
        <SlideShell
          id="title"
          className="bg-gradient-to-br from-lime via-white to-surface-muted"
        >
          <p className="m-0 font-display text-[clamp(2.5rem,8vw,5rem)] font-semibold tracking-[-0.04em] text-ink">
            {copy.brand}
          </p>
          <p className="mt-4 max-w-xl text-lg leading-snug text-ink/80 sm:text-xl">
            {copy.title.tagline}
          </p>
          <p className="mt-6 text-sm font-medium text-ink/50">
            {copy.title.market} · {copy.title.url}
          </p>
        </SlideShell>

        <SlideShell id="problem">
          <Eyebrow>{copy.problem.eyebrow}</Eyebrow>
          <SlideHeading>{copy.problem.heading}</SlideHeading>
          <ul className="mt-8 m-0 list-none space-y-4 p-0">
            {copy.problem.pairs.map((pair) => (
              <li
                key={pair.problem}
                className="grid gap-2 rounded-xl border border-ink/10 bg-surface-muted/60 p-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-4 sm:p-5"
              >
                <p className="m-0 text-sm leading-snug text-ink/70">
                  {pair.problem}
                </p>
                <span
                  className="hidden text-ink/30 sm:inline"
                  aria-hidden
                >
                  →
                </span>
                <p className="m-0 text-sm font-medium leading-snug text-ink">
                  <span className="mr-1 text-ink/40 sm:hidden">→ </span>
                  {pair.solution}
                </p>
              </li>
            ))}
          </ul>
        </SlideShell>

        <SlideShell id="how">
          <Eyebrow>{copy.how.eyebrow}</Eyebrow>
          <SlideHeading>{copy.how.heading}</SlideHeading>
          <ol className="mt-8 m-0 grid list-none gap-4 p-0 sm:grid-cols-2">
            {copy.how.steps.map((step, i) => (
              <li
                key={step.title}
                className="rounded-xl border border-ink/10 p-4 sm:p-5"
              >
                <p className="m-0 text-xs font-semibold tabular-nums text-ink/40">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <p className="m-0 mt-2 font-semibold text-ink">{step.title}</p>
                <p className="m-0 mt-1.5 text-sm leading-snug text-ink/65">
                  {step.text}
                </p>
              </li>
            ))}
          </ol>
        </SlideShell>

        <SlideShell id="why">
          <Eyebrow>{copy.why.eyebrow}</Eyebrow>
          <SlideHeading>{copy.why.heading}</SlideHeading>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {copy.why.against.map((line) => (
              <p
                key={line}
                className="m-0 rounded-xl bg-ink/[0.04] px-4 py-3 text-sm leading-snug text-ink/60"
              >
                {line}
              </p>
            ))}
          </div>
          <ul className="mt-6 m-0 list-none space-y-2.5 p-0">
            {copy.why.points.map((point) => (
              <li
                key={point}
                className="flex gap-3 text-sm leading-snug text-ink"
              >
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-ink" />
                {point}
              </li>
            ))}
          </ul>
        </SlideShell>

        <SlideShell id="business">
          <Eyebrow>{copy.business.eyebrow}</Eyebrow>
          <SlideHeading>{copy.business.heading}</SlideHeading>
          <ul className="mt-8 m-0 list-none space-y-3 p-0">
            {copy.business.points.map((point) => (
              <li
                key={point}
                className="rounded-xl border border-ink/10 px-4 py-3.5 text-sm leading-snug text-ink sm:px-5"
              >
                {point}
              </li>
            ))}
          </ul>
        </SlideShell>

        <SlideShell id="gtm">
          <Eyebrow>{copy.gtm.eyebrow}</Eyebrow>
          <SlideHeading>{copy.gtm.heading}</SlideHeading>
          <ul className="mt-8 m-0 grid list-none gap-3 p-0 sm:grid-cols-2">
            {copy.gtm.points.map((point, i) => (
              <li
                key={point}
                className="rounded-xl bg-lime/40 px-4 py-4 text-sm leading-snug text-ink sm:px-5"
              >
                <span className="block text-xs font-semibold tabular-nums text-ink/40">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="mt-2 block">{point}</span>
              </li>
            ))}
          </ul>
        </SlideShell>

        <SlideShell id="team">
          <Eyebrow>{copy.team.eyebrow}</Eyebrow>
          <SlideHeading>{copy.team.heading}</SlideHeading>
          <ul className="mt-8 m-0 grid list-none gap-3 p-0 sm:grid-cols-3">
            {copy.team.roles.map((member) => (
              <li
                key={member.role}
                className="rounded-xl border border-ink/10 p-4 sm:p-5"
              >
                <p className="m-0 font-semibold text-ink">{member.role}</p>
                <p className="m-0 mt-2 text-sm text-ink/55">{member.note}</p>
              </li>
            ))}
          </ul>
        </SlideShell>

        <SlideShell id="offer">
          <Eyebrow>{copy.offer.eyebrow}</Eyebrow>
          <SlideHeading>{copy.offer.heading}</SlideHeading>
          <ul className="mt-6 m-0 list-none space-y-2.5 p-0">
            {copy.offer.offers.map((offer) => (
              <li
                key={offer}
                className="flex gap-3 text-sm leading-snug text-ink sm:text-[0.9375rem]"
              >
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-ink" />
                {offer}
              </li>
            ))}
          </ul>
          <div className="mt-8 border-t border-ink/10 pt-6">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">
              {copy.offer.contactsLabel}
            </p>
            {hasContacts ? (
              <ul className="mt-3 m-0 list-none space-y-1.5 p-0 text-sm text-ink">
                {contacts.phone ? (
                  <li>
                    <a
                      href={`tel:${contacts.phone.replace(/\s/g, "")}`}
                      className="text-ink underline-offset-2 hover:underline"
                    >
                      {contacts.phone}
                    </a>
                  </li>
                ) : null}
                {contacts.email ? (
                  <li>
                    <a
                      href={`mailto:${contacts.email}`}
                      className="text-ink underline-offset-2 hover:underline"
                    >
                      {contacts.email}
                    </a>
                  </li>
                ) : null}
                {contacts.telegramUrl ? (
                  <li>
                    <a
                      href={contacts.telegramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-ink underline-offset-2 hover:underline"
                    >
                      Telegram
                    </a>
                  </li>
                ) : null}
              </ul>
            ) : (
              <p className="mt-3 m-0 text-sm text-ink/55">
                {copy.offer.contactsFallback}
              </p>
            )}
            <div className="mt-6 flex flex-wrap gap-3">
              <Button href="/check/" variant="primary">
                {copy.offer.ctaCheck}
              </Button>
              <Button href="/contacts/" variant="secondary">
                {copy.offer.ctaContacts}
              </Button>
            </div>
            <p className="mt-8 m-0 font-display text-xl font-semibold tracking-tight text-ink">
              <Link href="/" className="text-ink no-underline">
                {copy.brand}
              </Link>
            </p>
          </div>
        </SlideShell>
      </div>

      <nav
        className="pointer-events-none fixed inset-y-0 right-3 z-10 flex flex-col items-center justify-center gap-2 sm:right-5"
        aria-label="Слайды"
      >
        {SLIDE_IDS.map((id, i) => (
          <button
            key={id}
            type="button"
            aria-label={`Слайд ${i + 1}`}
            aria-current={active === i ? "true" : undefined}
            className={cn(
              "pointer-events-auto size-2 rounded-full transition",
              active === i ? "bg-ink scale-125" : "bg-ink/25 hover:bg-ink/50",
            )}
            onClick={() => scrollToIndex(i)}
          />
        ))}
      </nav>

      <div className="pointer-events-none fixed bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2 sm:bottom-6">
        <button
          type="button"
          aria-label="Предыдущий слайд"
          disabled={active === 0}
          className="pointer-events-auto flex size-9 items-center justify-center rounded-full border border-ink/15 bg-white/90 text-sm text-ink shadow-sm disabled:opacity-30"
          onClick={() => scrollToIndex(active - 1)}
        >
          ↑
        </button>
        <button
          type="button"
          aria-label="Следующий слайд"
          disabled={active === SLIDE_IDS.length - 1}
          className="pointer-events-auto flex size-9 items-center justify-center rounded-full border border-ink/15 bg-white/90 text-sm text-ink shadow-sm disabled:opacity-30"
          onClick={() => scrollToIndex(active + 1)}
        >
          ↓
        </button>
      </div>
    </div>
  );
}
