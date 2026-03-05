import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/layouts/admin-nav";
import type { Metadata } from "next";
import type { UserRole } from "@/lib/supabase/types";

export const metadata: Metadata = {
  title: "Admin — Next Act",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/logga-in");

  const role = (user.app_metadata?.role as UserRole) ?? "athlete";
  if (role !== "admin") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-off-white">
      <AdminNav />
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
