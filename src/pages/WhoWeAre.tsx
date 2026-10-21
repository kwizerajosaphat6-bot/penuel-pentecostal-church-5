import { Link, ROUTES } from "../lib/router";
import { Reveal } from "../lib/motion";
import { Icon } from "../components/Icons";
import { CTABand, PageHero, SectionTitle } from "../components/shared";
import { CHURCH, DOCTRINES, IMG, TIMELINE } from "../data/content";

const pageKicker = "!text-[1.4rem] !tracking-[0.12em] leading-tight";

function Vision() {
  return (
    <section className="bg-parchment">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 md:py-20">
        <div className="grid gap-7 lg:grid-cols-[0.65fr_1.35fr] lg:gap-12">
          <Reveal>
            <p className="text-[1.4rem] font-bold uppercase leading-tight tracking-[0.12em] text-gold-deep">Our vision</p>
          </Reveal>
          <div>
            <Reveal delay={80}>
              <h2 className="font-display text-2xl font-bold leading-[1.12] tracking-tight text-ink sm:text-3xl">
                {CHURCH.vision}
              </h2>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-6 max-w-3xl leading-relaxed text-stone">
                We want Penuel to feel like a doorway, not a wall. People come with joy, questions,
                grief, children, doubts, and thanksgiving. Our hope is that each person meets God in His
                presence, is changed by that meeting, and leaves carrying His blessing into every part of
                life.
              </p>
            </Reveal>
            <Reveal delay={240}>
              <p className="mt-4 max-w-3xl leading-relaxed text-stone">
                Genesis 32:20–32 is our heartbeat. Jacob wrestled through the night, met God, was given a
                new name, and would not let go until he was blessed. We pray that same encounter,
                transformation, and blessing for every soul who walks through our doors — in their
                spiritual and physical lives alike.
              </p>
            </Reveal>
            <Reveal delay={320}>
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

function TheName() {
  return (
    <section className="bg-parchment">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 md:py-20">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="order-2 lg:order-1">
            <Reveal>
              <div className="relative">
                <div className="absolute -bottom-4 -right-4 h-full w-full border border-gold-deep/40" aria-hidden="true" />
                <img
                  src={IMG.churchBuilding}
                  alt="Pentecostal Penuel Church in Ruyenzi, Kamonyi District"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    const img = e.currentTarget;
                    if (!img.dataset.fellBack) {
                      img.dataset.fellBack = "1";
                      img.src = "/images/church-building.jpg";
                    }
                  }}
                  className="relative aspect-[4/3] w-full object-contain bg-ebony/5"
                />
              </div>
            </Reveal>
          </div>
          <div className="order-1 lg:order-2">
            <SectionTitle
              kickerClassName={pageKicker}
              titleClassName="!text-2xl sm:!text-3xl"
              kicker="Why we're called Penuel"
              title={<>A name that reminds us <span className="italic text-gold-deep">God still meets people.</span></>}
            />
            <Reveal delay={160}>
              <p className="mt-6 leading-relaxed text-stone">
                Penuel comes from the story of Jacob in Genesis 32:20–32. He was afraid, alone, and
                facing a painful tomorrow. Through the night he met God, held on, and refused to let go
                until he was blessed. He left the place transformed — with a new name and a new walk.
              </p>
            </Reveal>
            <Reveal delay={240}>
              <p className="mt-4 leading-relaxed text-stone">
                That is the kind of church we want to be: a place where people meet God in His presence,
                are changed by that meeting, and receive His blessing for both their spiritual and
                physical lives. Some come ready to sing; others come barely holding together. Both
                belong here.
              </p>
            </Reveal>
            <Reveal delay={320}>
              <blockquote className="mt-8 border-l-2 border-gold pl-5">
                <p className="font-display text-lg italic leading-snug text-ink">
                  “And he said, I will not let thee go, except thou bless me… And he called the name of
                  the place Peniel: for I have seen God face to face, and my life is preserved.”
                </p>
                <cite className="mt-2 block text-[0.7rem] font-semibold uppercase not-italic tracking-[0.24em] text-gold-deep">
                  Genesis 32:20–32 (KJV)
                </cite>
              </blockquote>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

function Timeline() {
  return (
    <section className="bg-ebony text-parchment">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 md:py-20">
        <SectionTitle
          light
          kickerClassName={pageKicker}
          kicker="How we got here"
          titleClassName="!text-lg sm:!text-2xl"
          title={<>A small beginning, <span className="italic text-gold-2">and a faithful God.</span></>}
          lead="Our story is not polished or perfect. It is a record of ordinary people praying, giving, learning, making room, and watching God do more than we expected."
        />
        <div className="relative mt-10">
          <span className="absolute left-[7px] top-2 bottom-2 w-px bg-gold/30 md:left-1/2" aria-hidden="true" />
          <div className="space-y-12 md:space-y-16">
            {TIMELINE.map((t, i) => (
              <Reveal key={t.year} delay={60}>
                <div
                  className={`relative grid gap-4 pl-10 md:grid-cols-2 md:gap-10 md:pl-0 ${
                    i % 2 === 1 ? "md:[&>div:first-child]:order-2" : ""
                  }`}
                >
                  <span
                    className="absolute left-0 top-2 h-[15px] w-[15px] border-2 border-gold bg-ebony md:left-1/2 md:-translate-x-1/2"
                    aria-hidden="true"
                  />
                  <div className={i % 2 === 0 ? "md:text-right" : ""}>
                    <p className="font-display text-2xl font-bold text-gold-2 sm:text-3xl">{t.year}</p>
                    <h3 className="mt-3 font-display text-2xl font-bold">{t.title}</h3>
                  </div>
                  <div className={i % 2 === 0 ? "md:pl-0" : "md:text-right"}>
                    <p className="max-w-md leading-relaxed text-sand md:inline">{t.text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Beliefs() {
  return (
    <section id="beliefs" className="bg-ebony text-parchment">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 md:py-20">
        <SectionTitle
          light
          center
          kickerClassName={pageKicker}
          kicker="What we believe"
          title={<>The faith we teach, <span className="italic text-gold-2">preach, and try to live.</span></>}
          lead="These beliefs are not decoration for a website. They shape how we worship, how we pray, how we care for families, and how we speak about Jesus. Each one is rooted in Scripture and held with humility."
        />
        <div className="mt-10 grid gap-px border border-parchment/15 bg-parchment/15 md:grid-cols-2 lg:grid-cols-3">
          {DOCTRINES.map((d, i) => (
            <Reveal key={d.title} delay={(i % 3) * 70} className="bg-ebony">
              <article className="group flex h-full flex-col bg-ebony p-7 transition-colors duration-300 hover:bg-ebony-3 sm:p-8">
                <div className="flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center border border-gold/40 text-gold-2 transition-colors duration-300 group-hover:bg-gold group-hover:text-ebony">
                    <Icon name={d.icon} className="h-5 w-5" />
                  </span>
                  <span className="font-display text-4xl font-bold text-parchment/10 transition-colors duration-300 group-hover:text-gold/40">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="mt-6 font-display text-xl font-bold">{d.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-sand">{d.text}</p>
                <p className="mt-5 border-t border-parchment/15 pt-4 font-display text-[0.82rem] italic leading-relaxed text-gold-2">
                  {d.verse}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
        <Reveal delay={120}>
          <p className="mt-10 text-center text-sm leading-relaxed text-sand">
            The longer version, with all the references written out, is on the{" "}
            <Link to={ROUTES.about} className="font-semibold text-gold-2 underline decoration-gold/50 underline-offset-4 hover:text-parchment">
              About
            </Link>{" "}
            page.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

export default function WhoWeAre() {
  return (
    <>
      <PageHero
        image={IMG.worshipGathering}
        kicker="Who We Are"
        lines={["A church family", <span key="i" className="italic text-gold-2">with room for you.</span>]}
        lead="Penuel is a place of worship, prayer, Scripture, and practical love. We are Pentecostal, family-minded, and still learning how to follow Jesus well together."
        meta={[
          { icon: "star", text: "A praying church" },
          { icon: "home", text: "A welcoming family" },
          { icon: "dove", text: "Led by the Holy Spirit" },
        ]}
      />
      <Vision />
      <TheName />
      <Timeline />
      <Beliefs />
      <CTABand
        quote="I am the vine, ye are the branches."
        cite="John 15:5"
        title="Come and meet the family."
        text="You do not have to understand everything before you visit. Come once, sit where you like, and let the service speak for itself."
      />
    </>
  );
}
