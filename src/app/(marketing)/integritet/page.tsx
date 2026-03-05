import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Integritetspolicy — Next Act",
  description:
    "Next Acts integritetspolicy och information om hur vi hanterar dina personuppgifter.",
};

export default function PrivacyPage() {
  return (
    <>
      <section className="bg-navy py-16 md:py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-white md:text-4xl">
            Integritetspolicy
          </h1>
          <p className="mt-3 text-sm text-white/50">
            Senast uppdaterad: mars 2026
          </p>
        </div>
      </section>

      <section className="bg-off-white py-16 md:py-24">
        <article className="mx-auto max-w-3xl space-y-10 px-6">
          <PolicySection title="1. Personuppgiftsansvarig">
            <p>
              Next Act AB (org.nr. XXXXXX-XXXX) är personuppgiftsansvarig
              för behandlingen av dina personuppgifter. Du når oss
              på kontakt@nextact.se.
            </p>
          </PolicySection>

          <PolicySection title="2. Vilka uppgifter vi samlar in">
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong>Kontouppgifter:</strong> Namn, e-postadress, sport,
                åldersgrupp vid registrering.
              </li>
              <li>
                <strong>Användningsdata:</strong> Framsteg i programmet,
                avslutade lektioner, övningssvar.
              </li>
              <li>
                <strong>AI-coachsamtal:</strong> Meddelanden du skickar till och
                tar emot från AI-coachen.
              </li>
              <li>
                <strong>Betalningsuppgifter:</strong> Hanteras av Stripe. Vi
                lagrar aldrig fullständiga kortuppgifter.
              </li>
              <li>
                <strong>Teknisk data:</strong> IP-adress, webbläsartyp,
                enhetsinformation via cookies.
              </li>
            </ul>
          </PolicySection>

          <PolicySection title="3. Hur vi använder dina uppgifter">
            <ul className="list-disc space-y-2 pl-5">
              <li>
                För att tillhandahålla och förbättra
                vår tjänst
              </li>
              <li>För att personalisera din träningsupplevelse</li>
              <li>
                För att ge AI-coachning baserat på dina framsteg
              </li>
              <li>
                För att skicka relevanta notifikationer och
                påminnelser
              </li>
              <li>För att hantera betalningar och prenumerationer</li>
            </ul>
          </PolicySection>

          <PolicySection title="4. AI-behandling och data">
            <p>
              Vår AI-coach drivs av Anthropics Claude-modell. Dina
              coachsamtal skickas till Anthropics API för att generera
              svar. Anthropic använder inte kunddata för träning
              av sina modeller (enligt deras databehandlingsavtal). Vi sparar
              samtal för att ge kontinuitet i coachningen.
            </p>
          </PolicySection>

          <PolicySection title="5. Rättslig grund">
            <p>
              Vi behandlar dina uppgifter baserat på avtal (för att
              leverera tjänsten), samtycke (för marknadsföring)
              och berättigat intresse (för att förbättra
              tjänsten).
            </p>
          </PolicySection>

          <PolicySection title="6. Delning av uppgifter">
            <p>
              Vi delar uppgifter med följande tredjeparter, enbart för
              att tillhandahålla tjänsten:
            </p>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>
                <strong>Supabase:</strong> Databaslagring och autentisering
                (EU-baserat)
              </li>
              <li>
                <strong>Stripe:</strong> Betalningshantering
              </li>
              <li>
                <strong>Anthropic:</strong> AI-coachfunktionalitet
              </li>
              <li>
                <strong>Resend/Twilio:</strong> E-post- och SMS-notifikationer
              </li>
              <li>
                <strong>Vercel:</strong> Webbhosting
              </li>
            </ul>
          </PolicySection>

          <PolicySection title="7. Dina rättigheter (GDPR)">
            <p>Du har rätt att:</p>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>Få tillgång till dina personuppgifter</li>
              <li>Rätta felaktiga uppgifter</li>
              <li>
                Radera dina uppgifter (&quot;rätten att bli
                glömd&quot;)
              </li>
              <li>Begära dataportabilitet</li>
              <li>Invända mot viss behandling</li>
              <li>Klaga till Integritetsskyddsmyndigheten (IMY)</li>
            </ul>
            <p className="mt-2">
              Kontakta oss på kontakt@nextact.se för att utöva
              dina rättigheter.
            </p>
          </PolicySection>

          <PolicySection title="8. Cookies">
            <p>
              Vi använder nödvändiga cookies för
              autentisering och sessionhantering. Vi använder inga
              spårningscookies för reklam.
            </p>
          </PolicySection>

          <PolicySection title="9. Lagring och radering">
            <p>
              Dina uppgifter lagras så länge du har ett aktivt konto.
              Vid kontoborttagning raderas dina personuppgifter inom 30 dagar.
              Anonymiserad, aggregerad data kan behållas för
              statistiska ändamål.
            </p>
          </PolicySection>
        </article>
      </section>
    </>
  );
}

function PolicySection({
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
