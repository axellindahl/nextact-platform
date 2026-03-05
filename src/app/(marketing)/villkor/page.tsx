import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Anv\u00e4ndarvillkor \u2014 Next Act",
  description: "Anv\u00e4ndarvillkor f\u00f6r Next Acts plattform.",
};

export default function TermsPage() {
  return (
    <>
      <section className="bg-navy py-16 md:py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-white md:text-4xl">
            Anv\u00e4ndarvillkor
          </h1>
          <p className="mt-3 text-sm text-white/50">
            Senast uppdaterad: mars 2026
          </p>
        </div>
      </section>

      <section className="bg-off-white py-16 md:py-24">
        <article className="mx-auto max-w-3xl space-y-10 px-6">
          <TermsSection title="1. Om tj\u00e4nsten">
            <p>
              Next Act \u00e4r en digital plattform f\u00f6r mental tr\u00e4ning
              riktad till idrottare. Tj\u00e4nsten tillhandah\u00e5lls av Next
              Act AB (org.nr. XXXXXX-XXXX). Genom att skapa ett konto accepterar
              du dessa villkor.
            </p>
          </TermsSection>

          <TermsSection title="2. Konto och registrering">
            <ul className="list-disc space-y-2 pl-5">
              <li>
                Du m\u00e5ste vara minst 13 \u00e5r f\u00f6r att anv\u00e4nda
                tj\u00e4nsten.
              </li>
              <li>
                Anv\u00e4ndare under 18 \u00e5r beh\u00f6ver
                v\u00e5rdnadshavares medgivande.
              </li>
              <li>
                Du ansvarar f\u00f6r att h\u00e5lla dina inloggningsuppgifter
                s\u00e4kra.
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
                Next Act erbjuder tre niv\u00e5er: Gratis, Standard (799
                SEK/\u00e5r inkl. moms) och Premium (2 499 SEK/\u00e5r inkl.
                moms).
              </li>
              <li>Betalning sker via Stripe. Alla priser \u00e4r i SEK.</li>
              <li>
                Prenumerationer f\u00f6rnyas automatiskt om du inte s\u00e4ger
                upp innan f\u00f6rnyelseperioden.
              </li>
              <li>
                Vi f\u00f6rbeh\u00e5ller oss r\u00e4tten att \u00e4ndra priser
                med 30 dagars f\u00f6rvarning.
              </li>
            </ul>
          </TermsSection>

          <TermsSection title="4. Upps\u00e4gning och \u00e5ngerr\u00e4tt">
            <ul className="list-disc space-y-2 pl-5">
              <li>
                Du kan s\u00e4ga upp din prenumeration n\u00e4r som helst via
                ditt kontopanel eller genom att kontakta oss.
              </li>
              <li>
                Vid upps\u00e4gning beh\u00e5ller du tillg\u00e5ng till resten
                av din betalda period.
              </li>
              <li>
                Enligt svensk lag har du 14 dagars \u00e5ngerr\u00e4tt fr\u00e5n
                k\u00f6ptillf\u00e4llet. Om du har b\u00f6rjat anv\u00e4nda
                tj\u00e4nsten under \u00e5ngerfristen kan \u00e5ngerr\u00e4tten
                begr\u00e4nsas.
              </li>
            </ul>
          </TermsSection>

          <TermsSection title="5. Anv\u00e4ndning av tj\u00e4nsten">
            <p>Du f\u00f6rbinder dig att:</p>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>
                Anv\u00e4nda tj\u00e4nsten enbart f\u00f6r personligt bruk
              </li>
              <li>
                Inte dela, kopiera eller distribuera inneh\u00e5ll fr\u00e5n
                plattformen
              </li>
              <li>
                Inte f\u00f6rs\u00f6ka manipulera, hacka eller st\u00f6ra
                tj\u00e4nstens funktion
              </li>
              <li>
                Inte anv\u00e4nda AI-coachen f\u00f6r att generera skadligt
                eller otill\u00e5tet inneh\u00e5ll
              </li>
              <li>Respektera andra anv\u00e4ndares integritet</li>
            </ul>
          </TermsSection>

          <TermsSection title="6. AI-coach \u2014 begr\u00e4nsningar">
            <p>
              AI-coachen \u00e4r ett verktyg f\u00f6r mental tr\u00e4ning och
              \u00e4r <strong>inte</strong> en ers\u00e4ttning f\u00f6r
              professionell psykologisk behandling. Om du m\u00e5r d\u00e5ligt,
              kontakta alltid en legitimerad v\u00e5rdgivare eller ring 112 vid
              akut kris. AI-coachens svar genereras automatiskt och kan
              inneh\u00e5lla felaktigheter.
            </p>
          </TermsSection>

          <TermsSection title="7. Immateriella r\u00e4ttigheter">
            <p>
              Allt inneh\u00e5ll p\u00e5 plattformen \u2014 texter,
              \u00f6vningar, videor, grafik och programvara \u2014 \u00e4r
              skyddat av upphovsr\u00e4tt och tillh\u00f6r Next Act AB eller
              v\u00e5ra licensgivare.
            </p>
          </TermsSection>

          <TermsSection title="8. Ansvarsbegr\u00e4nsning">
            <p>
              Next Act tillhandah\u00e5ller tj\u00e4nsten &quot;i befintligt
              skick&quot;. Vi garanterar inte att tj\u00e4nsten alltid \u00e4r
              tillg\u00e4nglig eller fri fr\u00e5n fel. V\u00e5rt ansvar \u00e4r
              begr\u00e4nsat till det belopp du betalat f\u00f6r tj\u00e4nsten
              under de senaste 12 m\u00e5naderna.
            </p>
          </TermsSection>

          <TermsSection title="9. \u00c4ndringar av villkoren">
            <p>
              Vi kan uppdatera dessa villkor. Vid v\u00e4sentliga \u00e4ndringar
              meddelar vi dig via e-post minst 30 dagar i f\u00f6rv\u00e4g.
              Forts\u00e4tter du anv\u00e4nda tj\u00e4nsten efter
              \u00e4ndringarna accepterar du de nya villkoren.
            </p>
          </TermsSection>

          <TermsSection title="10. Tvister och lag">
            <p>
              Dessa villkor lyder under svensk lag. Tvister avg\u00f6rs i
              f\u00f6rsta hand genom Allm\u00e4nna Reklamationsn\u00e4mnden
              (ARN) eller i svensk allm\u00e4n domstol.
            </p>
          </TermsSection>

          <div className="border-t border-light-gray pt-8 text-center">
            <p className="text-sm text-charcoal">
              Fr\u00e5gor om v\u00e5ra villkor? Kontakta oss p\u00e5{" "}
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
