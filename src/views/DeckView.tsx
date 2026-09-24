"use client";

import {
  useCallback,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from "react";
import { deckCopy } from "@/data/deck";
import { cn } from "@/lib/cn";
import { DeckHowDemo } from "@/components/organisms/DeckHowDemo";
import { DeckBusinessModel } from "@/components/organisms/DeckBusinessModel";
import { DeckGtmPlan } from "@/components/organisms/DeckGtmPlan";
import { DeckOfferSlide } from "@/components/organisms/DeckOfferSlide";

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
  contentClassName,
}: {
  id: SlideId;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
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
      <div className={cn("mx-auto w-full max-w-4xl", contentClassName)}>
        {children}
      </div>
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

export function DeckView() {
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

  const offerActive = active === SLIDE_IDS.indexOf("offer");

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

        <SlideShell id="how" contentClassName="max-w-5xl">
          <Eyebrow>{copy.how.eyebrow}</Eyebrow>
          <SlideHeading>{copy.how.heading}</SlideHeading>
          <DeckHowDemo
            steps={copy.how.steps}
            demo={copy.how.demo}
            active={active === SLIDE_IDS.indexOf("how")}
          />
        </SlideShell>

        <SlideShell id="why" contentClassName="max-w-5xl">
          <Eyebrow>{copy.why.eyebrow}</Eyebrow>
          <SlideHeading>{copy.why.heading}</SlideHeading>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-ink/10">
            <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-ink/10 bg-surface-muted/80">
                  <th
                    scope="col"
                    className="px-3 py-3 text-xs font-semibold uppercase tracking-[0.06em] text-ink/45 sm:px-4"
                  >
                    Параметр
                  </th>
                  {copy.why.columns.map((col, i) => (
                    <th
                      key={col}
                      scope="col"
                      className={cn(
                        "px-2 py-3 text-center text-xs font-semibold sm:px-3",
                        i === 0
                          ? "bg-lime/60 text-ink"
                          : "text-ink/70",
                      )}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {copy.why.rows.map((row) => (
                  <tr
                    key={row.label}
                    className="border-b border-ink/10 last:border-b-0"
                  >
                    <th
                      scope="row"
                      className="max-w-[14rem] px-3 py-2.5 text-left text-[0.8125rem] font-medium leading-snug text-ink sm:px-4 sm:text-sm"
                    >
                      {row.label}
                    </th>
                    {row.values.map((value, i) => (
                      <td
                        key={`${row.label}-${i}`}
                        className={cn(
                          "px-2 py-2.5 text-center sm:px-3",
                          i === 0 && "bg-lime/25",
                        )}
                      >
                        <span
                          className={cn(
                            "inline-flex min-w-[1.5rem] items-center justify-center rounded-md px-1.5 py-0.5 text-xs font-semibold",
                            value === "yes" && "bg-ink text-white",
                            value === "partial" &&
                              "bg-ink/10 text-ink/70",
                            value === "no" && "text-ink/30",
                          )}
                          title={
                            value === "yes"
                              ? copy.why.legendYes
                              : value === "partial"
                                ? copy.why.legendPartial
                                : copy.why.legendNo
                          }
                        >
                          {value === "yes"
                            ? "✓"
                            : value === "partial"
                              ? "~"
                              : "—"}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 m-0 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink/45">
            <span>✓ {copy.why.legendYes}</span>
            <span>~ {copy.why.legendPartial}</span>
            <span>— {copy.why.legendNo}</span>
          </p>
          <p className="mt-2 m-0 text-xs leading-relaxed text-ink/40">
            {copy.why.footnote}
          </p>
        </SlideShell>

        <SlideShell
          id="business"
          contentClassName="max-w-5xl"
          className="justify-start overflow-y-auto py-12 sm:justify-center sm:py-14"
        >
          <Eyebrow>{copy.business.eyebrow}</Eyebrow>
          <SlideHeading>{copy.business.heading}</SlideHeading>
          <DeckBusinessModel
            actors={copy.business.actors}
            flows={copy.business.flows}
            moneyTitle={copy.business.moneyTitle}
            moneySources={copy.business.moneySources}
            satisfactionTitle={copy.business.satisfactionTitle}
            satisfactionSteps={copy.business.satisfactionSteps}
            legend={copy.business.legend}
            footnote={copy.business.footnote}
          />
        </SlideShell>

        <SlideShell
          id="gtm"
          contentClassName="max-w-5xl"
          className="justify-start overflow-y-auto py-12 sm:justify-center sm:py-14"
        >
          <Eyebrow>{copy.gtm.eyebrow}</Eyebrow>
          <SlideHeading>{copy.gtm.heading}</SlideHeading>
          <DeckGtmPlan
            lead={copy.gtm.lead}
            stages={copy.gtm.stages}
            footnote={copy.gtm.footnote}
          />
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

        <SlideShell
          id="offer"
          contentClassName="max-w-5xl"
          className="justify-start overflow-y-auto bg-[#171917] py-12 text-white sm:justify-center sm:py-14"
        >
          <DeckOfferSlide
            heading={copy.offer.heading}
            items={copy.offer.items}
            contact={copy.offer.contact}
          />
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
              active === i
                ? offerActive
                  ? "scale-125 bg-lime"
                  : "scale-125 bg-ink"
                : offerActive
                  ? "bg-white/35 hover:bg-white/60"
                  : "bg-ink/25 hover:bg-ink/50",
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
          className={cn(
            "pointer-events-auto flex size-9 items-center justify-center rounded-full border text-sm shadow-sm disabled:opacity-30",
            offerActive
              ? "border-white/20 bg-[#222622]/90 text-white"
              : "border-ink/15 bg-white/90 text-ink",
          )}
          onClick={() => scrollToIndex(active - 1)}
        >
          ↑
        </button>
        <button
          type="button"
          aria-label="Следующий слайд"
          disabled={active === SLIDE_IDS.length - 1}
          className={cn(
            "pointer-events-auto flex size-9 items-center justify-center rounded-full border text-sm shadow-sm disabled:opacity-30",
            offerActive
              ? "border-white/20 bg-[#222622]/90 text-white"
              : "border-ink/15 bg-white/90 text-ink",
          )}
          onClick={() => scrollToIndex(active + 1)}
        >
          ↓
        </button>
      </div>
    </div>
  );
}
