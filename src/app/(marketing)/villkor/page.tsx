import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Användarvillkor — Next Act",
  description: "Användarvillkor för Next Acts plattform.",
};

export default function TermsPage() {
  return (
    <>
      <section className="bg-navy py-16 md:py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-white md:text-4xl">
            Användarvillkor
          </h1>
          <p className="mt-3 text-sm text-white/50">
            Senast uppdaterad: mars 2026
          </p>
        </div>
      </section>

      <section className="bg-off-white py-16 md:py-24">
        <article className="mx-auto max-w-3xl space-y-10 px-6">
          <TermsSection title="1. Om tjänsten">
            <p>
              Next Act är en digital plattform för mental träning
              riktad till idrottare. Tjänsten tillhandahålls av Next
              Act AB (org.nr. XXXXXX-XXXX). Genom att skapa ett konto accepterar
              du dessa villkor.
            </p>
          </TermsSection>

          <TermsSection title="2. Konto och registrering">
            <ul className="list-disc space-y-2 pl-5">
              <li>
                Du måste vara minst 13 år för att använda
                tjänsten.
              </li>
              <li>
                Användare under 18 år behöver
                vårdnadshavares medgivande.
              </li>
              <li>
                Du ansvarar för att hålla dina inloggningsuppgifter
                säkra.
              </li>
              <li>
                Information du anger vid registrering ska vara korrekt och
                aktuell.
              </li>
            </ul>
          </TermsSection>

          <TermsSection title="3. Prenumeration och betalning">
            <ul className="list-disc space-y-2 pl-5">
              <li>
                Next Act erbjuder tre nivåer: Gratis, Standard (799
                SEK/år inkl. moms) och Premium (2 499 SEK/år inkl.
                moms).
              </li>
              <li>Betalning sker via Stripe. Alla priser är i SEK.</li>
              <li>
                Prenumerationer förnyas automatiskt om du inte säger
                upp innan förnyelseperioden.
              </li>
              <li>
                Vi förbehåller oss rätten att ändra priser
                med 30 dagars förvarning.
              </li>
            </ul>
          </TermsSection>

          <TermsSection title="4. Uppsägning och ångerrätt">
            <ul className="list-disc space-y-2 pl-5">
              <li>
                Du kan säga upp din prenumeration när som helst via
                ditt kontopanel eller genom att kontakta oss.
              </li>
              <li>
                Vid uppsägning behåller du tillgång till resten
                av din betalda period.
              </li>
              <li>
                Enligt svensk lag har du 14 dagars ångerrätt från
                köptillfället. Om du har börjat använda
                tjänsten under ångerfristen kan ångerrätten
                begränsas.
              </li>
            </ul>
          </TermsSection>

          <TermsSection title="5. Användning av tjänsten">
            <p>Du förbinder dig att:</p>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>
                Använda tjänsten enbart för personligt bruk
              </li>
              <li>
                Inte dela, kopiera eller distribuera innehåll från
                plattformen
              </li>
              <li>
                Inte försöka manipulera, hacka eller störa
                tjänstens funktion
              </li>
              <li>
                Inte använda AI-coachen för att generera skadligt
                eller otillåtet innehåll
              </li>
              <li>Respektera andra användares integritet</li>
            </ul>
          </TermsSection>

          <TermsSection title="6. AI-coach — begränsningar">
            <p>
              AI-coachen är ett verktyg för mental träning och
              är <strong>inte</strong> en ersättning för
              professionell psykologisk behandling. Om du mår dåligt,
              kontakta alltid en legitimerad vårdgivare eller ring 112 vid
              akut kris. AI-coachens svar genereras automatiskt och kan
              innehålla felaktigheter.
            </p>
          </TermsSection>

          <TermsSection title="7. Immateriella rättigheter">
            <p>
              Allt innehåll på plattformen — texter,
              övningar, videor, grafik och programvara — är
              skyddat av upphovsrätt och tillhör Next Act AB eller
              våra licensgivare.
            </p>
          </TermsSection>

          <TermsSection title="8. Ansvarsbegränsning">
            <p>
              Next Act tillhandahåller tjänsten &quot;i befintligt
              skick&quot;. Vi garanterar inte att tjänsten alltid är
              tillgänglig eller fri från fel. Vårt ansvar är
              begränsat till det belopp du betalat för tjänsten
              under de senaste 12 månaderna.
            </p>
          </TermsSection>

          <TermsSection title="9. Ändringar av villkoren">
            <p>
              Vi kan uppdatera dessa villkor. Vid väsentliga ändringar
              meddelar vi dig via e-post minst 30 dagar i förväg.
              Fortsätter du använda tjänsten efter
              ändringarna accepterar du de nya villkoren.
            </p>
          </TermsSection>

          <TermsSection title="10. Tvister och lag">
            <p>
              Dessa villkor lyder under svensk lag. Tvister avgörs i
              första hand genom Allmänna Reklamationsnämnden
              (ARN) eller i svensk allmän domstol.
            </p>
          </TermsSection>

          <div className="border-t border-light-gray pt-8 text-center">
            <p className="text-sm text-charcoal">
              Frågor om våra villkor? Kontakta oss på{" "}
              <a
                href="mailto:kontakt@nextact.se"
                className="font-medium text-primary hover:text-primary-hover"
              >
                kontakt@nextact.se
              </a>
            </p>
          </div>
        </article>
      </section>
    </>
  );
}

function TermsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="font-heading text-lg font-semibold text-navy">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-charcoal">
        {children}
      </div>
    </div>
  );
}
