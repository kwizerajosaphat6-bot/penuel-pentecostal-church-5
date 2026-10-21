import { useState, type ReactNode } from "react";
import { cn } from "../utils/cn";

const paths: Record<string, ReactNode> = {
  cross: (
    <>
      <path d="M12 4v16" />
      <path d="M7 9.5h10" />
    </>
  ),
  flame: (
    <>
      <path d="M12 3c2.2 3.4-3.4 5-3.4 9a3.4 3.4 0 0 0 6.8 0c0-1.6-.7-2.7-1.5-3.5C13.2 7.2 12.4 5.4 12 3z" />
      <path d="M6.5 21h11" />
      <path d="M8.5 18.5c.8 1 2 1.6 3.5 1.6s2.7-.6 3.5-1.6" />
    </>
  ),
  book: (
    <>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15.5H6.5A2.5 2.5 0 0 0 4 21z" />
      <path d="M4 18.5A2.5 2.5 0 0 1 6.5 16H20" />
      <path d="M12 7.5h4.5" />
    </>
  ),
  dove: (
    <>
      <path d="M20.5 4.5c-4.6.7-7.7 2.7-9.4 5.7L3 13.4l6.5.9.9 6.7 2.3-7c3.2-1.1 5.8-3.6 7.8-9.5z" />
      <path d="M15.5 10.5c1.2.3 2.4.3 3.6 0" />
    </>
  ),
  heart: (
    <path d="M12 20.5c-5.2-3.4-8.5-6.4-8.5-10A4.6 4.6 0 0 1 8 5.8c1.7 0 3.1.9 4 2.3.9-1.4 2.3-2.3 4-2.3a4.6 4.6 0 0 1 4.5 4.7c0 3.6-3.3 6.6-8.5 10z" />
  ),
  hands: (
    <>
      <path d="M7.2 20.5c-2.2-3-3-6.3-1-9.4l2-3.1 2 2.1v5.6a3.2 3.2 0 0 1-3 4.8z" />
      <path d="M16.8 20.5c2.2-3 3-6.3 1-9.4l-2-3.1-2 2.1v5.6a3.2 3.2 0 0 0 3 4.8z" />
    </>
  ),
  people: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19.5a5.5 5.5 0 0 1 11 0" />
      <circle cx="16.8" cy="9.5" r="2.4" />
      <path d="M15.8 14.6a4.8 4.8 0 0 1 4.7 4.9" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="3.6" />
      <path d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2M6 6l1.4 1.4M16.6 16.6 18 18M18 6l-1.4 1.4M7.4 16.6 6 18" />
    </>
  ),
  star: <path d="M12 3l1.9 6.4L20 12l-6.1 2.6L12 21l-1.9-6.4L4 12l6.1-2.6z" />,
  leaf: (
    <>
      <path d="M5 19C6.2 9.5 12.5 5 20 4.2 19 12.5 15 18.2 6.5 19.2z" />
      <path d="M5 19c3-5 7-9 11.5-11.5" />
    </>
  ),
  note: (
    <>
      <path d="M9 18V5.5L19 3v12.5" />
      <circle cx="6.8" cy="18" r="2.2" />
      <circle cx="16.8" cy="15.5" r="2.2" />
    </>
  ),
  radio: (
    <>
      <circle cx="12" cy="12" r="2" />
      <path d="M8 8a5.7 5.7 0 0 0 0 8M16 8a5.7 5.7 0 0 1 0 8" />
      <path d="M5.2 5.2a9.8 9.8 0 0 0 0 13.6M18.8 5.2a9.8 9.8 0 0 1 0 13.6" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17" />
      <path d="M12 3.5c2.4 2.3 3.6 5.2 3.6 8.5s-1.2 6.2-3.6 8.5c-2.4-2.3-3.6-5.2-3.6-8.5s1.2-6.2 3.6-8.5z" />
    </>
  ),
  gift: (
    <>
      <rect x="4" y="10.5" width="16" height="9.5" />
      <path d="M4 10.5h16M12 10.5V20" />
      <path d="M12 10.5c-2.8 0-4-1.7-4-3.2C8 5.7 9.3 5 10.4 5.5c1 .5 1.6 2.1 1.6 5zM12 10.5c2.8 0 4-1.7 4-3.2C16 5.7 14.7 5 13.6 5.5c-1 .5-1.6 2.1-1.6 5z" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l7 2.8v6c0 4.4-2.9 7.4-7 9.2-4.1-1.8-7-4.8-7-9.2v-6z" />
      <path d="M9 12l2 2 4-4.5" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s-6.5-5.6-6.5-10.3a6.5 6.5 0 0 1 13 0C18.5 15.4 12 21 12 21z" />
      <circle cx="12" cy="10.5" r="2.2" />
    </>
  ),
  phone: (
    <path d="M5.5 4h3.4L10.4 8l-2 1.6a12.8 12.8 0 0 0 6 6L16 13.6l4 1.5v3.4a1.9 1.9 0 0 1-2 1.9A16.4 16.4 0 0 1 3.6 6a1.9 1.9 0 0 1 1.9-2z" />
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="1.5" />
      <path d="M3.5 7l8.5 6 8.5-6" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v5.2l3.4 2" />
    </>
  ),
  arrow: (
    <>
      <path d="M4 12h15" />
      <path d="M13 5.5 19.5 12 13 18.5" />
    </>
  ),
  check: <path d="M4.5 12.5l5 5L19.5 6.5" />,
  plus: <path d="M12 5v14M5 12h14" />,
  home: (
    <>
      <path d="M4 11l8-7 8 7" />
      <path d="M6.5 9.5V20h11V9.5" />
      <path d="M10.5 20v-5h3v5" />
    </>
  ),
  jar: (
    <>
      <path d="M8 3.5h8M8.5 3.5c0 2-.5 3-2 4.2C5 9.2 4.5 11 4.5 13.2 4.5 17.5 7.5 20.5 12 20.5s7.5-3 7.5-7.3c0-2.2-.5-4-2-5.5-1.5-1.2-2-2.2-2-4.2" />
      <path d="M8 12.5c2.7 1.3 5.3 1.3 8 0" />
    </>
  ),
  eye: (
    <>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  eyeOff: (
    <>
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </>
  ),
};

export type IconName = keyof typeof paths;

export function Icon({
  name,
  className,
  strokeWidth = 1.5,
}: {
  name: string;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn("h-6 w-6", className)}
    >
      {paths[name] ?? paths.cross}
    </svg>
  );
}

export function LogoMark({
  className,
  alt = "Pentecostal Penuel Church Logo",
}: {
  className?: string;
  alt?: string;
}) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <svg viewBox="0 0 44 44" aria-hidden="true" className={cn("h-10 w-10 shrink-0", className)}>
        <circle cx="22" cy="22" r="20" fill="none" stroke="currentColor" strokeWidth="1.4" opacity="0.5" />
        <path d="M22 15v17M15 21.5h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path
          d="M22 4.5c1.8 2.7-1.5 3.4-1.5 5.4a1.5 1.5 0 0 0 3 0c0-2-3.3-2.7-1.5-5.4z"
          fill="var(--color-gold)"
          stroke="none"
        />
      </svg>
    );
  }

  return (
    <img
      src="https://res.cloudinary.com/z2vslzvr/image/upload/f_auto,q_auto,w_128/v1789970157/penuel_logo_transparent.png"
      alt={alt}
      loading="eager"
      decoding="async"
      onError={() => setError(true)}
      className={cn("h-10 w-10 shrink-0 object-contain", className)}
    />
  );
}
