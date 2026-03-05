import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mental träning för idrottsklubbar — Next Act",
  description:
    "Ge ert lag den mentala fördelen. Evidensbaserad ACT-träning anpassad för idrottsklubbar och föreningar.",
  openGraph: {
    title: "Mental träning för idrottsklubbar — Next Act",
    description: "Evidensbaserad mental träning för idrottsklubbar och lag.",
    url: "https://nextact.se/klubbar",
    siteName: "Next Act",
    locale: "sv_SE",
    type: "website",
  },
};

const benefits = [
  {
    title: "Konkurrensfördel",
    description:
      "Lag som tränar mentalt presterar bättre under press. Ge era spelare det som skiljer dem från konkurrenterna.",
  },
  {
    title: "Lagsammanhållning",
    description:
      "Gemensam mental träning stärker kommunikation, tillit och fokus inom laget.",
  },
  {
    title: "Spelarutveckling",
    description:
      "Unga idrottare utvecklas snabbare när de kombinerar fysisk och mental träning. ACT bygger hållbar prestation.",
  },
  {
    title: "Tränardashboard",
    description:
      "Tränare och ledare får överblick över lagets framsteg utan att se individuella svar — integritet bevarad.",
  },
];

const steps = [
  {
    number: "1",
    title: "Skapa klubbkonto",
    description:
      "Vi sätter upp ett konto anpassat för er klubb med lagindelning och tränarbehörighet.",
  },
  {
    number: "2",
    title: "Bjud in spelare",
    description:
      "Spelare bjuds in via e-post eller QR-kod. Programmet funkar på mobil, surfplatta och dator.",
  },
  {
    number: "3",
    title: "Träna och följ upp",
    description:
      "Spelare gör korta övningar i sin takt. Tränare ser lagets utveckling i dashboarden.",
  },
];

export default function KlubbarPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-24 top-0 h-[400px] w-[400px] rounded-full bg-success/6 blur-3xl" />
          <div className="absolute -left-32 bottom-0 h-[500px] w-[500px] rounded-full bg-primary/8 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-5xl px-6 pb-28 pt-24 md:pb-36 md:pt-32">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-success font-heading">
            För klubbar och föreningar
          </p>
          <h1 className="max-w-3xl font-heading text-4xl font-bold leading-[1.1] tracking-tight text-white md:text-6xl">
            Mental träning{" "}
            <span className="text-primary">för idrottsklubbar</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/60">
            Ge ert lag den mentala fördelen med strukturerad, evidensbaserad
            träning byggd på ACT.
          </p>

          <div className="mt-10">
            <Link
              href="/kontakt"
              className="inline-flex items-center rounded-[3rem] bg-primary px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-hover hover:shadow-xl hover:shadow-primary/30 font-heading"
            >
              Kontakta oss
            </Link>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-16 bg-off-white [clip-path:polygon(0_100%,100%_0,100%_100%)]" />
      </section>

      {/* Benefits */}
      <section className="bg-off-white py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-navy md:text-4xl">
              Varför Next Act för klubbar?
            </h2>
            <p className="mt-4 text-lg text-charcoal">
              Mental styrka är inte medfödd — den tränas. Vi ger era spelare
              verktygen.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="rounded-2xl bg-white p-6 transition-all hover:shadow-md hover:shadow-navy/5"
              >
                <h3 className="font-heading text-lg font-semibold text-navy">
                  {b.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-charcoal">
                  {b.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-24 md:py-32">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-navy md:text-4xl">
              Så kommer ni igång
            </h2>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.number} className="text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-off-white font-heading text-xl font-bold text-primary">
                  {step.number}
                </span>
                <h3 className="mt-5 font-heading text-lg font-semibold text-navy">
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

      {/* CTA */}
      <section className="relative overflow-hidden bg-navy py-24 md:py-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/8 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-2xl px-6 text-center">
          <h2 className="font-heading text-3xl font-bold tracking-tight text-white md:text-5xl">
            Redo att stärka ert lag?
          </h2>
          <p className="mt-4 text-lg text-white/60">
            Vi berättar gärna hur Next Act kan anpassas för just er klubb.
          </p>
          <Link
            href="/kontakt"
            className="mt-8 inline-flex items-center rounded-[3rem] bg-primary px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-hover hover:shadow-xl hover:shadow-primary/30 font-heading"
          >
            Kontakta oss
          </Link>
        </div>
      </section>
    </>
  );
}
