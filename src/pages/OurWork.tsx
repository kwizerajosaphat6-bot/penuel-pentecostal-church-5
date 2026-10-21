import { Link, ROUTES } from "../lib/router";
import { Reveal, useCountUp, useInView } from "../lib/motion";
import { Icon } from "../components/Icons";
import { CTABand, PageHero, SectionTitle } from "../components/shared";
import { IMPACT, IMG, MINISTRIES } from "../data/content";

function Ministries() {
  return (
    <section className="bg-parchment">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 md:py-20">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.5fr] lg:gap-12">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <SectionTitle
              kicker="Inside the church"
              titleClassName="!text-lg sm:!text-2xl"
              title={<>Eight groups, <span className="italic text-gold-deep">and how to join one.</span></>}
              lead="None of these need a form or an interview. Turn up, tell whoever's running it that you'd like to help, and you're in. Most people start by making tea."
            />
            <Reveal delay={200}>
              <div className="mt-10 border-l-2 border-gold pl-5">
                <p className="font-display text-lg italic leading-snug text-ink">
                  “Every man according as he purposeth in his heart, so let him give.”
                </p>
                <cite className="mt-2 block text-[0.7rem] font-semibold uppercase not-italic tracking-[0.24em] text-gold-deep">
                  2 Corinthians 9:7
                </cite>
              </div>
            </Reveal>
            <Reveal delay={280}>
              <Link to={ROUTES.contact} className="btn btn-ghost-dark mt-10">
                Ask About Helping <Icon name="arrow" className="h-4 w-4" />
              </Link>
            </Reveal>
          </div>

          <div>
            {MINISTRIES.map((m, i) => (
              <Reveal key={m.title} delay={40}>
                <article className="group grid gap-4 border-t border-ink/15 py-8 transition-colors duration-300 hover:bg-parchment-2/70 sm:grid-cols-[56px_56px_1fr] sm:gap-6 sm:px-4">
                  <span className="font-display text-2xl font-bold text-ink/25 transition-colors duration-300 group-hover:text-gold-deep">
                    0{i + 1}
                  </span>
                  <span className="flex h-12 w-12 items-center justify-center border border-gold-deep/40 text-gold-deep transition-colors duration-300 group-hover:bg-gold-deep group-hover:text-parchment">
                    <Icon name={m.icon} className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                      <h3 className="font-display text-2xl font-bold">{m.title}</h3>
                      <span className="text-[0.65rem] font-bold uppercase tracking-[0.26em] text-gold-deep">{m.tag}</span>
                    </div>
                    <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-stone">{m.desc}</p>
                  </div>
                </article>
              </Reveal>
            ))}
            <div className="border-t border-b border-ink/15" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Community() {
  const { ref, inView } = useInView<HTMLDivElement>();
  const schools = useCountUp(5, inView);
  return (
    <section className="bg-ebony text-parchment">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 md:py-20">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionTitle
            light
            kicker="Beyond preaching and worship"
            titleClassName="!text-lg sm:!text-2xl"
            title={<>Serving our communities, <span className="italic text-gold-2">not just on Sundays.</span></>}
            lead="As the church has grown, our mission has grown with it — reaching beyond preaching and worship into education and community service across Rwanda."
          />
          <Reveal delay={140}>
            <p ref={ref} className="max-w-xs text-sm leading-relaxed text-sand">
              <span className="font-display text-4xl font-bold tabular-nums text-gold-2">
                {schools}
              </span>{" "}
              primary schools established in different parts of Rwanda, helping children and families
              grow.
            </p>
          </Reveal>
        </div>

        <div className="mt-10 grid gap-px border border-parchment/15 bg-parchment/15 sm:grid-cols-2 lg:grid-cols-3">
          {IMPACT.map((s, i) => (
            <div key={s.label} className="bg-ebony">
              <Reveal delay={(i % 3) * 80} className="h-full">
                <div className="group h-full border-transparent p-7 transition-colors duration-300 hover:bg-ebony-3 sm:p-8">
                  <p className="font-display text-5xl font-bold tabular-nums text-gold-2">{s.stat}</p>
                  <p className="mt-3.5 text-sm leading-relaxed text-sand">{s.label}</p>
                </div>
              </Reveal>
            </div>
          ))}
        </div>

        <Reveal delay={120}>
          <figure className="relative mt-10 overflow-hidden">
            <img
              src={IMG.community}
              alt="Pentecostal Penuel Church serving families in the community"
              loading="lazy"
              decoding="async"
              onError={(e) => {
                const img = e.currentTarget;
                if (!img.dataset.fellBack) {
                  img.dataset.fellBack = "1";
                  img.src = "/images/community.jpg";
                }
              }}
              className="aspect-[21/9] w-full object-cover"
            />
            <figcaption className="absolute bottom-0 left-0 bg-ebony/85 px-6 py-4">
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.26em] text-gold-2">Education &amp; community</p>
              <p className="mt-1 text-sm text-parchment/80">
                Five primary schools contributing to the education and development of children and
                communities.
              </p>
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}

function Serve() {
  const ways = [
    {
      icon: "hands",
      title: "Help out",
      text: "Chairs, tea, sound desk, children's classes, driving the van, sitting with people in hospital. Tell us roughly what you're good at and we'll find the gap.",
      cta: "I'd like to help",
    },
    {
      icon: "gift",
      title: "Give",
      text: "There's a box at the back and an office open on weekdays. The accounts are read out every quarter — what came in and exactly where it went. Ask anything.",
      cta: "Ask about giving",
    },
    {
      icon: "globe",
      title: "Partner with us",
      text: "Support one of our primary schools, help a new church branch get started, or partner with our community work. Small and steady beats large and once, every time.",
      cta: "Start a conversation",
    },
  ];
  return (
    <section className="bg-parchment-2">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 md:py-20">
        <SectionTitle center kicker="Three ways in" titleClassName="!text-lg sm:!text-2xl" title={<>Whatever time you've <span className="italic text-gold-deep">actually got.</span></>} />
        <div className="mt-10">
          {ways.map((w, i) => (
            <Reveal key={w.title} delay={i * 90}>
              <div className="group grid gap-5 border-t border-ink/15 py-9 transition-colors duration-300 hover:bg-parchment sm:grid-cols-[80px_130px_1fr_auto] sm:items-center sm:gap-8 sm:px-4">
                <span className="flex h-14 w-14 items-center justify-center border border-gold-deep/40 text-gold-deep transition-colors duration-300 group-hover:bg-gold-deep group-hover:text-parchment">
                  <Icon name={w.icon} className="h-6 w-6" />
                </span>
                <h3 className="font-display text-3xl font-bold">{w.title}</h3>
                <p className="max-w-2xl text-sm leading-relaxed text-stone">{w.text}</p>
                <Link
                  to={ROUTES.contact}
                  className="inline-flex items-center gap-2 text-[0.72rem] font-bold uppercase tracking-[0.26em] text-gold-deep transition-all duration-300 hover:gap-3.5 hover:text-ink"
                >
                  {w.cta} <Icon name="arrow" className="h-4 w-4" />
                </Link>
              </div>
            </Reveal>
          ))}
          <div className="border-t border-b border-ink/15" />
        </div>
      </div>
    </section>
  );
}

export default function OurWork() {
  return (
    <>
      <PageHero
        image={IMG.community}
        kicker="Our Work"
        lines={["What we do", <span key="i" className="italic text-gold-2">with the rest of the week.</span>]}
        lead="The groups inside the church, and the work that reaches beyond it — the Gospel, prayer, worship, education, and community service since 1998."
        meta={[
          { icon: "people", text: "Ministries for every age" },
          { icon: "globe", text: "Growing church branches" },
          { icon: "heart", text: "Serving since 1998" },
        ]}
      />
      <Ministries />
      <Community />
      <Serve />
      <CTABand
        quote="Freely ye have received, freely give."
        cite="Matthew 10:8"
        title="You don't need a skill we've heard of."
        text="Half the people serving here started by doing something they'd never done before. Say hello and we'll work out the rest together."
      />
    </>
  );
}
