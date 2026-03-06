import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { ProfileForm } from "@/components/features/profile/profile-form";
import { NotificationForm } from "@/components/features/profile/notification-form";
import { DeleteAccountButton } from "@/components/features/profile/delete-account-button";
import { SubscriptionCard } from "@/components/features/profile/subscription-card";
import { TrainingScheduleForm } from "@/components/features/profile/training-schedule-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Din Profil — Next Act",
};

const TIER_LABELS: Record<string, string> = {
  free: "Gratis",
  standard: "Standard",
  premium: "Premium",
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/logga-in");

  const [{ data: profile }, { data: notificationPrefs }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", user.id)
      .single(),
  ]);

  const displayName = profile?.display_name ?? "";
  const sport = profile?.sport ?? "";
  const ageBracket = profile?.age_bracket ?? "";
  const tier = profile?.subscription_tier ?? "free";
  const preferredLanguage = profile?.preferred_language ?? "sv";
  // TODO: training_schedule and phone_number not yet in generated types — regenerate after migration
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const profileAny = profile as any;
  const trainingSchedule = Array.isArray(profileAny?.training_schedule)
    ? (profileAny.training_schedule as { day: string; time: string }[])
    : [];
  const phoneNumber = (profileAny?.phone_number as string | null) ?? "";

  const channels = Array.isArray(notificationPrefs?.preferred_channels)
    ? (notificationPrefs.preferred_channels as string[])
    : ["in_app", "email"];
  const quietStart = notificationPrefs?.quiet_hours_start ?? null;
  const quietEnd = notificationPrefs?.quiet_hours_end ?? null;

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <h1 className="font-heading text-2xl font-bold text-navy">Din Profil</h1>

      {/* User Info */}
      <Card shadow>
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-bold text-white">
            {displayName ? displayName[0].toUpperCase() : "?"}
          </div>
          <div>
            <p className="font-heading text-lg font-semibold text-navy">
              {displayName || "Anonym"}
            </p>
            <p className="text-sm text-charcoal/60">
              {sport || "Ingen idrott angiven"} &middot;{" "}
              {ageBracket || "Okänd ålder"} &middot; {TIER_LABELS[tier] ?? tier}
            </p>
            <p className="text-xs text-charcoal/40">{user.email}</p>
          </div>
        </div>
      </Card>

      {/* Edit Profile */}
      <Card shadow>
        <h2 className="mb-4 font-heading text-lg font-semibold text-navy">
          Redigera profil
        </h2>
        <ProfileForm
          initialName={displayName}
          initialSport={sport}
          initialLanguage={preferredLanguage}
        />
      </Card>

      {/* Subscription */}
      <SubscriptionCard tier={tier} />

      {/* Notification Preferences */}
      <Card shadow>
        <h2 className="mb-4 font-heading text-lg font-semibold text-navy">
          Notifikationer
        </h2>
        <NotificationForm
          initialChannels={channels}
          initialQuietStart={quietStart}
          initialQuietEnd={quietEnd}
        />
      </Card>

      {/* Training Schedule */}
      <Card shadow>
        <h2 className="mb-4 font-heading text-lg font-semibold text-navy">
          Träningstider &amp; SMS-påminnelser
        </h2>
        <TrainingScheduleForm
          initialSchedule={trainingSchedule}
          initialPhoneNumber={phoneNumber}
        />
      </Card>

      {/* Account Actions */}
      <Card shadow>
        <h2 className="mb-4 font-heading text-lg font-semibold text-navy">
          Konto
        </h2>
        <DeleteAccountButton />
      </Card>
    </div>
  );
}
