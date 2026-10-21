import { Link, ROUTES } from "../lib/router";
import { LogoMark } from "../components/Icons";

export default function NotFound() {
  return (
    <section className="flex min-h-[80svh] items-center bg-ebony text-parchment">
      <div className="mx-auto max-w-3xl px-5 py-16 text-center sm:px-8 md:py-20">
        <LogoMark className="mx-auto h-12 w-12" />
        <p className="mt-8 text-[0.7rem] font-bold uppercase tracking-[0.34em] text-gold-2">
          Page not found
        </p>
        <h1 className="mt-5 font-display text-[clamp(2.8rem,8vw,5rem)] font-bold leading-none tracking-tight">
          This page has <span className="italic text-gold-2">wandered off.</span>
        </h1>
        <p className="mx-auto mt-7 max-w-md leading-relaxed text-sand">
          Either the link was mistyped or we moved something and forgot to say so. Sorry about that —
          here are two doors that definitely work.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link to={ROUTES.home} className="btn btn-gold">
            Back Home
          </Link>
          <Link to={ROUTES.contact} className="btn btn-ghost">
            Contact Us
          </Link>
        </div>
      </div>
    </section>
  );
}
