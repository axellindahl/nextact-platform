import Link from "next/link";

const productLinks = [
  { href: "/om-programmet", label: "Om Programmet" },
  { href: "/priser", label: "Priser" },
  { href: "/blogg", label: "Blogg" },
  { href: "/kontakt", label: "Kontakt" },
];

const legalLinks = [
  { href: "/integritetspolicy", label: "Integritetspolicy" },
  { href: "/villkor", label: "Villkor" },
];

function InstagramIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

export function MarketingFooter() {
  return (
    <footer className="bg-navy text-white/80">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-3">
          {/* Brand */}
          <div>
            <p className="font-heading text-lg font-bold text-white">
              Next Act
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/60">
              Evidensbaserad mental träning för idrottare. Byggt på ACT för att
              hjälpa dig prestera när det gäller.
            </p>
          </div>

          {/* Product links */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">
              Utforska
            </p>
            <ul className="flex flex-col gap-3">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal links */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">
              Juridiskt
            </p>
            <ul className="flex flex-col gap-3">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 md:flex-row">
          <p className="text-xs text-white/40">
            &copy; 2026 Next Act. Alla rättigheter förbehållna.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/40 transition-colors hover:text-white"
              aria-label="Instagram"
            >
              <InstagramIcon />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/40 transition-colors hover:text-white"
              aria-label="Facebook"
            >
              <FacebookIcon />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
