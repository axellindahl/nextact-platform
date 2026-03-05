"use server";

import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/types";

export async function getNotifications(limit = 20) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("notifications")
    .select("id, type, channel, status, content, created_at")
    .eq("user_id", user.id)
    .eq("channel", "in_app")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function markNotificationRead(notificationId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("notifications")
    .update({ status: "read" })
    .eq("id", notificationId)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
}

export async function markAllRead() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("notifications")
    .update({ status: "read" })
    .eq("user_id", user.id)
    .eq("channel", "in_app")
    .neq("status", "read");

  if (error) throw new Error(error.message);
}

export async function updateNotificationPreferences(prefs: {
  preferredChannels?: string[];
  quietHoursStart?: string | null;
  quietHoursEnd?: string | null;
  perTypeSettings?: Record<string, unknown>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const updateData: Record<string, unknown> = {};
  if (prefs.preferredChannels !== undefined) {
    updateData.preferred_channels = prefs.preferredChannels as unknown as Json;
  }
  if (prefs.quietHoursStart !== undefined) {
    updateData.quiet_hours_start = prefs.quietHoursStart;
  }
  if (prefs.quietHoursEnd !== undefined) {
    updateData.quiet_hours_end = prefs.quietHoursEnd;
  }
  if (prefs.perTypeSettings !== undefined) {
    updateData.per_type_settings = prefs.perTypeSettings as unknown as Json;
  }

  const { error } = await supabase
    .from("notification_preferences")
    .upsert({ user_id: user.id, ...updateData }, { onConflict: "user_id" });

  if (error) throw new Error(error.message);
}
