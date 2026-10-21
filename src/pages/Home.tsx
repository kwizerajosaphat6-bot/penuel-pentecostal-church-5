import type { CSSProperties } from "react";
import { cn } from "../utils/cn";
import { Link, ROUTES } from "../lib/router";
import { Reveal } from "../lib/motion";
import { Icon } from "../components/Icons";
import { CTABand, Ornament, SectionTitle, Stat, Ticker } from "../components/shared";
import { CHURCH, DOCTRINES, EVENTS_AND_ANNOUNCEMENTS, IMG, MINISTRIES, SERMONS, SERVICES, STATS, TESTIMONIALS } from "../data/content";
import { useEffect, useState } from "react";
import { publicContent } from "../services/management";

const homeKicker = "!text-[1.4rem] !tracking-[0.12em] leading-tight";

/**
 * Deep-link a Home-page card to its full detail on the Publications page.
 * We store the element id to scroll to (an item id, or a section id as a
 * fallback) and let the App shell scroll to it after the route changes.
 */
function openDetail(itemId: string | undefined, sectionId: string) {
  sessionStorage.setItem("penuel-scroll-target", itemId || sectionId);
}

function HeroVisionBox() {
  return (
    <div className="border border-gold/45 bg-ebony-2/92">
      <div className="flex items-center justify-between border-b border-gold/30 px-4 py-3">
        <p className="text-[0.78rem] font-bold uppercase tracking-[0.22em] text-gold-2">Our Vision</p>
        <span className="candle inline-block h-2 w-2 rounded-full bg-gold-2" aria-hidden="true" />
      </div>
      <div className="px-4 py-4">
        <p className="font-display text-xl font-bold leading-tight text-parchment sm:text-2xl">
          {CHURCH.vision}
        </p>
        <p className="mt-3 text-xs leading-relaxed text-sand sm:text-sm">
          It is why we gather to worship, wait on His presence, and pray for one another — believing God
          still meets, changes, and blesses the people who seek Him.
        </p>
        <Link
          to={ROUTES.who}
          className="mt-4 inline-flex items-center gap-2 text-[0.68rem] font-bold uppercase tracking-[0.22em] text-gold-2 transition-colors duration-300 hover:text-parchment"
        >
          Vision in detail <Icon name="arrow" className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-ebony text-parchment">
      <div className="absolute inset-0" aria-hidden="true">
        <img
          src={IMG.heroWorship}
          alt=""
          fetchPriority="high"
          decoding="async"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ebony/80 via-ebony/50 to-ebony/15" />
        <div className="absolute inset-0 bg-gradient-to-t from-ebony/70 via-transparent to-ebony/30" />
      </div>

      <div className="relative mx-auto grid min-h-[82svh] max-w-7xl items-center gap-8 px-5 pb-20 pt-16 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
        <div>
          <h1 className="font-display text-[clamp(2.25rem,6.75vw,4.65rem)] font-bold leading-[0.95] tracking-tight">
            <span className="mask-line">
              <span style={{ "--md": "80ms" } as CSSProperties}>We Meet God</span>
            </span>
            <span className="mask-line">
              <span style={{ "--md": "220ms" } as CSSProperties} className="italic text-gold-2">
                at Penuel.
              </span>
            </span>
          </h1>
          <div className="mt-8 max-w-xl">
            <Ornament light className="mb-5" />
            <p className="font-display text-lg italic leading-snug text-parchment/90 sm:text-xl">
              “{CHURCH.verse}”
            </p>
            <p className="mt-2 text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-gold-2">{CHURCH.verseRef}</p>
          </div>
        </div>

        <div className="relative lg:w-full lg:max-w-sm lg:justify-self-end">
          <HeroVisionBox />
        </div>
      </div>
    </section>
  );
}

