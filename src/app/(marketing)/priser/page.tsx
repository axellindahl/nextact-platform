import type { Metadata } from "next";
import Link from "next/link";
import { PricingTable } from "@/components/features/marketing/pricing-table";

export const metadata: Metadata = {
  title: "Priser \u2014 Next Act",
  description:
    "V\u00e4lj den plan som passar dig. B\u00f6rja gratis och uppgradera n\u00e4r du \u00e4r redo.",
};

export default function PricingPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-navy py-20 md:py-28">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-white md:text-5xl">
            Investera i din mentala styrka
          </h1>
          <p className="mt-4 text-lg text-white/60">
            Alla planer ger tillg\u00e5ng till evidensbaserad mental
            tr\u00e4ning. V\u00e4lj den niv\u00e5 som passar dig.
          </p>
        </div>
      </section>

      {/* Pricing table */}
      <section className="bg-off-white py-20 md:py-28">
        <div className="mx-auto max-w-5xl px-6">
          <PricingTable />

          <p className="mt-8 text-center text-sm text-charcoal">
            Alla priser \u00e4r i svenska kronor och inkluderar 25% moms.
            Betalning hanteras s\u00e4kert via Stripe.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-20 md:py-28">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-center font-heading text-2xl font-bold text-navy md:text-3xl">
            Vanliga fr\u00e5gor
          </h2>

          <div className="mt-12 space-y-8">
            <FaqItem
              question="Kan jag byta plan n\u00e4r som helst?"
              answer="Ja, du kan uppgradera eller nedgradera din plan n\u00e4r som helst. \u00c4ndringar tr\u00e4der i kraft direkt."
            />
            <FaqItem
              question="Vad ing\u00e5r i gratisplanen?"
              answer="Gratisplanen ger dig tillg\u00e5ng till introduktionsmodulerna och 10 AI-coach meddelanden per vecka. Perfekt f\u00f6r att testa plattformen."
            />
            <FaqItem
              question="Finns det n\u00e5gon bindningstid?"
              answer="Nej, du kan avsluta din prenumeration n\u00e4r som helst. Du beh\u00e5ller tillg\u00e5ng till resten av din betalda period."
            />
            <FaqItem
              question="Hur fungerar psykolog-sessionerna i Premium?"
              answer="Premium-medlemmar f\u00e5r tillg\u00e5ng till digitala sessioner med licensierade psykologer specialiserade p\u00e5 idrottspsykologi."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy py-20">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="font-heading text-2xl font-bold text-white md:text-3xl">
            Redo att b\u00f6rja?
          </h2>
          <p className="mt-3 text-white/60">
            Skapa ett gratis konto p\u00e5 under en minut.
          </p>
          <Link
            href="/registrera"
            className="mt-8 inline-flex items-center rounded-[3rem] bg-primary px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-hover font-heading"
          >
            Kom ig\u00e5ng gratis
          </Link>
        </div>
      </section>
    </>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div>
      <h3 className="font-heading text-base font-semibold text-navy">
        {question}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-charcoal">{answer}</p>
    </div>
  );
}
