import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kontakt — Next Act",
  description: "Kontakta Next Act-teamet. Vi hjälper dig gärna!",
};

export default function ContactPage() {
  return (
    <>
      <section className="bg-navy py-20 md:py-28">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-white md:text-5xl">
            Kontakta oss
          </h1>
          <p className="mt-4 text-lg text-white/60">
            Har du frågor? Vi svarar gärna.
          </p>
        </div>
      </section>

      <section className="bg-off-white py-20 md:py-28">
        <div className="mx-auto max-w-2xl px-6">
          <div className="rounded-2xl bg-white p-8">
            <form className="space-y-5">
              <div>
                <label
                  htmlFor="contact-name"
                  className="block text-sm font-medium text-navy"
                >
                  Namn
                </label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  required
                  placeholder="Ditt namn"
                  className="mt-1 w-full rounded-lg border border-light-gray px-4 py-3 text-navy placeholder:text-light-gray focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-email"
                  className="block text-sm font-medium text-navy"
                >
                  E-postadress
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  required
                  placeholder="din@epost.se"
                  className="mt-1 w-full rounded-lg border border-light-gray px-4 py-3 text-navy placeholder:text-light-gray focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="block text-sm font-medium text-navy"
                >
                  Meddelande
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  required
                  rows={5}
                  placeholder="Beskriv ditt ärende..."
                  className="mt-1 w-full resize-none rounded-lg border border-light-gray px-4 py-3 text-navy placeholder:text-light-gray focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-[3rem] bg-primary px-6 py-3 font-heading font-semibold text-white transition-colors hover:bg-primary-hover"
              >
                Skicka meddelande
              </button>
            </form>

            <div className="mt-8 border-t border-off-white-alt pt-6 text-center">
              <p className="text-sm text-charcoal">
                Du kan också nå oss direkt på
              </p>
              <a
                href="mailto:kontakt@nextact.se"
                className="mt-1 inline-block text-sm font-medium text-primary hover:text-primary-hover"
              >
                kontakt@nextact.se
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
