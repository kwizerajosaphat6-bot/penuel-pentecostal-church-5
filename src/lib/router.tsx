import { useEffect, useState, type AnchorHTMLAttributes, type ReactNode } from "react";

/**
 * Application routes.
 * ------------------------------------------------------------------
 * The staff area sits under an unobvious prefix so it does not appear in
 * crawlers, wordlists or casual guessing.
 *
 * IMPORTANT: this is cosmetic only. A single-page app ships all of its
 * routes to the browser, so anyone reading the bundle can find these
 * strings. The real protection is that every staff screen requires a
 * valid, server-issued token and every API call is authorised on the
 * server. Never treat the path itself as a secret.
 */
const STAFF_ROOT = "/office-7f3a91";

export const ROUTES = {
  home: "/",
  who: "/who-we-are",
  work: "/our-work",
  about: "/about",
  publications: "/publications",
  contact: "/contact",

  // staff area
  gate: `${STAFF_ROOT}/sign-in`,
  panel: STAFF_ROOT,
  records: `${STAFF_ROOT}/records`,
} as const;

/** Routes that must never render without an authenticated session. */
export const PROTECTED_ROUTES: string[] = [ROUTES.panel, ROUTES.records];

export function normalizePath(raw: string): string {
  let p = raw.replace(/^#/, "");
  if (!p.startsWith("/")) p = "/" + p;
  // Collapse traversal attempts and duplicate slashes.
  p = p.replace(/\/{2,}/g, "/").replace(/\/\.\.(?=\/|$)/g, "");
  if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
  return p === "" ? "/" : p;
}

export function usePath(): string {
  const [path, setPath] = useState(() => normalizePath(window.location.hash));
  useEffect(() => {
    const onChange = () => setPath(normalizePath(window.location.hash));
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return path;
}

export function navigate(to: string) {
  window.location.hash = to;
}

interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  to: string;
  children: ReactNode;
}

export function Link({ to, children, ...rest }: LinkProps) {
  // Only ever produce in-app hash links; external URLs cannot be injected.
  const safe = to.startsWith("/") ? to : "/";
  return (
    <a href={`#${safe}`} {...rest}>
      {children}
    </a>
  );
}
