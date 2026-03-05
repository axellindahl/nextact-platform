import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Next Act — Mental träning för idrottare",
  description:
    "Evidensbaserad mental träning byggt på ACT. Utveckla mental styrka, hantera press och prestera när det gäller.",
  openGraph: {
    title: "Next Act — Mental träning för idrottare",
    description: "Evidensbaserad mental träning byggt på ACT.",
    url: "https://nextact.se",
    siteName: "Next Act",
    locale: "sv_SE",
    type: "website",
  },
};

const modules = [
  {
    number: 1,
    name: "Värderingar",
    description:
      "Upptäck vad som verkligen driver dig som idrottare och människa.",
  },
  {
    number: 2,
    name: "Acceptans",
    description: "Lär dig hantera svåra känslor utan att fly från dem.",
  },
  {
    number: 3,
    name: "Defusion",
    description: "Skapa distans till negativa tankar som begränsar dig.",
  },
  {
    number: 4,
    name: "Närvarande Ögonblick",
    description: "Träna fokus och närvaro under press och i vardagen.",
  },
  {
    number: 5,
    name: "Självet som Kontext",
    description: "Se bortom dina prestationer — du är mer än dina resultat.",
  },
  {
    number: 6,
    name: "Engagerat Handlande",
    description: "Koppla ihop dina värderingar med konkreta handlingar.",
  },
  {
    number: 7,
    name: "Integration",
    description: "Samla alla verktyg till en hållbar mental träningsrutin.",
  },
];

const testimonials = [
  {
    quote: "Programmet hjälpte mig hantera pressen inför viktiga matcher.",
    name: "Sofia",
    sport: "fotbollsspelare",
  },
  {
    quote: "Jag har blivit bättre på att fokusera under träning och match.",
    name: "Erik",
    sport: "handbollsspelare",
  },
  {
    quote: "Den mentala träningen var det som saknades i min utveckling.",
    name: "Alma",
    sport: "friidrottare",
  },
];

