"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import ThemeToggle from "./ThemeToggle";

const LINKS = [
  { href: "/", label: "Overview" },
  { href: "/catalog", label: "Catalog" },
  { href: "/playbook", label: "Playbook" },
  { href: "/agents", label: "Agents" },
  { href: "/stack", label: "Stack" },
  { href: "/python", label: "Python" },
  { href: "/ml", label: "ML" },
  { href: "/training", label: "Training" },
  { href: "/operations", label: "Ops" },
  { href: "/glossary", label: "Glossary" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);

  // Close the drawer when the route changes, adjusted during render rather
  // than in an effect (no extra commit, no flash of an open menu).
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href) || (href === "/catalog" && pathname.startsWith("/projects"));

  return (
    <header className="bar">
      <div className="wrap bar-in">
        <Link href="/" className="bar-mark">
          RAG<span>/</span>FM
        </Link>

        <nav className="bar-links" aria-label="Primary">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} data-active={isActive(l.href)}>
              {l.label}
            </Link>
          ))}
        </nav>

        <ThemeToggle />

        <button
          type="button"
          className="icon-btn menu-btn"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            {open ? <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" /> : <path d="M3.5 7h17M3.5 12h17M3.5 17h17" strokeLinecap="round" />}
          </svg>
        </button>
      </div>

      <div className="drawer" data-open={open} id="mobile-nav">
        <div className="wrap">
          <nav aria-label="Mobile">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} data-active={isActive(l.href)}>
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
