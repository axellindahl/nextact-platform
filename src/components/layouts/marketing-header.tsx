"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const navLinks = [
  { href: "/om-programmet", label: "Om Programmet" },
  { href: "/priser", label: "Priser" },
  { href: "/blogg", label: "Blogg" },
];

export function MarketingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${scrolled ? "bg-white/95 backdrop-blur-md shadow-sm" : "bg-transparent"}
      `}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link
          href="/"
          className="font-heading text-xl font-bold tracking-tight text-navy"
        >
          Next Act
        </Link>

        {/* Desktop nav */}
        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-sm font-medium text-charcoal transition-colors hover:text-navy"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/logga-in"
            className="rounded-[3rem] px-4 py-2 text-sm font-semibold text-charcoal transition-colors hover:text-navy hover:bg-navy/5 font-heading"
          >
            Logga in
          </Link>
          <Link
            href="/registrera"
            className="rounded-[3rem] bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-primary/20 transition-all hover:bg-primary-hover font-heading"
          >
            Kom igång
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex flex-col gap-1.5 p-2 md:hidden"
          aria-label={menuOpen ? "Stäng meny" : "Öppna meny"}
          aria-expanded={menuOpen}
        >
          <span
            className={`block h-0.5 w-5 bg-navy transition-all duration-200 ${menuOpen ? "translate-y-2 rotate-45" : ""}`}
          />
          <span
            className={`block h-0.5 w-5 bg-navy transition-all duration-200 ${menuOpen ? "opacity-0" : ""}`}
          />
          <span
            className={`block h-0.5 w-5 bg-navy transition-all duration-200 ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`}
          />
        </button>
      </nav>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="border-t border-light-gray/30 bg-white px-6 pb-6 pt-4 md:hidden">
          <ul className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="text-base font-medium text-charcoal transition-colors hover:text-navy"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/logga-in"
              onClick={() => setMenuOpen(false)}
              className="rounded-[3rem] border border-light-gray px-5 py-2.5 text-center text-sm font-semibold text-charcoal transition-colors hover:border-navy hover:text-navy font-heading"
            >
              Logga in
            </Link>
            <Link
              href="/registrera"
              onClick={() => setMenuOpen(false)}
              className="rounded-[3rem] bg-primary px-5 py-2.5 text-center text-sm font-semibold text-white shadow-sm shadow-primary/20 transition-all hover:bg-primary-hover font-heading"
            >
              Kom igång
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
