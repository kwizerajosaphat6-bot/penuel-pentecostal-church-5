import { useEffect, useState } from "react";
import { cn } from "../utils/cn";
import { Link, ROUTES } from "../lib/router";
import { LogoMark } from "./Icons";
import { CHURCH } from "../data/content";

const NAV = [
  { to: ROUTES.home, label: "Home" },
  { to: ROUTES.who, label: "Who We Are" },
  { to: ROUTES.work, label: "Our Work" },
  { to: ROUTES.about, label: "About" },
  { to: ROUTES.publications, label: "Publications" },
  { to: ROUTES.contact, label: "Contact" },
];

export function Header({ path }: { path: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [path]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* announcement bar */}
      <div className="relative z-50 bg-oxblood text-parchment">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-2 sm:px-8">
          <p className="flex items-center gap-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.22em]">
            <span className="candle inline-block h-1.5 w-1.5 rounded-full bg-gold-2" aria-hidden="true" />
            Sunday worship · 9:00 AM – 12:00 PM · everyone welcome
          </p>
          <p className="hidden text-[0.7rem] font-medium tracking-[0.14em] text-parchment/75 lg:block">
            {CHURCH.phone} · {CHURCH.email}
          </p>
        </div>
      </div>

      {/* main nav */}
      <header
        className={cn(
          "sticky top-0 z-50 border-b bg-ebony text-parchment transition-all duration-500",
          scrolled ? "border-gold/30 shadow-[0_18px_40px_-24px_rgba(0,0,0,0.8)]" : "border-transparent"
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-4 sm:px-8">
          <Link to={ROUTES.home} className="group flex shrink-0 items-center gap-3" aria-label="Pentecostal Penuel Church — home">
            <LogoMark className="h-10 w-10 transition-transform duration-300 group-hover:scale-105" />
            <span className="leading-none">
              <span className="block font-display text-xl font-bold tracking-[0.08em]">PENUEL</span>
              <span className="mt-1 block text-[0.56rem] font-semibold uppercase tracking-[0.42em] text-gold-2">
                Pentecostal Church
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-6 lg:flex xl:gap-8" aria-label="Primary">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "link-draw whitespace-nowrap text-[0.75rem] font-semibold uppercase tracking-[0.16em] transition-colors duration-300 xl:text-[0.78rem] xl:tracking-[0.18em]",
                  path === n.to ? "active text-gold-2" : "text-parchment/80 hover:text-parchment"
                )}
              >
                {n.label}
              </Link>
            ))}
            <Link to={ROUTES.contact} className="btn btn-gold shrink-0 !px-5 !py-2.5 !text-[0.7rem]">
              Visit Us
            </Link>
          </nav>

          {/* mobile toggle */}
          <button
            type="button"
            className="relative -mr-2 flex h-11 w-11 items-center justify-center lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span
              className={cn(
                "absolute h-px w-6 bg-parchment transition-all duration-400",
                open ? "rotate-45" : "-translate-y-[5px]"
              )}
            />
            <span
              className={cn(
                "absolute h-px w-6 bg-parchment transition-all duration-400",
                open ? "-rotate-45" : "translate-y-[5px]"
              )}
            />
          </button>
        </div>
      </header>

      {/* mobile overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 flex flex-col bg-ebony pt-24 text-parchment transition-opacity duration-400 lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        aria-hidden={!open}
      >
        <nav className="flex flex-1 flex-col justify-center gap-2 px-8" aria-label="Mobile">
          {NAV.map((n, i) => (
            <Link
              key={n.to}
              to={n.to}
              className={cn(
                "border-b border-parchment/10 py-3 font-display text-lg transition-all duration-500",
                path === n.to ? "text-gold-2" : "text-parchment",
                open ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
              )}
              style={{ transitionDelay: open ? `${120 + i * 70}ms` : "0ms" }}
            >
              <span className="mr-4 font-body text-[0.65rem] font-semibold tracking-[0.3em] text-gold/70">
                0{i + 1}
              </span>
              {n.label}
            </Link>
          ))}
          <Link to={ROUTES.contact} className="btn btn-gold mt-8 w-max !text-[0.75rem]">
            Visit Us
          </Link>
        </nav>
        <div className="px-8 pb-10 text-[0.72rem] leading-relaxed text-sand">
          <p className="font-semibold uppercase tracking-[0.26em] text-gold-2">This Sunday</p>
          <p className="mt-2">Sun 9:00 AM Worship · Sun 2:00 PM Youth · Sat 9:00 AM Prayer</p>
          <p className="mt-1">{CHURCH.address}</p>
        </div>
      </div>
    </>
  );
}
