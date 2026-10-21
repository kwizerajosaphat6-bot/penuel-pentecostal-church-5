import { Link, ROUTES } from "../lib/router";
import { Icon, LogoMark } from "./Icons";
import { CHURCH } from "../data/content";

export function Footer() {
  return (
    <footer className="bg-ebony text-parchment">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <LogoMark className="h-10 w-10" />
            <span className="leading-none">
              <span className="block font-display text-xl font-bold tracking-[0.08em]">PENUEL</span>
              <span className="mt-1 block text-[0.56rem] font-semibold uppercase tracking-[0.38em] text-gold-2">
                Pentecostal Church
              </span>
            </span>
          </div>

          <div className="grid gap-3 text-sm text-parchment/80 sm:grid-cols-3 md:max-w-3xl">
            <p className="flex gap-2.5">
              <Icon name="pin" className="mt-0.5 h-4 w-4 shrink-0 text-gold-2" />
              <span>{CHURCH.address}</span>
            </p>
            <p className="flex gap-2.5">
              <Icon name="phone" className="mt-0.5 h-4 w-4 shrink-0 text-gold-2" />
              <span>{CHURCH.phone}</span>
            </p>
            <p className="flex gap-2.5">
              <Icon name="mail" className="mt-0.5 h-4 w-4 shrink-0 text-gold-2" />
              <span>{CHURCH.email}</span>
            </p>
          </div>

          <Link to={ROUTES.contact} className="btn btn-ghost !px-5 !py-2.5 !text-[0.68rem]">
            Get in touch
          </Link>
        </div>

        <div className="mt-7 flex flex-col items-start justify-between gap-4 border-t border-parchment/10 pt-5 sm:flex-row sm:items-center">
          <p className="text-[0.72rem] tracking-wide text-parchment/50">
            © {new Date().getFullYear()} {CHURCH.name}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to={ROUTES.gate}
              className="inline-flex items-center gap-2 border border-parchment/20 px-4 py-2 text-[0.68rem] font-bold uppercase tracking-[0.22em] text-parchment/70 transition-colors duration-300 hover:border-gold-2 hover:text-gold-2"
            >
              <Icon name="shield" className="h-3.5 w-3.5" />
              Admin Portal Login
            </Link>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="text-[0.7rem] font-bold uppercase tracking-[0.22em] text-parchment/60 transition-colors duration-300 hover:text-gold-2"
            >
              Back to top
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}