import { useState, type FormEvent } from "react";
import { cn } from "../utils/cn";
import { Reveal } from "../lib/motion";
import { Icon } from "../components/Icons";
import { Kicker, PageHero, SectionTitle } from "../components/shared";
import { CHURCH, FAQS, IMG } from "../data/content";
import { messages as messagesApi } from "../services/management";

/* ---------------- form ---------------- */

type FormData = { name: string; email: string; subject: string; message: string; company: string };
const EMPTY: FormData = { name: "", email: "", subject: "Plan a visit", message: "", company: "" };
const SUBJECTS = [
  "Plan a visit",
  "Prayer request",
  "Giving & stewardship",
  "Outreach & serving",
  "Schools & education",
  "Something else",
];

function genRef() {
  return `PNC-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

const inputCls =
  "w-full border border-ink/20 bg-[#fdfbf7] px-4 py-3.5 text-[0.92rem] text-ink placeholder:text-ink/35 transition-colors duration-300 focus:border-gold-deep focus:outline-none";

function ContactForm() {
  const [form, setForm] = useState<FormData>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [refCode, setRefCode] = useState("");

  const set = (k: keyof FormData) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (form.company) {
      // silent bot trap — pretend success, send nothing
      setRefCode(genRef());
      setStatus("done");
      return;
    }
    const errs: typeof errors = {};
    if (form.name.trim().length < 2) errs.name = "Please tell us your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim()))
      errs.email = "That email does not look complete.";
    if (form.message.trim().length < 10) errs.message = "A few more words will help us serve you well.";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setStatus("sending");
    try {
      // Delivered into the church's management inbox, where staff can read
      // and reply. Fields are validated and length-capped on submission.
      const result = await messagesApi.submit({
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject,
        message: form.message.trim(),
      });
      setRefCode(result?.reference || genRef());
      setStatus("done");
    } catch (err) {
      setErrors({
        message:
          err instanceof Error
            ? err.message
            : "We could not send that just now. Please try again shortly.",
      });
      setStatus("idle");
    }
  }

  if (status === "done") {
    return (
      <div className="border border-gold-deep/40 bg-parchment p-8 sm:p-10">
        <span className="flex h-14 w-14 items-center justify-center border border-gold-deep/50 text-gold-deep">
          <Icon name="check" className="h-7 w-7" />
        </span>
        <h3 className="mt-6 font-display text-3xl font-bold">That's arrived. Thank you.</h3>
        <p className="mt-4 max-w-md leading-relaxed text-stone">
          Thanks, {form.name.trim().split(" ")[0] || "friend"}. Someone from the pastoral team will
          write back within two working days — sooner if it's urgent. Here's a reference in case you
          need to chase us:
        </p>
        <p className="mt-5 inline-block border border-ink/15 bg-parchment-2 px-5 py-3 font-mono text-sm font-bold tracking-[0.2em] text-ink">
          {refCode}
        </p>
        <p className="mt-6 flex items-start gap-2.5 text-[0.8rem] leading-relaxed text-stone">
          <Icon name="shield" className="mt-0.5 h-4 w-4 shrink-0 text-gold-deep" />
          Kept private. This page has no trackers, and what you wrote goes to our pastoral team and
          nobody else.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="border border-ink/15 bg-parchment-2/50 p-7 sm:p-9">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="cf-name" className="mb-2 block text-[0.68rem] font-bold uppercase tracking-[0.24em] text-stone">
            Your name
          </label>
          <input
            id="cf-name"
            type="text"
            autoComplete="name"
            value={form.name}
            onChange={(e) => set("name")(e.target.value)}
            className={cn(inputCls, errors.name && "border-oxblood")}
            placeholder="e.g. Esther Wambui"
          />
          {errors.name && <p className="mt-2 text-[0.75rem] font-medium text-oxblood">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="cf-email" className="mb-2 block text-[0.68rem] font-bold uppercase tracking-[0.24em] text-stone">
            Email
          </label>
          <input
            id="cf-email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => set("email")(e.target.value)}
            className={cn(inputCls, errors.email && "border-oxblood")}
            placeholder="you@example.com"
          />
          {errors.email && <p className="mt-2 text-[0.75rem] font-medium text-oxblood">{errors.email}</p>}
        </div>
      </div>

      <div className="mt-5">
        <label htmlFor="cf-subject" className="mb-2 block text-[0.68rem] font-bold uppercase tracking-[0.24em] text-stone">
          Reason for reaching out
        </label>
        <div className="relative">
          <select
            id="cf-subject"
            value={form.subject}
            onChange={(e) => set("subject")(e.target.value)}
            className={cn(inputCls, "appearance-none pr-10")}
          >
            {SUBJECTS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <svg
            viewBox="0 0 24 24"
            className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gold-deep"
            aria-hidden="true"
          >
            <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      <div className="mt-5">
          <label htmlFor="cf-message" className="mb-2 block text-[0.68rem] font-bold uppercase tracking-[0.24em] text-stone">
          What would you like to say?
        </label>
        <textarea
          id="cf-message"
          rows={5}
          value={form.message}
          onChange={(e) => set("message")(e.target.value)}
          className={cn(inputCls, "resize-y", errors.message && "border-oxblood")}
          placeholder="However you'd say it out loud is fine. A sentence is enough."
        />
        {errors.message && <p className="mt-2 text-[0.75rem] font-medium text-oxblood">{errors.message}</p>}
      </div>

      {/* silent bot trap */}
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor="cf-company">Company</label>
        <input
          id="cf-company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={form.company}
          onChange={(e) => set("company")(e.target.value)}
        />
      </div>

      <div className="mt-7 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <button type="submit" className="btn btn-gold min-w-[210px] disabled:opacity-60" disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Send Message"}
          <Icon name="arrow" className="h-4 w-4" />
        </button>
        <p className="flex items-start gap-2.5 text-[0.75rem] leading-relaxed text-stone sm:max-w-[240px]">
          <Icon name="shield" className="mt-0.5 h-4 w-4 shrink-0 text-gold-deep" />
          Sent encrypted. Nothing here tracks you, and only our pastoral team reads it.
        </p>
      </div>
    </form>
  );
}

/* ---------------- FAQ ---------------- */

function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <div>
      {FAQS.map((f, i) => {
        const isOpen = open === i;
        return (
          <Reveal key={f.q} delay={i * 60}>
            <div className="border-t border-parchment/15 last:border-b">
              <button
                type="button"
                className="group flex w-full items-center justify-between gap-6 py-6 text-left"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? -1 : i)}
              >
                <span
                  className={cn(
                    "font-display text-lg font-semibold transition-colors duration-300 sm:text-xl",
                    isOpen ? "text-gold-2" : "text-parchment group-hover:text-gold-2"
                  )}
                >
                  <span className="mr-4 font-body text-[0.65rem] font-bold tracking-[0.3em] text-gold/70">
                    0{i + 1}
                  </span>
                  {f.q}
                </span>
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center border transition-all duration-500",
                    isOpen ? "rotate-45 border-gold-2 bg-gold-2 text-ebony" : "border-parchment/30 text-parchment/70"
                  )}
                >
                  <Icon name="plus" className="h-4 w-4" />
                </span>
              </button>
              <div className={cn("acc-body", isOpen && "open")}>
                <div className="acc-inner">
                  <p className="max-w-2xl pb-7 pl-10 text-sm leading-relaxed text-sand sm:pr-16">{f.a}</p>
                </div>
              </div>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}

/* ---------------- page ---------------- */

const HOURS = [
  { d: "Sunday", t: "8:00 AM – 5:00 PM" },
  { d: "Saturday", t: "8:00 AM – 5:00 PM" },
  { d: "Office, Mon – Fri", t: "9:00 AM – 4:30 PM" },
];

export default function Contact() {
  return (
    <>
      <PageHero
        image={IMG.churchBuilding}
        kicker="Contact"
        kickerClassName="!text-[1.4rem] !tracking-[0.12em] leading-tight"
        titleClassName="!text-[clamp(1.35rem,3.5vw,2.6rem)]"
        lines={["Ask us", <span key="i" className="italic text-gold-2">anything.</span>]}
        lead="Have a question, a prayer request, or just want to say hello? Send us a message and someone will reply personally. It's simple, free, and your details stay with us."
        meta={[
          { icon: "pin", text: CHURCH.address },
          { icon: "phone", text: CHURCH.phone },
          { icon: "mail", text: CHURCH.email },
        ]}
      />

      {/* main grid */}
      <section className="bg-parchment">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 md:py-20">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10">
            <div>
              <Kicker className="!text-[1.4rem] !tracking-[0.12em] leading-tight">How to reach us</Kicker>
              <div className="mt-7 space-y-5">
                {[
                  { icon: "pin", head: "Address", body: CHURCH.address },
                  { icon: "phone", head: "Phone", body: `${CHURCH.phone} — office and pastoral line` },
                  { icon: "mail", head: "Email", body: `${CHURCH.email} · Prayer: ${CHURCH.prayerEmail}` },
                ].map((c) => (
                  <Reveal key={c.head}>
                    <div className="flex gap-4 border border-ink/15 bg-parchment-2/50 p-5">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center border border-gold-deep/40 text-gold-deep">
                        <Icon name={c.icon} className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-[0.68rem] font-bold uppercase tracking-[0.24em] text-stone">{c.head}</p>
                        <p className="mt-1.5 text-sm leading-relaxed text-ink">{c.body}</p>
                      </div>
                    </div>
                  </Reveal>
                ))}
                <Reveal>
                  <div className="border border-ink/15 bg-parchment-2/50 p-5">
                    <p className="flex items-center gap-2.5 text-[0.68rem] font-bold uppercase tracking-[0.24em] text-stone">
                      <Icon name="clock" className="h-4 w-4 text-gold-deep" /> When we're open
                    </p>
                    <ul className="mt-4 space-y-2.5">
                      {HOURS.map((h) => (
                        <li key={h.d} className="flex items-baseline justify-between gap-4 text-sm">
                          <span className="font-semibold text-ink">{h.d}</span>
                          <span className="text-stone">{h.t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              </div>
            </div>

            <Reveal delay={150}>
              <ContactForm />
            </Reveal>
          </div>

        </div>
      </section>

      {/* FAQ */}
      <section className="bg-ebony text-parchment">
        <div className="mx-auto max-w-5xl px-5 py-14 sm:px-8 md:py-20">
          <SectionTitle
            light
            center
            kicker="Common questions"
            titleClassName="!text-lg sm:!text-2xl"
            title={
              <>
                The things people are <span className="italic text-gold-2">too polite to ask.</span>
              </>
            }
            lead="Straight answers to the six we get asked most. If yours isn't here, just send it over."
          />
          <div className="mt-10">
            <Faq />
          </div>
        </div>
      </section>
    </>
  );
}
