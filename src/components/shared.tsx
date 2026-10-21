import type { CSSProperties, ReactNode } from "react";
import { cn } from "../utils/cn";
import { Icon } from "./Icons";
import { Link } from "../lib/router";
import { Reveal, useCountUp, useInView } from "../lib/motion";
import { IMG, TICKER, SERVICES } from "../data/content";

/* ---------------- ornament ---------------- */

export function Ornament({ className, light }: { className?: string; light?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <span className={cn("h-px w-10", light ? "bg-gold/60" : "bg-gold-deep/50")} />
      <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 text-gold" aria-hidden="true">
        <path d="M10 3v14M5.5 8h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      <span className={cn("h-px w-10", light ? "bg-gold/60" : "bg-gold-deep/50")} />
    </span>
  );
}

export function Kicker({
  children,
  className,
  light,
}: {
  children: ReactNode;
  className?: string;
  light?: boolean;
}) {
  return (
    <p
      className={cn(
        "flex items-center gap-3 text-[0.7rem] font-semibold uppercase tracking-[0.32em]",
        light ? "text-gold-2" : "text-gold-deep",
        className
      )}
    >
      <span className={cn("inline-block h-px w-8", light ? "bg-gold-2/60" : "bg-gold-deep/60")} />
      {children}
    </p>
  );
}

export function SectionTitle({
  kicker,
  title,
  lead,
  light,
  className,
  kickerClassName,
  titleClassName,
  center,
}: {
  kicker: string;
  title: ReactNode;
  lead?: ReactNode;
  light?: boolean;
  className?: string;
  kickerClassName?: string;
  titleClassName?: string;
  center?: boolean;
}) {
  return (
    <div className={cn("max-w-2xl", center && "mx-auto text-center", className)}>
      <Reveal>
        <p
          className={cn(
            "flex items-center gap-3 text-[0.7rem] font-semibold uppercase tracking-[0.32em]",
            light ? "text-gold-2" : "text-gold-deep",
            center && "justify-center",
            kickerClassName
          )}
        >
          <span className={cn("h-px w-8", light ? "bg-gold-2/60" : "bg-gold-deep/60")} />
          {kicker}
          {center && <span className={cn("h-px w-8", light ? "bg-gold-2/60" : "bg-gold-deep/60")} />}
        </p>
      </Reveal>
      <Reveal delay={90}>
        <h2
          className={cn(
            "mt-4 font-display text-4xl font-semibold leading-[1.06] tracking-tight sm:text-5xl",
            light ? "text-parchment" : "text-ink",
            titleClassName
          )}
        >
          {title}
        </h2>
      </Reveal>
      {lead && (
        <Reveal delay={180}>
          <p className={cn("mt-5 text-base leading-relaxed sm:text-lg", light ? "text-sand" : "text-stone")}>
            {lead}
          </p>
        </Reveal>
      )}
    </div>
  );
}

/* ---------------- verse ticker ---------------- */