function Welcome() {
  return (
    <section className="bg-parchment">
      <div className="mx-auto max-w-4xl px-5 py-12 sm:px-8 md:py-14">
        <div className="grid items-center gap-7 lg:grid-cols-[0.8fr_1fr] lg:gap-9">
          <Reveal className="relative">
            <div className="relative mx-auto max-w-sm">
              <div className="absolute -top-4 -left-4 h-full w-full border border-gold-deep/40" aria-hidden="true" />
              <img
                src={IMG.founder}
                alt="Bishop Murindabigwi Ferdinand, founder of Pentecostal Penuel Church"
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  // If the founder photo fails to load (e.g. Drive
                  // rate-limits or sharing is removed), show the
                  // bundled placeholder portrait exactly once.
                  const img = e.currentTarget;
                  if (!img.dataset.fellBack) {
                    img.dataset.fellBack = "1";
                    img.src = IMG.pastor;
                  }
                }}
                className="relative aspect-[4/5] w-full object-cover object-top"
              />
              <p className="absolute bottom-0 left-0 bg-ebony/85 px-5 py-3 text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-gold-2">
                Bishop Murindabigwi Ferdinand · Founder & Legal Representative
              </p>
            </div>
          </Reveal>
          <div className="max-w-md">
            <Reveal>
              <p className="flex items-center gap-3 text-[1.4rem] font-semibold uppercase leading-tight tracking-[0.12em] text-gold-deep">
                <span className="h-px w-8 bg-gold-deep/60" />
                A word from our founder
              </p>
            </Reveal>
            <Reveal delay={90}>
              <h2 className="mt-4 font-display text-3xl font-semibold leading-[1.08] tracking-tight text-ink sm:text-4xl">
                A church born from a calling, still following God today.
              </h2>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-5 text-sm leading-relaxed text-stone">
                In 1998, God called us to begin this work in Ruyenzi. Six others answered that call with
                me, and together we opened the doors of Pentecostal Penuel Church. We have stayed in the
                same place ever since, and God has been faithful in every season.
              </p>
            </Reveal>
            <Reveal delay={240}>
              <p className="mt-3 text-sm leading-relaxed text-stone">
                What we offer you is a place to meet God, be changed in His presence, and be prayed for —
                over your soul and over the very ordinary parts of your life. That's our part. The rest
                is God's, and He has never once been late.
              </p>
            </Reveal>
            <Reveal delay={320}>
              <blockquote className="mt-6 border-l-2 border-gold pl-5">
                <p className="font-display text-base italic leading-snug text-ink">
                  “We follow God's calling, help people encounter Him, and become a blessing to families
                  and communities.”
                </p>
                <cite className="mt-2 block text-[0.7rem] font-semibold uppercase not-italic tracking-[0.24em] text-gold-deep">
                  — Bishop Murindabigwi Ferdinand
                </cite>
              </blockquote>
            </Reveal>
          </div>
        </div>

        <div className="mt-10 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 90}>
              <Stat value={s.value} suffix={s.suffix} label={s.label} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function ThisWeek() {
  return (
    <section className="relative w-full bg-ebony-2 text-parchment">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 md:py-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionTitle
            light
            kickerClassName={homeKicker}
            kicker="When we meet"
            title={
              <>
                Three gatherings <span className="italic text-gold-2">every week.</span>
              </>
            }
          />
          <Reveal delay={140}>
            <p className="max-w-xs text-xs sm:text-sm leading-relaxed text-sand">
              Sunday morning at 9:00 AM is the easiest place to start. You are welcome at every gathering.
            </p>
          </Reveal>
        </div>

        <div className="mt-7 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s, i) => (
            <Reveal key={`${s.day}-${s.time}`} delay={i * 60} className="h-full">
              <div
                className={cn(
                  "group flex h-full flex-col justify-between border bg-ebony-3/60 p-4 transition-colors duration-300 hover:border-gold-2/60 hover:bg-ebony-3",
                  s.featured ? "border-gold-2/70 bg-ebony-3" : "border-parchment/15"
                )}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-parchment/60">
                      {s.day}
                    </span>
                    {s.featured && (
                      <span className="bg-gold px-1.5 py-0.5 text-[0.52rem] font-bold uppercase tracking-[0.16em] text-ebony">
                        Start here
                      </span>
                    )}
                  </div>
                  <p className="mt-2 font-display text-xl font-bold tabular-nums text-gold-2 sm:text-2xl">
                    {s.time}
                  </p>
                  <p className="mt-1 font-display text-sm font-bold text-parchment leading-snug">
                    {s.name}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-sand">
                    {s.desc}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function BeliefPreview() {
  const three = DOCTRINES.slice(0, 3);
  return (
    <section className="bg-parchment">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 md:py-20">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.4fr] lg:gap-12">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <Reveal>
              <p className="flex items-center gap-3 text-[1.4rem] font-semibold uppercase leading-tight tracking-[0.12em] text-gold-deep">
                <span className="h-px w-8 bg-gold-deep/60" />
                What we believe
              </p>
            </Reveal>
            <Reveal delay={120}>
              <p className="mt-6 text-base leading-relaxed text-stone sm:text-lg">
                We're Pentecostal, which means we take the Bible seriously and expect the Holy Spirit to
                still be doing things. Here are the first three, with Scripture included.
              </p>
            </Reveal>
          </div>
          <div>
            {three.map((d, i) => (
              <Reveal key={d.title} delay={i * 90}>
                <article className="group grid gap-5 border-t border-ink/15 py-8 transition-colors duration-300 hover:bg-parchment-2/70 sm:grid-cols-[64px_1fr] sm:px-4">
                  <span className="flex h-14 w-14 items-center justify-center border border-gold-deep/40 text-gold-deep transition-colors duration-300 group-hover:bg-gold-deep group-hover:text-parchment">
                    <Icon name={d.icon} className="h-6 w-6" />
                  </span>
                  <div>
                    <div className="flex items-baseline gap-4">
                      <span className="font-display text-sm font-bold text-gold-deep">0{i + 1}</span>
                      <h3 className="font-display text-2xl font-bold">{d.title}</h3>
                    </div>
                    <p className="mt-3 max-w-xl leading-relaxed text-stone">{d.text}</p>
                    <p className="mt-3 font-display text-sm italic text-gold-deep">{d.verse}</p>
                  </div>
                </article>
              </Reveal>
            ))}
            <Reveal delay={280}>
              <div className="border-b border-ink/15 py-6">
                <Link
                  to={ROUTES.who}
                  onClick={() => sessionStorage.setItem("penuel-scroll-target", "beliefs")}
                  className="inline-flex items-center gap-2 text-[0.72rem] font-bold uppercase tracking-[0.22em] text-gold-deep transition-colors duration-300 hover:text-ink"
                >
                  See what we believe in detail <Icon name="arrow" className="h-4 w-4" />
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

function WhatWeDo() {
  const four = [MINISTRIES[0], MINISTRIES[1], MINISTRIES[2], MINISTRIES[5]];
  return (
    <section className="bg-ebony text-parchment">
      <div className="mx-auto max-w-5xl px-5 py-7 sm:px-8 md:py-9">
        <SectionTitle
          light
          center
          kickerClassName={homeKicker}
          titleClassName="!text-xl sm:!text-2xl"
          kicker="Groups inside the church"
          title={
            <>
              Eight groups, <span className="italic text-gold-2">all of them short-handed.</span>
            </>
          }
          lead="Choir, youth, children, women, men, prayer, radio, and outreach. Nobody has to join anything — but if you'd like to be useful, there's room today."
        />

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {four.map((m, i) => (
            <Reveal key={m.title} delay={(i % 2) * 60} className="h-full">
              <article className="group flex h-full flex-col justify-between border border-parchment/15 bg-ebony-2/80 p-4 transition-colors duration-300 hover:border-gold-2/50 hover:bg-ebony-3">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex h-8 w-8 items-center justify-center border border-gold/40 text-gold-2 transition-colors duration-300 group-hover:bg-gold group-hover:text-ebony">
                      <Icon name={m.icon} className="h-4 w-4" />
                    </span>
                    <span className="text-[0.55rem] font-bold uppercase tracking-[0.18em] text-gold-2">{m.tag}</span>
                  </div>
                  <h3 className="mt-3 font-display text-base font-bold text-parchment">{m.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-sand">{m.desc}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={100}>
          <div className="mt-5 flex flex-col items-center justify-between gap-3 border border-parchment/15 bg-ebony-2/60 p-3.5 sm:flex-row sm:p-4">
            <div className="flex items-center gap-3">
              <img
                src={IMG.community}
                alt="Volunteers from the church"
                loading="lazy"
                decoding="async"
                className="h-12 w-20 shrink-0 object-cover border border-parchment/10"
              />
              <div>
                <p className="text-[0.62rem] font-bold uppercase tracking-[0.22em] text-gold-2">Outside the walls</p>
                <h3 className="font-display text-sm font-bold text-parchment sm:text-base">
                  Forty-two trips since 2014 — food, clinic, school fees &amp; water.
                </h3>
              </div>
            </div>
            <Link
              to={ROUTES.work}
              className="inline-flex shrink-0 items-center gap-1.5 text-[0.65rem] font-bold uppercase tracking-[0.22em] text-gold-2 transition-colors duration-300 hover:text-parchment"
            >
              See our work
              <Icon name="arrow" className="h-3.5 w-3.5" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function SermonsAndEvents() {
  const [sermonList, setSermonList] = useState<any[]>(SERMONS);
  const [eventList, setEventList] = useState<any[]>(EVENTS_AND_ANNOUNCEMENTS);

  /**
   * Live content is pulled from the public API. If the API is unavailable
   * the page silently keeps the bundled defaults, so visitors always see a
   * complete page and never an error or an empty section.
   */
  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const sermons = await publicContent.sermons();
        if (active && Array.isArray(sermons) && sermons.length) setSermonList(sermons);
      } catch {
        /* keep bundled defaults */
      }

      try {
        const occasions = await publicContent.occasions();
        if (active && Array.isArray(occasions) && occasions.length) setEventList(occasions);
      } catch {
        /* keep bundled defaults */
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const isAnnouncement = (o: any) => (o.type || "").toLowerCase().includes("announcement");
  const sermons = sermonList.slice(0, 2);
  const events = eventList.filter((o) => !isAnnouncement(o)).slice(0, 2);
  const announcements = eventList.filter(isAnnouncement).slice(0, 2);

  const sectionHead = (title: string, target: string) => (
    <div className="flex items-center justify-between gap-3">
      <p className="flex items-center gap-3 text-[1.05rem] font-semibold uppercase leading-tight tracking-[0.12em] text-gold-deep sm:text-[1.2rem]">
        <span className="h-px w-6 bg-gold-deep/60" />
        {title}
      </p>
      <Link
        to={ROUTES.publications}
        onClick={() => openDetail(undefined, target)}
        className="inline-flex items-center gap-1 text-[0.6rem] font-bold uppercase tracking-[0.16em] text-gold-deep transition-colors hover:text-ink"
      >
        See all <Icon name="arrow" className="h-3 w-3" />
      </Link>
    </div>
  );

  return (
    <section className="bg-parchment-2">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 md:py-16">
        <div className="grid gap-8 lg:grid-cols-3 lg:gap-8">
          {/* Recent Sermons */}
          <div>
            {sectionHead("Recent Sermons", "sermons")}
            <div className="mt-5 space-y-3.5">
              {sermons.map((s, i) => (
                <Reveal key={s.id || s.title} delay={i * 70}>
                  <Link
                    to={ROUTES.publications}
                    onClick={() => openDetail(s.id, "sermons")}
                    className="group grid gap-3 border border-ink/15 bg-parchment/60 p-4 transition-colors duration-300 hover:border-gold-deep/50 hover:bg-parchment sm:grid-cols-[60px_1fr] sm:items-center"
                  >
                    <div className="flex items-baseline gap-2 sm:flex-col sm:gap-0">
                      <span className="font-display text-2xl font-bold text-ink/85">{s.day}</span>
                      <span className="text-[0.6rem] font-bold uppercase tracking-[0.24em] text-gold-deep">{s.month}</span>
                    </div>
                    <div>
                      <h3 className="font-display text-base font-bold text-ink transition-colors duration-300 group-hover:text-gold-deep">
                        {s.title}
                      </h3>
                      <p className="mt-1 text-xs text-stone">
                        <span className="font-display italic text-gold-deep">{s.scripture}</span>
                      </p>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Events */}
          <div>
            {sectionHead("Events", "events")}
            <div className="mt-5 space-y-3.5">
              {events.map((e, i) => (
                <Reveal key={e.id || e.title} delay={i * 70}>
                  <Link
                    to={ROUTES.publications}
                    onClick={() => openDetail(e.id, "events")}
                    className="group block border border-ink/15 bg-parchment/60 p-4 transition-colors duration-300 hover:border-gold-deep/50 hover:bg-parchment"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-display text-sm font-bold text-gold-deep">{e.day} {e.month}</span>
                      <span className="border border-gold-deep/30 bg-gold-deep/10 px-2 py-0.5 text-[0.52rem] font-bold uppercase tracking-[0.16em] text-gold-deep">
                        {e.type || "Event"}
                      </span>
                    </div>
                    <h3 className="mt-2 font-display text-base font-bold text-ink transition-colors duration-300 group-hover:text-gold-deep">
                      {e.title}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-stone">{e.detail}</p>
                  </Link>
                </Reveal>
              ))}
              {events.length === 0 && (
                <p className="text-xs text-stone">No upcoming events right now.</p>
              )}
            </div>
          </div>

          {/* Announcements */}
          <div>
            {sectionHead("Announcements", "announcements")}
            <div className="mt-5 space-y-3.5">
              {announcements.map((a, i) => (
                <Reveal key={a.id || a.title} delay={i * 70}>
                  <Link
                    to={ROUTES.publications}
                    onClick={() => openDetail(a.id, "announcements")}
                    className="group block border border-ink/15 bg-parchment/60 p-4 transition-colors duration-300 hover:border-gold-deep/50 hover:bg-parchment"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-display text-sm font-bold text-gold-deep">{a.day} {a.month}</span>
                      <span className="border border-gold-deep/30 bg-gold-deep/10 px-2 py-0.5 text-[0.52rem] font-bold uppercase tracking-[0.16em] text-gold-deep">
                        {a.type || "Announcement"}
                      </span>
                    </div>
                    <h3 className="mt-2 font-display text-base font-bold text-ink transition-colors duration-300 group-hover:text-gold-deep">
                      {a.title}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-stone">{a.detail}</p>
                  </Link>
                </Reveal>
              ))}
              {announcements.length === 0 && (
                <p className="text-xs text-stone">No announcements at the moment.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="bg-parchment">
      <div className="mx-auto max-w-5xl px-5 py-7 sm:px-8 md:py-9">
        <SectionTitle
          center
          kickerClassName={homeKicker}
          titleClassName="!text-xl sm:!text-2xl"
          kicker="Two members, in their own words"
          title={
            <>
              Nobody was asked to <span className="italic text-gold-deep">say anything nice.</span>
            </>
          }
        />
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 80}>
              <figure className="relative flex flex-col justify-between border border-ink/15 bg-parchment-2/60 p-4 sm:p-5">
                <div>
                  <svg viewBox="0 0 24 24" className="h-5 w-5 text-gold" aria-hidden="true">
                    <path
                      d="M10 7C7 7.8 5 10 5 13.2 5 15.6 6.6 17 8.6 17c1.8 0 3.2-1.4 3.2-3.2 0-1.7-1.2-3-2.9-3.2.3-1.4 1.4-2.6 3-3.1L10 7zm9 0c-3 .8-5 3-5 6.2 0 2.4 1.6 3.8 3.6 3.8 1.8 0 3.2-1.4 3.2-3.2 0-1.7-1.2-3-2.9-3.2.3-1.4 1.4-2.6 3-3.1L19 7z"
                      fill="currentColor"
                    />
                  </svg>
                  <blockquote className="mt-2.5">
                    <p className="font-display text-xs italic leading-relaxed text-ink sm:text-sm">{t.quote}</p>
                  </blockquote>
                </div>
                <figcaption className="mt-4 flex items-center gap-3 border-t border-ink/10 pt-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-gold-deep/50 font-display text-xs font-bold text-gold-deep">
                    {t.name.charAt(0)}
                  </span>
                  <div>
                    <span className="block text-xs font-semibold text-ink">{t.name}</span>
                    <span className="block text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-stone">
                      {t.role}
                    </span>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Hero />
      <Ticker />
      <Welcome />
      <ThisWeek />
      <BeliefPreview />
      <WhatWeDo />
      <SermonsAndEvents />
      <Testimonials />
      <CTABand
        quote="Come, and let us go up to the Lord."
        cite="Micah 4:2"
        title="There's a seat, and it's free."
        text="You don't need to believe anything yet, dress a particular way, or tell anyone your story. Come on Sunday morning at 9 and see what you think."
      />
    </>
  );
}
