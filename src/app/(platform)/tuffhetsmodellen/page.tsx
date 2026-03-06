import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const metadata = { title: "Din tuffhetsmodell — Next Act" };

export default async function TuffhetsmodellenPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/logga-in");

  // TODO: regenerate types after migration
  const { data } = await (supabase as any)
    .from("toughness_model_data")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const sections = [
    {
      moduleNum: 1,
      title: "Kartläggning",
      key: "kartlaggning" as const,
      data: data?.kartlaggning,
    },
    {
      moduleNum: 2,
      title: "Värderad riktning",
      key: "varderad_riktning" as const,
      data: data?.varderad_riktning,
    },
    {
      moduleNum: 3,
      title: "Hinder — Apan & kletiga tankar",
      key: "hinder" as const,
      data: data?.hinder,
    },
    {
      moduleNum: 4,
      title: "Beteenden — Nyckelaktioner & läktaraktioner",
      key: "beteenden" as const,
      data: data?.beteenden,
    },
    {
      moduleNum: 5,
      title: "Din Våga-lista",
      key: "vaga_lista" as const,
      data: data?.vaga_lista,
      isList: true,
    },
    {
      moduleNum: 6,
      title: "Fokusrutiner",
      key: "fokusrutiner" as const,
      data: data?.fokusrutiner,
    },
    {
      moduleNum: 7,
      title: "Din Gameplan",
      key: "gameplan" as const,
      data: data?.gameplan,
      highlight: true,
    },
  ];

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-2 font-montserrat text-3xl font-bold text-gray-900">
        Din mentala tuffhetsmodell
      </h1>
      <p className="mb-8 text-gray-500">
        Byggs på allteftersom du genomför programmet.
      </p>

      {sections.map(({ key, ...section }) => (
        <TuffhetsSection key={key} {...section} />
      ))}
    </div>
  );
}

function TuffhetsSection({
  title,
  data,
  moduleNum,
  isList = false,
  highlight = false,
}: {
  title: string;
  data: unknown;
  moduleNum: number;
  isList?: boolean;
  highlight?: boolean;
}) {
  const isEmpty =
    !data ||
    (Array.isArray(data) && data.length === 0) ||
    (typeof data === "object" &&
      !Array.isArray(data) &&
      Object.keys(data as Record<string, unknown>).length === 0);

  return (
    <div
      className={`mb-6 rounded-2xl p-6 ${highlight ? "bg-blue-600 text-white" : "bg-gray-50"}`}
    >
      <span
        className={`mb-1 block text-xs font-semibold uppercase tracking-wider ${highlight ? "text-blue-200" : "text-blue-600"}`}
      >
        Modul {moduleNum}
      </span>
      <h2
        className={`mb-4 font-montserrat text-xl font-bold ${highlight ? "text-white" : "text-gray-900"}`}
      >
        {title}
      </h2>

      {isEmpty ? (
        <p className={`text-sm ${highlight ? "text-blue-200" : "text-gray-400"}`}>
          Låses upp när du når modul {moduleNum}.
        </p>
      ) : isList && Array.isArray(data) ? (
        <ul
          className={`list-disc space-y-1 pl-5 text-sm font-source-sans ${highlight ? "text-blue-100" : "text-gray-700"}`}
        >
          {(data as string[]).map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      ) : (
        <dl className="space-y-2">
          {Object.entries(data as Record<string, string>).map(([k, v]) => (
            <div key={k}>
              <dt
                className={`text-xs font-semibold uppercase tracking-wide ${highlight ? "text-blue-200" : "text-gray-500"}`}
              >
                {k.replace(/_/g, " ")}
              </dt>
              <dd
                className={`mt-0.5 text-sm font-source-sans ${highlight ? "text-white" : "text-gray-800"}`}
              >
                {v}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
