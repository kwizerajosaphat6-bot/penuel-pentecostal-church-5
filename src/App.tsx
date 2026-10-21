import { Component, useEffect, useState, type ReactNode } from "react";
import { PROTECTED_ROUTES, ROUTES, navigate, usePath } from "./lib/router";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { LogoMark } from "./components/Icons";
import { isAuthenticated, auth } from "./services/management";

import Home from "./pages/Home";
import WhoWeAre from "./pages/WhoWeAre";
import OurWork from "./pages/OurWork";
import About from "./pages/About";
import Publications from "./pages/Publications";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import Records from "./pages/Database";

/* ---------- error boundary ------------------------------------------ */

class AppBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    /* Intentionally silent: no stack trace is exposed to the visitor
       and nothing is written to the browser console in production. */
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="flex min-h-svh flex-col items-center justify-center bg-ebony px-6 text-center text-parchment">
        <LogoMark className="h-12 w-12" />
        <p className="mt-8 text-[0.7rem] font-bold uppercase tracking-[0.34em] text-gold-2">
          Something broke
        </p>
        <h1 className="mt-4 font-display text-4xl font-bold sm:text-5xl">
          That&apos;s our fault, <span className="italic text-gold-2">not yours.</span>
        </h1>
        <p className="mt-6 max-w-md leading-relaxed text-sand">
          A refresh usually sorts it. If it keeps happening, please phone the
          church office.
        </p>
        <button
          type="button"
          className="btn btn-gold mt-9"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }
}

/* ---------- document titles ------------------------------------------ */

const TITLES: Record<string, string> = {
  [ROUTES.home]: "Pentecostal Penuel Church | Ruyenzi, Kamonyi — Rwanda",
  [ROUTES.who]: "Who We Are | Pentecostal Penuel Church",
  [ROUTES.work]: "Our Work | Pentecostal Penuel Church",
  [ROUTES.about]: "About | Pentecostal Penuel Church",
  [ROUTES.publications]: "Publications | Pentecostal Penuel Church",
  [ROUTES.contact]: "Contact | Pentecostal Penuel Church",
  [ROUTES.gate]: "Staff Sign In",
  [ROUTES.panel]: "Staff Area",
  [ROUTES.records]: "Records",
};

const DESCRIPTIONS: Record<string, string> = {
  [ROUTES.home]:
    "Pentecostal Penuel Church in Ruyenzi Sector, Kamonyi District, Rwanda. Founded in 1998. Everyone is welcome to worship, pray, and grow with us.",
  [ROUTES.who]:
    "Where the name Penuel comes from, how our church family grew since 1998, and exactly what we believe.",
  [ROUTES.work]:
    "The groups inside the church and the work beyond it — preaching the Gospel, prayer, worship, education, and community service.",
  [ROUTES.about]:
    "Our history since 1998, our vision, what we do each week, the goals we keep, and the values that guide Pentecostal Penuel Church.",
  [ROUTES.publications]:
    "Read the full details of our recent sermons, upcoming events, announcements, and media from Pentecostal Penuel Church.",
  [ROUTES.contact]:
    "Get in touch with Pentecostal Penuel Church. Service times, directions and a direct message form.",
};

const SITE = "https://penuelpentecostalchurch.org";

/** Keeps title, description, canonical and indexing rules in step. */
function useDocumentMeta(path: string) {
  useEffect(() => {
    document.title = TITLES[path] ?? "Pentecostal Penuel Church";

    const setTag = (selector: string, attr: string, value: string) => {
      const el = document.querySelector(selector);
      if (el) el.setAttribute(attr, value);
    };

    const isStaff = path.startsWith(ROUTES.panel);

    setTag(
      'meta[name="description"]',
      "content",
      DESCRIPTIONS[path] ?? DESCRIPTIONS[ROUTES.home]
    );
    setTag('link[rel="canonical"]', "href", `${SITE}${path === "/" ? "/" : path}`);
    // Staff screens must never be indexed.
    setTag(
      'meta[name="robots"]',
      "content",
      isStaff ? "noindex, nofollow" : "index, follow, max-image-preview:large"
    );
  }, [path]);
}

/* ---------- route guard ---------------------------------------------- */

function Guard({ path, children }: { path: string; children: ReactNode }) {
  const [checked, setChecked] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!isAuthenticated()) {
        navigate(ROUTES.gate);
        return;
      }
      // Re-validate the stored session before rendering a protected screen.
      const me = await auth.me();
      if (!active) return;
      if (!me) {
        navigate(ROUTES.gate);
        return;
      }
      setAllowed(true);
      setChecked(true);
    })();
    return () => {
      active = false;
    };
  }, [path]);

  if (!checked || !allowed) {
    return (
      <div className="flex min-h-[70svh] items-center justify-center bg-parchment-2">
        <p className="text-sm text-stone">Checking your session…</p>
      </div>
    );
  }
  return <>{children}</>;
}

/* ---------- router ---------------------------------------------------- */

function Page({ path }: { path: string }) {
  switch (path) {
    case ROUTES.home:
      return <Home />;
    case ROUTES.who:
      return <WhoWeAre />;
    case ROUTES.work:
      return <OurWork />;
    case ROUTES.about:
      return <About />;
    case ROUTES.publications:
      return <Publications />;
    case ROUTES.contact:
      return <Contact />;
    case ROUTES.gate:
      return <Login />;
    case ROUTES.panel:
      return (
        <Guard path={path}>
          <Admin />
        </Guard>
      );
    case ROUTES.records:
      return (
        <Guard path={path}>
          <Records />
        </Guard>
      );
    default:
      return <NotFound />;
  }
}

function Shell() {
  const path = usePath();
  useDocumentMeta(path);

  // Signal the inline preloader that the app has mounted and painted, so it
  // hands over to the real page immediately instead of waiting on images.
  useEffect(() => {
    const hide = (window as unknown as { __hidePreloader?: () => void }).__hidePreloader;
    hide?.();
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
    const target = sessionStorage.getItem("penuel-scroll-target");
    if (target) {
      sessionStorage.removeItem("penuel-scroll-target");
      window.setTimeout(
        () => document.getElementById(target)?.scrollIntoView({ behavior: "smooth" }),
        80
      );
    }
  }, [path]);

  // The public header and footer are hidden inside the staff area.
  const isStaff = PROTECTED_ROUTES.includes(path) || path === ROUTES.gate;

  return (
    <div className="min-h-svh bg-parchment">
      <a
        href="#main"
        className="fixed left-4 top-4 z-[100] -translate-y-24 bg-gold px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-ebony transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>
      {!isStaff && <Header path={path} />}
      <main id="main">
        <Page path={path} />
      </main>
      {!isStaff && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <AppBoundary>
      <Shell />
    </AppBoundary>
  );
}
