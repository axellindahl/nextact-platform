import Link from "next/link";

type PricingTier = {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  cta: string;
  ctaHref: string;
  highlighted?: boolean;
};

const TIERS: PricingTier[] = [
  {
    name: "Gratis",
    price: "0 SEK",
    description: "Perfekt för att testa plattformen och komma igång.",
    features: [
      "Introduktionsmoduler",
      "10 AI-coach meddelanden/vecka",
      "Grundläggande framstegsöversikt",
      "Daglig påminnelse",
    ],
    cta: "Kom igång gratis",
    ctaHref: "/registrera",
  },
  {
    name: "Standard",
    price: "799 SEK",
    period: "/år",
    description: "Fullständig tillgång till hela programmet.",
    features: [
      "Alla 12 moduler + övningar",
      "50 AI-coach meddelanden/dag",
      "Detaljerad framstegsrapport",
      "Stråk-tracker med freeze",
      "Mental tålighetsmodell",
      "Prioriterad support",
    ],
    cta: "Välj Standard",
    ctaHref: "/registrera?plan=standard",
    highlighted: true,
  },
  {
    name: "Premium",
    price: "2 499 SEK",
    period: "/år",
    description:
      "För idrottare som vill ha allt, inklusive personlig coachning.",
    features: [
      "Allt i Standard",
      "Obegränsade AI-coach meddelanden",
      "Psykolog-sessioner (digitala)",
      "Anpassade träningsplaner",
      "Avancerad analys & export",
      "Direkt chatt-support",
    ],
    cta: "Välj Premium",
    ctaHref: "/registrera?plan=premium",
  },
];

export function PricingTable() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {TIERS.map((tier) => (
        <div
          key={tier.name}
          className={`relative flex flex-col rounded-2xl p-8 ${
            tier.highlighted
              ? "border-2 border-primary bg-white shadow-lg shadow-primary/10"
              : "border border-light-gray bg-white"
          }`}
        >
          {tier.highlighted && (
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-white">
              Rekommenderad
            </span>
          )}

          <div>
            <h3 className="font-heading text-lg font-semibold text-navy">
              {tier.name}
            </h3>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="font-heading text-4xl font-bold text-navy">
                {tier.price}
              </span>
              {tier.period && (
                <span className="text-sm text-charcoal">{tier.period}</span>
              )}
            </div>
            {tier.period && (
              <p className="mt-1 text-xs text-charcoal">Inkl. moms</p>
            )}
            <p className="mt-3 text-sm text-charcoal">{tier.description}</p>
          </div>

          <ul className="mt-6 flex-1 space-y-3">
            {tier.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm">
                <svg
                  className="mt-0.5 h-4 w-4 shrink-0 text-success"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m4.5 12.75 6 6 9-13.5"
                  />
                </svg>
                <span className="text-navy">{feature}</span>
              </li>
            ))}
          </ul>

          <Link
            href={tier.ctaHref}
            className={`mt-8 block rounded-[3rem] px-6 py-3 text-center text-sm font-semibold transition-colors ${
              tier.highlighted
                ? "bg-primary text-white shadow-sm shadow-primary/20 hover:bg-primary-hover"
                : "border border-primary text-primary hover:bg-primary/5"
            }`}
          >
            {tier.cta}
          </Link>
        </div>
      ))}
    </div>
  );
}
