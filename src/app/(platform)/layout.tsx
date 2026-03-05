import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppSidebar } from "@/components/layouts/app-sidebar";

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/logga-in");
  }

  const displayName =
    user.user_metadata?.display_name ?? user.email?.split("@")[0] ?? null;

  return (
    <div className="min-h-screen bg-off-white">
      <AppSidebar
        userName={displayName}
        avatarUrl={user.user_metadata?.avatar_url ?? null}
      />
      <main className="pb-20 lg:ml-64 lg:pb-0">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
