"use server";

import { createClient } from "@/lib/supabase/server";

export async function updateProfile(data: {
  displayName?: string;
  sport?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const updates: Record<string, string> = {};
  if (data.displayName !== undefined) updates.display_name = data.displayName;
  if (data.sport !== undefined) updates.sport = data.sport;

  if (Object.keys(updates).length === 0) return;

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id);

  if (error) throw new Error(error.message);
}

export async function updateNotificationPreferences(prefs: {
  preferredChannels?: string[];
  quietHoursStart?: string | null;
  quietHoursEnd?: string | null;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("notification_preferences").upsert(
    {
      user_id: user.id,
      preferred_channels: prefs.preferredChannels ?? ["in_app", "email"],
      quiet_hours_start: prefs.quietHoursStart ?? null,
      quiet_hours_end: prefs.quietHoursEnd ?? null,
    },
    { onConflict: "user_id" }
  );

  if (error) throw new Error(error.message);
}

export async function saveTrainingSchedule(
  schedule: { day: string; time: string }[]
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // TODO: training_schedule not yet in generated types — regenerate after migration
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("profiles")
    .update({ training_schedule: schedule })
    .eq("id", user.id);

  if (error) throw new Error(error.message);
}

export async function savePhoneNumber(phoneNumber: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // TODO: phone_number not yet in generated types — regenerate after migration
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("profiles")
    .update({ phone_number: phoneNumber })
    .eq("id", user.id);

  if (error) throw new Error(error.message);
}

export async function deleteAccount() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Soft-delete: mark profile as deleted and sign out.
  // Full deletion of auth.users requires admin client and should be
  // handled by a background job or admin action for GDPR compliance.
  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: "[Raderat konto]",
      sport: "",
      notification_preferences: {},
      onboarding_completed: false,
    })
    .eq("id", user.id);

  if (error) throw new Error(error.message);

  await supabase.auth.signOut();
}
