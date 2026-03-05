import type { Metadata } from "next";
import { montserrat, sourceSans } from "@/styles/fonts";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Next Act — Mental tr\u00e4ning f\u00f6r idrottare",
  description:
    "Next Act hj\u00e4lper idrottare att bygga mental styrka genom ACT-baserad tr\u00e4ning. Korta lektioner, AI-coachning och personlig utveckling — allt i en plattform.",
  openGraph: {
    title: "Next Act — Mental tr\u00e4ning f\u00f6r idrottare",
    description:
      "Bygg mental styrka med ACT-baserad tr\u00e4ning, AI-coachning och mikrol\u00e4rande.",
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
