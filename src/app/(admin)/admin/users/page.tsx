import { getUsers } from "@/lib/actions/admin";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserSearch } from "@/components/features/admin/user-search";
import Link from "next/link";

const TIER_LABELS: Record<string, string> = {
  free: "Gratis",
  standard: "Standard",
  premium: "Premium",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Aktiv",
  trialing: "Prov",
  past_due: "Förfallen",
  canceled: "Avbruten",
  expired: "Utgången",
};

type Props = {
  searchParams: Promise<{ q?: string; page?: string }>;
};

export default async function UsersPage({ searchParams }: Props) {
  const params = await searchParams;
  const query = params.q ?? "";
  const page = Number(params.page ?? "1");
  const { users, total, totalPages } = await getUsers(query || undefined, page);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-navy">Användare</h1>
        <span className="text-sm text-charcoal/50">{total} totalt</span>
      </div>

      <UserSearch initialQuery={query} />

      <Card shadow padding="sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-light-gray/20 text-xs uppercase text-charcoal/40">
              <th className="px-3 py-2 font-medium">Namn</th>
              <th className="px-3 py-2 font-medium">Idrott</th>
              <th className="px-3 py-2 font-medium">Plan</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Registrerad</th>
              <th className="px-3 py-2 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-light-gray/10">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-off-white-alt/50">
                <td className="px-3 py-2.5 font-medium text-charcoal">
                  {u.display_name || "Anonym"}
                </td>
                <td className="px-3 py-2.5 text-charcoal/60">
                  {u.sport || "—"}
                </td>
                <td className="px-3 py-2.5">
                  <Badge>
                    {TIER_LABELS[u.subscription_tier] ?? u.subscription_tier}
                  </Badge>
                </td>
                <td className="px-3 py-2.5 text-charcoal/60">
                  {STATUS_LABELS[u.subscription_status] ??
                    u.subscription_status}
                </td>
                <td className="px-3 py-2.5 text-charcoal/40">
                  {new Date(u.created_at).toLocaleDateString("sv-SE")}
                </td>
                <td className="px-3 py-2.5">
                  <Link
                    href={`/admin/users/${u.id}`}
                    className="text-primary hover:underline"
                  >
                    Visa
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <p className="py-8 text-center text-sm text-charcoal/40">
            Inga användare hittades
          </p>
        )}
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/users?q=${encodeURIComponent(query)}&page=${p}`}
              className={`
                rounded-lg px-3 py-1.5 text-sm transition-colors
                ${
                  p === page
                    ? "bg-primary text-white"
                    : "text-charcoal/60 hover:bg-off-white-alt"
                }
              `}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