const steps = [
  {
    number: "1",
    title: "Skapa konto",
    description:
      "Registrera dig på under en minut. Ingen kreditkortsinformation krävs.",
  },
  {
    number: "2",
    title: "Gör dagliga övningar",
    description: "Korta, evidensbaserade lektioner anpassade för idrottare.",
  },
  {
    number: "3",
    title: "Utvecklas med AI-coachen",
    description:
      "Få personlig vägledning och reflektera kring din mentala träning.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* ───── Hero ───── */}
      <section className="relative overflow-hidden bg-navy">
        {/* Decorative background shapes */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-primary/8 blur-3xl" />
          <div className="absolute -left-24 bottom-0 h-[400px] w-[400px] rounded-full bg-cyan/6 blur-3xl" />
          {/* Subtle grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px)",
              backgroundSize: "64px 64px",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-5xl px-6 pb-28 pt-24 md:pb-36 md:pt-32">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-cyan font-heading">
            Evidensbaserad mental träning
          </p>
          <h1 className="max-w-3xl font-heading text-4xl font-bold leading-[1.1] tracking-tight text-white md:text-6xl">
            Mental träning som <span className="text-primary">förändrar</span>{" "}
            ditt spel
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/60">
            Next Act hjälper idrottare att bygga mental styrka genom
            evidensbaserade övningar, AI-coachning och en strukturerad
            programväg — byggt på ACT.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/registrera"
              className="inline-flex items-center rounded-[3rem] bg-primary px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-hover hover:shadow-xl hover:shadow-primary/30 font-heading"
            >
              Kom igång gratis
            </Link>
            <Link
              href="/om-programmet"
              className="inline-flex items-center rounded-[3rem] px-6 py-4 text-base font-medium text-white/70 transition-colors hover:text-white font-heading"
            >
              Läs mer om programmet
              <svg
                className="ml-2 h-4 w-4"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Angled bottom divider */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-off-white [clip-path:polygon(0_100%,100%_0,100%_100%)]" />
      </section>

      {/* ───── Trust Indicators ───── */}
      <section className="bg-off-white py-12">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-8 px-6 text-center md:gap-16">
          <div>
            <p className="font-heading text-2xl font-bold text-navy">ACT</p>
            <p className="mt-1 text-sm text-charcoal">Evidensbaserad metod</p>
          </div>
          <div
            className="hidden h-8 w-px bg-light-gray md:block"
            aria-hidden="true"
          />
          <div>
            <p className="font-heading text-2xl font-bold text-navy">7</p>
            <p className="mt-1 text-sm text-charcoal">Strukturerade moduler</p>
          </div>
          <div
            className="hidden h-8 w-px bg-light-gray md:block"
            aria-hidden="true"
          />
          <div>
            <p className="font-heading text-2xl font-bold text-navy">AI</p>
            <p className="mt-1 text-sm text-charcoal">Personlig coachning</p>
          </div>
        </div>
      </section>

      {/* ───── Program Overview ───── */}
      <section className="bg-off-white py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-navy md:text-4xl">
              Sju steg till mental styrka
            </h2>
            <p className="mt-4 text-lg text-charcoal">
              Programmet är uppbyggt kring sju moduler baserade på ACT — varje
              steg bygger på det förra.
            </p>
          </div>

          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {modules.map((mod) => (
              <div
                key={mod.number}
                className="group relative rounded-2xl bg-white p-6 transition-all hover:shadow-lg hover:shadow-navy/5"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 font-heading text-sm font-bold text-primary">
                  {mod.number}
                </span>
                <h3 className="mt-4 font-heading text-lg font-semibold text-navy">
                  {mod.name}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-charcoal">
                  {mod.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── How It Works ───── */}
      <section className="bg-white py-24 md:py-32">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-navy md:text-4xl">
              Så fungerar det
            </h2>
            <p className="mt-4 text-lg text-charcoal">
              Tre enkla steg för att komma igång med din mentala träning.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {steps.map((step, i) => (
              <div key={step.number} className="relative text-center">
                {/* Connector line (desktop only) */}
                {i < steps.length - 1 && (
                  <div
                    className="absolute right-0 top-8 hidden h-px w-full translate-x-1/2 bg-light-gray md:block"
                    aria-hidden="true"
                  />
                )}
                <span className="relative z-10 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-off-white font-heading text-2xl font-bold text-primary">
                  {step.number}
                </span>
                <h3 className="mt-6 font-heading text-xl font-semibold text-navy">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-charcoal">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Testimonials ───── */}
      <section className="bg-off-white py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center font-heading text-3xl font-bold tracking-tight text-navy md:text-4xl">
            Vad idrottare säger
          </h2>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <blockquote
                key={t.name}
                className="flex flex-col rounded-2xl bg-white p-8"
              >
                {/* Decorative quote mark */}
                <span
                  className="font-heading text-4xl leading-none text-primary/20"
                  aria-hidden="true"
                >
                  &ldquo;
                </span>
                <p className="mt-2 flex-1 text-base leading-relaxed text-navy">
                  {t.quote}
                </p>
                <footer className="mt-6 border-t border-off-white-alt pt-4">
                  <p className="font-heading text-sm font-semibold text-navy">
                    {t.name}
                  </p>
                  <p className="text-xs text-charcoal">{t.sport}</p>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Final CTA ───── */}
      <section className="relative overflow-hidden bg-navy py-24 md:py-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/8 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-2xl px-6 text-center">
          <h2 className="font-heading text-3xl font-bold tracking-tight text-white md:text-5xl">
            Redo att ta nästa steg?
          </h2>
          <p className="mt-4 text-lg text-white/60">
            Börja din mentala träning idag — helt gratis.
          </p>
          <Link
            href="/registrera"
            className="mt-8 inline-flex items-center rounded-[3rem] bg-primary px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-hover hover:shadow-xl hover:shadow-primary/30 font-heading"
          >
            Kom igång gratis
          </Link>
          <p className="mt-4 text-sm text-white/40">Från 799 SEK/år</p>
        </div>
      </section>
    </>
  );
}
