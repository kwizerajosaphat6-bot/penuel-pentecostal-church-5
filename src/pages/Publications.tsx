import { useEffect, useState } from "react";
import { Link, ROUTES } from "../lib/router";
import { Reveal } from "../lib/motion";
import { Icon } from "../components/Icons";
import { CTABand, PageHero, SectionTitle } from "../components/shared";
import { EVENTS_AND_ANNOUNCEMENTS, IMG, MEDIA, SERMONS } from "../data/content";
import { publicContent } from "../services/management";

/**
 * Publications
 * ------------------------------------------------------------------
 * The reading room of the site: the full text of every sermon, event,
 * announcement, and media item. Cards on the Home page deep-link here
 * (via a scroll target) so a visitor lands directly on the item they
 * clicked and can read the whole thing.
 *
 * Live data is pulled from the public API where available and silently
 * falls back to the bundled defaults, so the page is never empty.
 */

type SectionNavItem = { id: string; label: string; icon: string };

const SECTIONS: SectionNavItem[] = [
  { id: "sermons", label: "Recent Sermons", icon: "book" },
  { id: "events", label: "Events", icon: "clock" },
  { id: "announcements", label: "Announcements", icon: "radio" },
  { id: "media", label: "Media", icon: "star" },
];

function isAnnouncement(item: { type?: string }) {
  return (item.type || "").toLowerCase().includes("announcement");
}

