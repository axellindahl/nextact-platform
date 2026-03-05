import { z } from "zod";

export const notificationChannelSchema = z.enum(["in_app", "email", "sms"]);

export const notificationPreferencesSchema = z.object({
  preferred_channels: z.array(notificationChannelSchema).min(1),
  quiet_hours_start: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Format: HH:MM")
    .nullable()
    .optional(),
  quiet_hours_end: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Format: HH:MM")
    .nullable()
    .optional(),
  per_type_settings: z
    .record(
      z.string(),
      z.object({
        enabled: z.boolean(),
        channels: z.array(notificationChannelSchema).optional(),
      })
    )
    .optional(),
});

export type NotificationPreferencesInput = z.infer<
  typeof notificationPreferencesSchema
>;
