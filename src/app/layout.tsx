import type { Metadata } from "next";
import { montserrat, sourceSans } from "@/styles/fonts";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Next Act — Mental träning för idrottare",
  description:
    "Next Act hjälper idrottare att bygga mental styrka genom ACT-baserad träning. Korta lektioner, AI-coachning och personlig utveckling — allt i en plattform.",
  openGraph: {
    title: "Next Act — Mental träning för idrottare",
    description:
      "Bygg mental styrka med ACT-baserad träning, AI-coachning och mikrolärande.",
    type: "website",
    locale: "sv_SE",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sv">
      <body
        className={`${montserrat.variable} ${sourceSans.variable} font-body antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
