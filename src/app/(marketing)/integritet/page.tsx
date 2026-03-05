import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Integritetspolicy \u2014 Next Act",
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
              Next Act AB (org.nr. XXXXXX-XXXX) \u00e4r personuppgiftsansvarig
              f\u00f6r behandlingen av dina personuppgifter. Du n\u00e5r oss
              p\u00e5 kontakt@nextact.se.
            </p>
          </PolicySection>

          <PolicySection title="2. Vilka uppgifter vi samlar in">
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong>Kontouppgifter:</strong> Namn, e-postadress, sport,
                \u00e5ldersgrupp vid registrering.
              </li>
              <li>
                <strong>Anv\u00e4ndningsdata:</strong> Framsteg i programmet,
                avslutade lektioner, \u00f6vningssvar.
              </li>
              <li>
                <strong>AI-coachsamtal:</strong> Meddelanden du skickar till och
                tar emot fr\u00e5n AI-coachen.
              </li>
              <li>
                <strong>Betalningsuppgifter:</strong> Hanteras av Stripe. Vi
                lagrar aldrig fullst\u00e4ndiga kortuppgifter.
              </li>
              <li>
                <strong>Teknisk data:</strong> IP-adress, webbl\u00e4sartyp,
                enhetsinformation via cookies.
              </li>
            </ul>
          </PolicySection>

          <PolicySection title="3. Hur vi anv\u00e4nder dina uppgifter">
            <ul className="list-disc space-y-2 pl-5">
              <li>
                F\u00f6r att tillhandah\u00e5lla och f\u00f6rb\u00e4ttra
                v\u00e5r tj\u00e4nst
              </li>
              <li>F\u00f6r att personalisera din tr\u00e4ningsupplevelse</li>
              <li>
                F\u00f6r att ge AI-coachning baserat p\u00e5 dina framsteg
              </li>
              <li>
                F\u00f6r att skicka relevanta notifikationer och
                p\u00e5minnelser
              </li>
              <li>F\u00f6r att hantera betalningar och prenumerationer</li>
            </ul>
          </PolicySection>

          <PolicySection title="4. AI-behandling och data">
            <p>
              V\u00e5r AI-coach drivs av Anthropics Claude-modell. Dina
              coachsamtal skickas till Anthropics API f\u00f6r att generera
              svar. Anthropic anv\u00e4nder inte kunddata f\u00f6r tr\u00e4ning
              av sina modeller (enligt deras databehandlingsavtal). Vi sparar
              samtal f\u00f6r att ge kontinuitet i coachningen.
            </p>
          </PolicySection>

          <PolicySection title="5. R\u00e4ttslig grund">
            <p>
              Vi behandlar dina uppgifter baserat p\u00e5 avtal (f\u00f6r att
              leverera tj\u00e4nsten), samtycke (f\u00f6r marknadsf\u00f6ring)
              och ber\u00e4ttigat intresse (f\u00f6r att f\u00f6rb\u00e4ttra
              tj\u00e4nsten).
            </p>
          </PolicySection>

          <PolicySection title="6. Delning av uppgifter">
            <p>
              Vi delar uppgifter med f\u00f6ljande tredjeparter, enbart f\u00f6r
              att tillhandah\u00e5lla tj\u00e4nsten:
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

          <PolicySection title="7. Dina r\u00e4ttigheter (GDPR)">
            <p>Du har r\u00e4tt att:</p>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>F\u00e5 tillg\u00e5ng till dina personuppgifter</li>
              <li>R\u00e4tta felaktiga uppgifter</li>
              <li>
                Radera dina uppgifter (&quot;r\u00e4tten att bli
                gl\u00f6md&quot;)
              </li>
              <li>Beg\u00e4ra dataportabilitet</li>
              <li>Inv\u00e4nda mot viss behandling</li>
              <li>Klaga till Integritetsskyddsmyndigheten (IMY)</li>
            </ul>
            <p className="mt-2">
              Kontakta oss p\u00e5 kontakt@nextact.se f\u00f6r att ut\u00f6va
              dina r\u00e4ttigheter.
            </p>
          </PolicySection>

          <PolicySection title="8. Cookies">
            <p>
              Vi anv\u00e4nder n\u00f6dv\u00e4ndiga cookies f\u00f6r
              autentisering och sessionhantering. Vi anv\u00e4nder inga
              sp\u00e5rningscookies f\u00f6r reklam.
            </p>
          </PolicySection>

          <PolicySection title="9. Lagring och radering">
            <p>
              Dina uppgifter lagras s\u00e5 l\u00e4nge du har ett aktivt konto.
              Vid kontoborttagning raderas dina personuppgifter inom 30 dagar.
              Anonymiserad, aggregerad data kan beh\u00e5llas f\u00f6r
              statistiska \u00e4ndam\u00e5l.
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
