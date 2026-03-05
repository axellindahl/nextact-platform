import { getAdminStats } from "@/lib/actions/admin";
import { Card } from "@/components/ui/card";

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

  const cards = [
    { label: "Totalt användare", value: stats.totalUsers },
    { label: "Aktiva (7 dagar)", value: stats.activeUsers },
    { label: "Avslutade lektioner", value: stats.totalCompletions },
    { label: "Aktiva prenumerationer", value: stats.activeSubscriptions },
  ];

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-navy">Adminpanel</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label} shadow>
            <p className="text-sm text-charcoal/60">{card.label}</p>
            <p className="font-heading text-3xl font-bold text-navy">
              {card.value.toLocaleString("sv-SE")}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