export default function Publications() {
  const [sermons, setSermons] = useState<any[]>(SERMONS);
  const [occasions, setOccasions] = useState<any[]>(EVENTS_AND_ANNOUNCEMENTS);
  const [mediaItems, setMediaItems] = useState<any[]>(MEDIA);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const s = await publicContent.sermons();
        if (active && Array.isArray(s) && s.length) setSermons(s);
      } catch {
        /* keep bundled defaults */
      }
      try {
        const o = await publicContent.occasions();
        if (active && Array.isArray(o) && o.length) setOccasions(o);
      } catch {
        /* keep bundled defaults */
      }
      try {
        const m = await publicContent.media();
        if (active && Array.isArray(m) && m.length) setMediaItems(m);
      } catch {
        /* keep bundled defaults */
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const events = occasions.filter((o) => !isAnnouncement(o));
  const announcements = occasions.filter(isAnnouncement);

  return (
    <>
      <PageHero
        image={IMG.worshipGathering}
        kicker="Publications"
        titleClassName="!text-[clamp(1.35rem,3.5vw,2.6rem)]"
        lines={["Read, listen,", <span key="i" className="italic text-gold-2">and follow along.</span>]}
        lead="The full details of our recent sermons, upcoming events, announcements, and media — all in one place, for the whole church family and friends near and far."
        meta={[
          { icon: "book", text: "Full sermon notes" },
          { icon: "clock", text: "Events & announcements" },
          { icon: "star", text: "Photo galleries" },
        ]}
      />

      {/* quick jump navigation */}
      <nav aria-label="Publication sections" className="sticky top-16 z-30 border-b border-ink/10 bg-parchment/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap gap-2 px-5 py-3 sm:px-8">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                const el = document.getElementById(s.id);
                if (el) {
                  el.scrollIntoView({ behavior: "smooth" });
                } else {
                  sessionStorage.setItem("penuel-scroll-target", s.id);
                }
              }}
              className="inline-flex items-center gap-2 border border-ink/15 bg-parchment px-3 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-stone transition-colors hover:border-gold-deep/50 hover:text-gold-deep"
            >
              <Icon name={s.icon} className="h-3.5 w-3.5" />
              {s.label}
            </button>
          ))}
        </div>
      </nav>

      {/* ---------------- Sermons ---------------- */}
      <section id="sermons" className="scroll-mt-32 bg-parchment">
        <div className="mx-auto max-w-5xl px-5 py-14 sm:px-8 md:py-20">
          <SectionTitle
            kicker="Recent Sermons"
            titleClassName="!text-lg sm:!text-2xl"
            title={<>The Word, <span className="italic text-gold-deep">preached and written down.</span></>}
            lead="Miss a Sunday, or want to sit with a message again? Here is the full teaching from our recent services."
          />
          <div className="mt-10 space-y-6">
            {sermons.map((s, i) => (
              <Reveal key={s.id || s.title} delay={i * 60}>
                <article
                  id={s.id}
                  className="scroll-mt-32 border border-ink/15 bg-parchment/60 p-5 sm:p-7"
                >
                  {s.imageUrl && (
                    <div className="mb-4 overflow-hidden border border-ink/10">
                      <img
                        src={s.imageUrl}
                        alt={s.title}
                        loading="lazy"
                        decoding="async"
                        className="max-h-80 w-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                    <span className="font-display text-2xl font-bold text-gold-deep">
                      {s.day} {s.month}
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-stone">
                      {s.preacher}
                    </span>
                  </div>
                  <h3 className="mt-2 font-display text-xl font-bold text-ink sm:text-2xl">{s.title}</h3>
                  <p className="mt-1 font-display text-sm italic text-gold-deep">{s.scripture}</p>
                  {s.summary && (
                    <p className="mt-4 border-l-2 border-gold/50 pl-4 text-sm leading-relaxed text-stone">
                      {s.summary}
                    </p>
                  )}
                  {Array.isArray(s.body) && (
                    <div className="mt-4 space-y-3">
                      {s.body.map((p: string, j: number) => (
                        <p key={j} className="text-sm leading-relaxed text-stone sm:text-base">
                          {p}
                        </p>
                      ))}
                    </div>
                  )}
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Events ---------------- */}
      <section id="events" className="scroll-mt-32 bg-ebony text-parchment">
        <div className="mx-auto max-w-5xl px-5 py-14 sm:px-8 md:py-20">
          <SectionTitle
            light
            kicker="Events"
            titleClassName="!text-lg sm:!text-2xl"
            title={<>What's coming up, <span className="italic text-gold-2">in full.</span></>}
            lead="Everything you need to know about our upcoming gatherings — times, places, and what to expect."
          />
          <div className="mt-10 space-y-6">
            {events.map((e, i) => (
              <Reveal key={e.id || e.title} delay={i * 60}>
                <article id={e.id} className="scroll-mt-32 border border-parchment/15 bg-ebony-2/60 p-5 sm:p-7">
                  {e.imageUrl && (
                    <div className="mb-4 overflow-hidden border border-parchment/15">
                      <img
                        src={e.imageUrl}
                        alt={e.title}
                        loading="lazy"
                        decoding="async"
                        className="max-h-80 w-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-display text-xl font-bold text-gold-2">
                      {e.day} {e.month}
                    </span>
                    <span className="border border-gold/30 bg-gold/10 px-2 py-0.5 text-[0.55rem] font-bold uppercase tracking-[0.16em] text-gold-2">
                      {e.type || "Event"}
                    </span>
                  </div>
                  <h3 className="mt-2 font-display text-xl font-bold sm:text-2xl">{e.title}</h3>
                  <p className="mt-1 text-sm font-semibold text-sand">{e.time}</p>
                  <p className="mt-3 text-sm leading-relaxed text-sand">{e.detail}</p>
                  {Array.isArray(e.body) && (
                    <div className="mt-4 space-y-3 border-t border-parchment/10 pt-4">
                      {e.body.map((p: string, j: number) => (
                        <p key={j} className="text-sm leading-relaxed text-parchment/85 sm:text-base">
                          {p}
                        </p>
                      ))}
                    </div>
                  )}
                  <Link
                    to={ROUTES.contact}
                    className="mt-5 inline-flex items-center gap-2 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-gold-2 transition-colors hover:text-parchment"
                  >
                    Ask about this event <Icon name="arrow" className="h-4 w-4" />
                  </Link>
                </article>
              </Reveal>
            ))}
            {events.length === 0 && (
              <p className="text-sm text-sand">No upcoming events are scheduled right now. Please check back soon.</p>
            )}
          </div>
        </div>
      </section>

      {/* ---------------- Announcements ---------------- */}
      <section id="announcements" className="scroll-mt-32 bg-parchment-2">
        <div className="mx-auto max-w-5xl px-5 py-14 sm:px-8 md:py-20">
          <SectionTitle
            kicker="Announcements"
            titleClassName="!text-lg sm:!text-2xl"
            title={<>News for the <span className="italic text-gold-deep">church family.</span></>}
            lead="Notices, sign-ups, and reminders from around the church."
          />
          <div className="mt-10 space-y-6">
            {announcements.map((a, i) => (
              <Reveal key={a.id || a.title} delay={i * 60}>
                <article id={a.id} className="scroll-mt-32 border border-ink/15 bg-parchment p-5 sm:p-7">
                  {a.imageUrl && (
                    <div className="mb-4 overflow-hidden border border-ink/10">
                      <img
                        src={a.imageUrl}
                        alt={a.title}
                        loading="lazy"
                        decoding="async"
                        className="max-h-80 w-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-display text-xl font-bold text-gold-deep">
                      {a.day} {a.month}
                    </span>
                    <span className="border border-gold-deep/30 bg-gold-deep/10 px-2 py-0.5 text-[0.55rem] font-bold uppercase tracking-[0.16em] text-gold-deep">
                      {a.type || "Announcement"}
                    </span>
                  </div>
                  <h3 className="mt-2 font-display text-xl font-bold text-ink sm:text-2xl">{a.title}</h3>
                  <p className="mt-1 text-sm font-semibold text-stone">{a.time}</p>
                  <p className="mt-3 text-sm leading-relaxed text-stone">{a.detail}</p>
                  {Array.isArray(a.body) && (
                    <div className="mt-4 space-y-3 border-t border-ink/10 pt-4">
                      {a.body.map((p: string, j: number) => (
                        <p key={j} className="text-sm leading-relaxed text-stone sm:text-base">
                          {p}
                        </p>
                      ))}
                    </div>
                  )}
                </article>
              </Reveal>
            ))}
            {announcements.length === 0 && (
              <p className="text-sm text-stone">There are no announcements at the moment.</p>
            )}
          </div>
        </div>
      </section>

      {/* ---------------- Media ---------------- */}
      <section id="media" className="scroll-mt-32 bg-parchment">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 md:py-20">
          <SectionTitle
            kicker="Media"
            titleClassName="!text-lg sm:!text-2xl"
            title={<>Moments <span className="italic text-gold-deep">from our life together.</span></>}
            lead="Photo galleries from worship, outreach, and the life of the church."
          />
          <div className="mt-10 space-y-10">
            {mediaItems.map((m, i) => (
              <Reveal key={m.id} delay={i * 60}>
                <article
                  id={m.id}
                  className={`scroll-mt-32 grid gap-6 border border-ink/15 bg-parchment/60 md:grid-cols-2 ${
                    i % 2 === 1 ? "md:[&>figure]:order-2" : ""
                  }`}
                >
                  <figure className="relative overflow-hidden">
                    <img
                      src={m.imageUrl || (IMG as Record<string, string>)[m.image] || IMG.heroWorship}
                      alt={m.title}
                      loading="lazy"
                      decoding="async"
                      className="h-full min-h-56 w-full object-cover"
                    />
                    <span className="absolute left-3 top-3 border border-parchment/30 bg-ebony/70 px-2 py-0.5 text-[0.55rem] font-bold uppercase tracking-[0.16em] text-parchment">
                      {m.kind}
                    </span>
                  </figure>
                  <div className="p-5 sm:p-7">
                    <span className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-gold-deep">
                      {m.date}
                    </span>
                    <h3 className="mt-1 font-display text-xl font-bold text-ink sm:text-2xl">{m.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-stone">{m.detail}</p>
                    {Array.isArray(m.body) && (
                      <div className="mt-4 space-y-3 border-t border-ink/10 pt-4">
                        {m.body.map((p: string, j: number) => (
                          <p key={j} className="text-sm leading-relaxed text-stone">
                            {p}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CTABand
        quote="Come, and hear, all ye that fear God."
        cite="Psalm 66:16"
        title="There is always more to read."
        text="New sermons, events, and photos are added as the life of the church unfolds. Check back often, or come and be part of it in person."
      />
    </>
  );
}
