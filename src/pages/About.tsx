import { Reveal } from "../lib/motion";
import { Icon } from "../components/Icons";
import { CTABand, Kicker, PageHero, SectionTitle } from "../components/shared";
import { CHURCH, FAITH_STATEMENT, HISTORY, IMG, OBJECTIVES, VALUES } from "../data/content";

const aboutKicker = "!text-[1.4rem] !tracking-[0.12em] leading-tight";

function Vision() {
  return (
    <section className="bg-parchment">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 md:py-20">
        <div className="grid gap-7 lg:grid-cols-[0.7fr_1.5fr] lg:gap-12">
          <Kicker className={aboutKicker}>What we're aiming at</Kicker>
          <div>
            <Reveal>
              <p className="font-display text-[clamp(1.05rem,2.3vw,1.7rem)] font-bold leading-[1.2] tracking-tight text-ink">
                {CHURCH.vision}
              </p>
            </Reveal>
            <Reveal delay={140}>
              <p className="mt-8 max-w-2xl leading-relaxed text-stone">
                In simple words: we want people to <em className="text-gold-deep">meet God</em>, be{" "}
                <em className="text-gold-deep">transformed by His presence</em>, and receive{" "}
                <em className="text-gold-deep">His blessing</em> — for their souls and for their everyday,
                physical lives. It is a vision we keep short on purpose, so it is easy to remember on any
                ordinary day.
              </p>
            </Reveal>
            <Reveal delay={220}>
              <div className="mt-8 flex flex-wrap gap-3">
                {CHURCH.visionVerses.map((v) => (
                  <span
                    key={v}
                    className="border border-gold-deep/40 px-3.5 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.22em] text-gold-deep"
                  >
                    {v}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

function OurStory() {
  return (
    <section className="bg-parchment-2">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 md:py-20">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.3fr] lg:gap-14">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Kicker className={aboutKicker}>Our story</Kicker>
            <Reveal delay={80}>
              <h2 className="mt-5 font-display text-2xl font-bold leading-[1.15] tracking-tight text-ink sm:text-3xl">
                A short history of Pentecostal Penuel Church
              </h2>
            </Reveal>
            <Reveal delay={160}>
              <div className="mt-6 space-y-3 border-l-2 border-gold pl-5">
                <p className="flex items-center gap-2 text-sm font-semibold text-ink">
                  <Icon name="star" className="h-4 w-4 text-gold-deep" /> Founded in 1998
                </p>
                <p className="flex items-center gap-2 text-sm font-semibold text-ink">
                  <Icon name="pin" className="h-4 w-4 text-gold-deep" /> {CHURCH.location}, {CHURCH.country}
                </p>
                <p className="flex items-center gap-2 text-sm font-semibold text-ink">
                  <Icon name="people" className="h-4 w-4 text-gold-deep" /> {CHURCH.founder} &amp; six co-founders
                </p>
                <p className="flex items-center gap-2 text-sm font-semibold text-ink">
                  <Icon name="book" className="h-4 w-4 text-gold-deep" /> Five primary schools across Rwanda
                </p>
              </div>
            </Reveal>
          </div>

          <div className="space-y-5">
            {HISTORY.paragraphs.map((para, i) => (
              <Reveal key={i} delay={i * 90}>
                <p
                  className={`leading-relaxed text-stone ${
                    i === 0 ? "text-lg text-ink sm:text-xl" : ""
                  }`}
                >
                  {para}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Mission() {
  const points = [
    {
      icon: "cross",
      title: "Preach",
      text: "We open the Bible and teach whole passages, including the hard ones, in language people actually use.",
      verse: "Mark 16:15",
    },
    {
      icon: "book",
      title: "Teach",
      text: "We walk with people from their first question to a faith that survives a difficult year.",
      verse: "Matthew 28:19–20",
    },
    {
      icon: "people",
      title: "Gather",
      text: "We meet often and closely enough that people notice when a member is missing.",
      verse: "Acts 2:42",
    },
    {
      icon: "heart",
      title: "Help",
      text: "We feed the hungry, visit the sick, pay school fees, and turn up at the funerals.",
      verse: "Matthew 25:35–40",
    },
  ];
  return (
    <section className="bg-ebony text-parchment">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 md:py-20">
        <div className="grid gap-7 lg:grid-cols-[0.7fr_1.5fr] lg:gap-12">
          <Kicker light className={aboutKicker}>
            What we do week by week
          </Kicker>
          <div>
            <Reveal>
              <p className="font-display text-base font-bold leading-snug text-parchment sm:text-lg">
                Our week is built on four simple things: preach, teach, gather, and help. Nothing
                complicated, just <em className="font-normal text-gold-2">steady.</em>
              </p>
            </Reveal>
            <div className="mt-12 grid gap-px border border-parchment/15 bg-parchment/15 sm:grid-cols-2">
              {points.map((p, i) => (
                <Reveal key={p.title} delay={(i % 2) * 80} className="bg-ebony">
                  <article className="group h-full bg-ebony p-7 transition-colors duration-300 hover:bg-ebony-3">
                    <Icon name={p.icon} className="h-7 w-7 text-gold-2" />
                    <h3 className="mt-5 font-display text-xl font-bold">{p.title}</h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-sand">{p.text}</p>
                    <p className="mt-4 text-[0.68rem] font-bold uppercase tracking-[0.24em] text-gold/70">{p.verse}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Objectives() {
  return (
    <section className="bg-parchment-2">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 md:py-20">
        <SectionTitle
          kickerClassName={aboutKicker}
          kicker="Our objectives"
          title={<>Five goals we keep <span className="italic text-gold-deep">coming back to.</span></>}
          lead="These are not just fine words for a brochure. They are the day-to-day reasons we gather, serve, give, and pray."
        />
        <div className="mt-12">
          {OBJECTIVES.map((o, i) => (
            <Reveal key={o.verse} delay={i * 70}>
              <div className="group grid gap-4 border-t border-ink/15 py-7 transition-colors duration-300 hover:bg-parchment sm:grid-cols-[70px_1fr_auto] sm:items-center sm:gap-8 sm:px-4">
                <span className="font-display text-4xl font-bold text-ink/20 transition-colors duration-300 group-hover:text-gold-deep">
                  0{i + 1}
                </span>
                <p className="max-w-3xl font-display text-lg italic leading-snug text-ink sm:text-xl">{o.text}</p>
                <span className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-gold-deep">{o.verse}</span>
              </div>
            </Reveal>
          ))}
          <div className="border-t border-b border-ink/15" />
        </div>
      </div>
    </section>
  );
}

function CoreValues() {
  return (
    <section className="bg-ebony text-parchment">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 md:py-20">
        <SectionTitle
          light
          center
          kickerClassName={aboutKicker}
          kicker="Our core values"
          title={<>Six values you'll <span className="italic text-gold-2">actually see around here.</span></>}
          lead="Values only matter if you can spot them. Watch for these in how people talk, serve, and treat one another."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {VALUES.map((v, i) => (
            <Reveal key={v.title} delay={(i % 3) * 80}>
              <article className="group h-full border-t-2 border-gold/50 bg-ebony-2 p-7 transition-colors duration-300 hover:border-gold-2 hover:bg-ebony-3 sm:p-8">
                <div className="flex items-center justify-between">
                  <Icon name={v.icon} className="h-7 w-7 text-gold-2" />
                  <span className="font-display text-sm font-bold text-parchment/30">0{i + 1}</span>
                </div>
                <h3 className="mt-5 font-display text-2xl font-bold">{v.title}</h3>
                <p className="mt-3 font-display text-[0.85rem] italic leading-relaxed text-gold-2">{v.verse}</p>
                <p className="mt-3.5 text-sm leading-relaxed text-sand">{v.text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatementOfFaith() {
  return (
    <section className="bg-parchment">
      <div className="mx-auto max-w-4xl px-5 py-14 sm:px-8 md:py-20">
        <SectionTitle
          center
          kickerClassName={aboutKicker}
          kicker="Statement of faith"
          title={<>What we believe, <span className="italic text-gold-deep">explained clearly.</span></>}
          lead="These eight points hold our church together. Each one is rooted in Scripture and written simply, so anyone can read, understand, and ask questions."
        />
        <div className="mt-10 space-y-6">
          {FAITH_STATEMENT.map((f, i) => (
            <Reveal key={f.head} delay={40}>
              <div className="grid gap-3 sm:grid-cols-[150px_1fr] sm:gap-8">
                <p className="text-[0.72rem] font-bold uppercase tracking-[0.26em] text-gold-deep">
                  <span className="mr-2 text-ink/30">{String(i + 1).padStart(2, "0")}</span>
                  {f.head}
                </p>
                <p className={`leading-relaxed text-stone ${i === 0 ? "dropcap" : ""}`}>{f.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={80}>
          <div className="mt-10 flex items-center justify-between gap-5 border-t border-ink/15 pt-6">
            <p className="font-display text-lg italic text-ink">— Shared with the church and open to your questions</p>
            <Icon name="cross" className="h-6 w-6 shrink-0 text-gold-deep" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Governance() {
  return (
    <section className="bg-parchment">
      <div className="mx-auto max-w-4xl px-5 pb-24 sm:px-8 md:pb-32">
        <Reveal>
          <div className="border-l-2 border-gold p-8">
            <Kicker className={aboutKicker}>How the church is run</Kicker>
            <p className="mt-5 leading-relaxed text-stone">
              We are an independent Pentecostal church, so there is no distant head office telling us
              what to do. The senior pastor and a council of elders make decisions openly, and anyone
              can ask questions about them. The accounts are read out to the whole church every quarter,
              because trust grows when people can see the truth for themselves.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default function About() {
  return (
    <>
      <PageHero
        image={IMG.groupPhoto}
        kicker="About"
        kickerClassName={aboutKicker}
        titleClassName="!text-[clamp(2.025rem,5.25vw,3.9rem)]"
        lines={["Who we are,", <span key="i" className="italic text-gold-2">in plain words.</span>]}
        lead="This page explains our vision, what we do each week, the goals we keep, and the values that guide us. It is written plainly, because a church should be easy to understand."
        meta={[
          { icon: "star", text: "A clear vision" },
          { icon: "flame", text: "Independent Pentecostal" },
          { icon: "book", text: "Open and accountable" },
        ]}
      />
      <Vision />
      <OurStory />
      <Mission />
      <Objectives />
      <CoreValues />
      <StatementOfFaith />
      <Governance />
      <CTABand
        quote="Thy word is a lamp unto my feet."
        cite="Psalm 119:105"
        title="That's us on paper."
        text="Paper only tells you so much. If any of it sounds like somewhere you'd like to belong, come and see whether we live up to it."
      />
    </>
  );
}