export function Ticker({ className }: { className?: string }) {
  const items = [...TICKER, ...TICKER];
  return (
    <div className={cn("marquee overflow-hidden border-y border-gold/25 bg-ebony py-4", className)}>
      <div className="marquee-track flex w-max items-center gap-10 whitespace-nowrap pr-10" style={{ "--speed": "48s" } as CSSProperties}>
        {items.map((t, i) => (
          <span key={i} className="flex items-center gap-10">
            <span className="font-display text-sm italic tracking-wide text-parchment/80">{t}</span>
            <svg viewBox="0 0 20 20" className="h-2.5 w-2.5 text-gold" aria-hidden="true">
              <path d="M10 3v14M5.5 8h9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------------- stat ---------------- */

export function Stat({
  value,
  suffix,
  label,
  light,
}: {
  value: number;
  suffix: string;
  label: string;
  light?: boolean;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const n = useCountUp(value, inView);
  return (
    <div ref={ref} className={cn("border-t pt-5", light ? "border-parchment/20" : "border-ink/15")}>
      <p className={cn("font-display text-4xl font-bold tabular-nums sm:text-5xl", light ? "text-gold-2" : "text-gold-deep")}>
        {n.toLocaleString("en-GB")}
        {suffix}
      </p>
      <p className={cn("mt-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em]", light ? "text-sand" : "text-stone")}>
        {label}
      </p>
    </div>
  );
}

/* ---------------- page hero (inner pages) ---------------- */

export function PageHero({
  image,
  kicker,
  lines,
  lead,
  meta,
  kickerClassName,
  titleClassName,
}: {
  image: string;
  kicker: string;
  lines: ReactNode[];
  lead: ReactNode;
  meta?: { icon: string; text: string }[];
  kickerClassName?: string;
  titleClassName?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-ebony text-parchment">
      <div className="absolute inset-0" aria-hidden="true">
        <img
          src={image}
          alt=""
          fetchPriority="high"
          decoding="async"
          onError={(e) => {
            // If a custom banner image has not been uploaded yet, fall back to
            // the hero photograph so no page ever shows a broken image.
            const img = e.currentTarget;
            if (!img.src.endsWith(IMG.heroWorship)) img.src = IMG.heroWorship;
          }}
          className="h-full w-full object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ebony/65 via-ebony/40 to-ebony/80" />
      </div>
      <div className="relative mx-auto max-w-6xl px-5 pb-14 pt-32 sm:px-8 md:pb-20 md:pt-40">
        <Reveal>
          <p
            className={cn(
              "flex items-center gap-3 text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-gold-2",
              kickerClassName
            )}
          >
            <span className="h-px w-8 bg-gold-2/70" />
            {kicker}
          </p>
        </Reveal>
        <h1
          className={cn(
            "mt-6 font-display text-[clamp(2.7rem,7vw,5.2rem)] font-bold leading-[0.98] tracking-tight",
            titleClassName
          )}
        >
          {lines.map((l, i) => (
            <span key={i} className="mask-line">
              <span style={{ "--md": `${140 + i * 130}ms` } as CSSProperties}>{l}</span>
            </span>
          ))}
        </h1>
        <Reveal delay={420}>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-sand sm:text-lg">{lead}</p>
        </Reveal>
        {meta && (
          <Reveal delay={540}>
            <div className="mt-9 flex flex-wrap gap-x-8 gap-y-3">
              {meta.map((m, i) => (
                <span key={i} className="flex items-center gap-2.5 text-[0.8rem] font-medium tracking-wide text-parchment/80">
                  <Icon name={m.icon} className="h-4 w-4 text-gold-2" />
                  {m.text}
                </span>
              ))}
            </div>
          </Reveal>
        )}
      </div>
      <div className="relative h-6" />
    </section>
  );
}

/* ---------------- CTA band ---------------- */

export function CTABand({
  quote,
  cite,
  title,
  text,
}: {
  quote: string;
  cite: string;
  title: string;
  text: string;
}) {
  return (
    <section className="relative overflow-hidden bg-oxblood text-parchment">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            "radial-gradient(60% 90% at 85% 10%, rgba(221,185,100,0.55) 0%, transparent 60%), radial-gradient(50% 80% at 10% 100%, rgba(20,16,10,0.6) 0%, transparent 65%)",
        }}
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-6xl px-5 py-6 sm:px-8 md:py-8">
        <div className="grid items-center gap-5 md:grid-cols-2">
          <div>
            <Reveal>
              <p className="font-display text-base italic leading-snug text-gold-2 sm:text-lg">“{quote}”</p>
              <p className="mt-2 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-parchment/70">{cite}</p>
            </Reveal>
          </div>
          <div className="md:text-right">
            <Reveal delay={100}>
              <h2 className="font-display text-2xl font-bold leading-tight sm:text-3xl">{title}</h2>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-parchment/80 md:ml-auto">{text}</p>
            </Reveal>
            <Reveal delay={220}>
              <div className="mt-4 flex flex-wrap gap-3 md:justify-end">
                <Link to="/contact" className="btn btn-gold !px-5 !py-2.5 !text-[0.7rem]">
                  Plan a visit <Icon name="arrow" className="h-4 w-4" />
                </Link>
                <Link to="/who-we-are" className="btn btn-ghost !px-5 !py-2.5 !text-[0.7rem]">
                  What we believe
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- this-sunday services board ---------------- */

export function ServicesBoard({ className }: { className?: string }) {
  return (
    <div className={cn("border border-gold/40 bg-ebony-2/90", className)}>
      <div className="flex items-center justify-between border-b border-gold/30 px-5 py-4">
        <p className="text-[0.72rem] font-bold uppercase tracking-[0.28em] text-gold-2">Weekly Gatherings</p>
        <span className="candle inline-block h-2 w-2 rounded-full bg-gold-2" aria-hidden="true" />
      </div>
      <ul>
        {SERVICES.map((s) => (
          <li key={`${s.day}-${s.time}`} className="border-b border-parchment/10 px-5 py-3 last:border-0">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm font-semibold text-parchment/90">{s.name}</span>
              <span className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-parchment/50">{s.day}</span>
            </div>
            <span className="mt-0.5 block font-display text-sm font-semibold text-gold-2">{s.time}</span>
          </li>
        ))}
      </ul>
      <p className="px-5 py-3 text-[0.72rem] leading-relaxed text-sand">
        Come as you are — everyone is welcome at every gathering.
      </p>
    </div>
  );
}
