import { Card } from "@/components/ui/card";

const SECTIONS = [
  {
    title: "Engagemang",
    description: "DAU / WAU / MAU, retentionsgrad och sessionstid",
  },
  {
    title: "Innehåll",
    description: "Avslutningsgrad per modul, mest populära lektioner",
  },
  {
    title: "AI Coach",
    description: "Antal samtal, meddelanden per session, krisdetektion",
  },
  {
    title: "Intäkter",
    description: "MRR, churn rate, konvertering fri till betald",
  },
] as const;

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-navy">Analys</h1>

      <div className="grid gap-4 md:grid-cols-2">
        {SECTIONS.map((section) => (
          <Card key={section.title} shadow>
            <h2 className="font-heading text-lg font-semibold text-navy">
              {section.title}
            </h2>
            <p className="mt-1 text-sm text-charcoal/60">
              {section.description}
            </p>
            <div className="mt-6 flex h-32 items-center justify-center rounded-xl bg-off-white">
              <span className="text-sm text-charcoal/30">Kommer snart</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
