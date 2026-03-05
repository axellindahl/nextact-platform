import { createAdminClient } from "@/lib/supabase/admin";
import { sendNotificationEmail } from "./resend";
import type { NotificationChannel } from "@/lib/supabase/types";

interface NotificationParams {
  userId: string;
  type: string;
  content: {
    title: string;
    body: string;
    actionUrl?: string;
  };
  channels?: NotificationChannel[];
  emailHtml?: string;
}

interface DeliveryResult {
  channel: NotificationChannel;
  success: boolean;
  error?: string;
}

function isInQuietHours(start: string | null, end: string | null): boolean {
  if (!start || !end) return false;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [startH, startM] = start.split(":").map(Number);
  const [endH, endM] = end.split(":").map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  if (startMinutes <= endMinutes) {
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  }
  // Wraps midnight (e.g., 22:00 - 07:00)
  return currentMinutes >= startMinutes || currentMinutes < endMinutes;
}

export async function sendNotification(
  params: NotificationParams
): Promise<DeliveryResult[]> {
  const admin = createAdminClient();
  const results: DeliveryResult[] = [];

  // Fetch user preferences
  const { data: prefs } = await admin
    .from("notification_preferences")
    .select(
      "preferred_channels, quiet_hours_start, quiet_hours_end, per_type_settings"
    )
    .eq("user_id", params.userId)
    .maybeSingle();

  // Check quiet hours (skip in_app, always deliver those)
  const inQuietHours = isInQuietHours(
    prefs?.quiet_hours_start ?? null,
    prefs?.quiet_hours_end ?? null
  );

  // Determine channels
  const defaultChannels: NotificationChannel[] = ["in_app", "email"];
  const preferredChannels = prefs?.preferred_channels
    ? (prefs.preferred_channels as NotificationChannel[])
    : defaultChannels;

  // Check per-type settings
  const perType = prefs?.per_type_settings as Record<
    string,
    { enabled: boolean; channels?: NotificationChannel[] }
  > | null;

  const typeSettings = perType?.[params.type];
  if (typeSettings?.enabled === false) {
    return [];
  }

  const requestedChannels = params.channels ?? preferredChannels;
  const typeChannels = typeSettings?.channels ?? requestedChannels;
  const enabledChannels = typeChannels.filter((ch) =>
    requestedChannels.includes(ch)
  );

  // Fetch user email for email channel
  let userEmail: string | undefined;
  if (enabledChannels.includes("email")) {
    const { data: userData } = await admin.auth.admin.getUserById(
      params.userId
    );
    userEmail = userData?.user?.email ?? undefined;
  }

  for (const channel of enabledChannels) {
    // Skip external channels during quiet hours
    if (inQuietHours && channel !== "in_app") {
      // Schedule for after quiet hours instead of dropping
      await admin.from("notifications").insert({
        user_id: params.userId,
        type: params.type,
        channel,
        status: "pending",
        content: params.content,
        scheduled_for: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
      });
      results.push({
        channel,
        success: true,
        error: "Scheduled (quiet hours)",
      });
      continue;
    }

    try {
      switch (channel) {
        case "in_app": {
          await admin.from("notifications").insert({
            user_id: params.userId,
            type: params.type,
            channel: "in_app",
            status: "sent",
            content: params.content,
            sent_at: new Date().toISOString(),
          });
          results.push({ channel: "in_app", success: true });
          break;
        }

        case "email": {
          if (!userEmail) {
            results.push({
              channel: "email",
              success: false,
              error: "No email address",
            });
            break;
          }

          await sendNotificationEmail({
            to: userEmail,
            subject: params.content.title,
            html:
              params.emailHtml ??
              `<h2>${params.content.title}</h2><p>${params.content.body}</p>`,
          });

          await admin.from("notifications").insert({
            user_id: params.userId,
            type: params.type,
            channel: "email",
            status: "sent",
            content: params.content,
            sent_at: new Date().toISOString(),
          });
          results.push({ channel: "email", success: true });
          break;
        }

        case "sms": {
          // SMS only for critical notification types
          const criticalTypes = ["crisis_followup", "account_security"];
          if (!criticalTypes.includes(params.type)) {
            results.push({
              channel: "sms",
              success: false,
              error: "SMS only for critical types",
            });
            break;
          }

          // SMS sending would use Twilio here but requires user phone number
          // which we don't store in profiles yet. Log as pending.
          await admin.from("notifications").insert({
            user_id: params.userId,
            type: params.type,
            channel: "sms",
            status: "pending",
            content: params.content,
          });
          results.push({ channel: "sms", success: true });
          break;
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      await admin.from("notifications").insert({
        user_id: params.userId,
        type: params.type,
        channel,
        status: "failed",
        content: params.content,
      });
      results.push({ channel, success: false, error: message });
    }
  }

  return results;
}
