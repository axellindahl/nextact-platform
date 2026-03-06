import { createAdminClient } from "@/lib/supabase/admin";

type SmsType = "module_complete" | "vaga_lista" | "gameplan";

export async function scheduleModuleSms({
  userId,
  message,
  type,
  moduleNumber,
}: {
  userId: string;
  message: string;
  type: SmsType;
  moduleNumber: number;
}) {
  const supabase = createAdminClient();

  // TODO: phone_number and training_schedule not yet in generated types — regenerate after migration
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from("profiles")
    .select("phone_number, training_schedule")
    .eq("id", userId)
    .single();

  if (!profile?.phone_number) return;

  const phoneNumber = profile.phone_number as string;
  const schedule = (profile.training_schedule ?? []) as {
    day: string;
    time: string;
  }[];

  let scheduledFor: Date;

  if (type === "vaga_lista" || type === "gameplan" || schedule.length === 0) {
    scheduledFor = new Date();
  } else {
    scheduledFor = getNextTrainingMinus1Hour(schedule);
  }

  // TODO: sms_queue not yet in generated types — regenerate after migration
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from("sms_queue").insert({
    user_id: userId,
    phone_number: phoneNumber,
    message,
    scheduled_for: scheduledFor.toISOString(),
    trigger_type: type,
    module_number: moduleNumber,
    status: "pending",
  });
}

function getNextTrainingMinus1Hour(
  schedule: { day: string; time: string }[]
): Date {
  const dayOrder = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const now = new Date();
  const nowDay = now.getDay();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  let best: Date | null = null;

  for (const entry of schedule) {
    const entryDay = dayOrder.indexOf(entry.day);
    if (entryDay === -1) continue;
    const [h, m] = entry.time.split(":").map(Number);
    const trainingMinutes = h * 60 + m;
    const sendMinutes = trainingMinutes - 60;

    let daysUntil = (entryDay - nowDay + 7) % 7;
    if (daysUntil === 0 && sendMinutes <= nowMinutes) {
      daysUntil = 7;
    }

    const candidate = new Date(now);
    candidate.setDate(now.getDate() + daysUntil);
    candidate.setHours(Math.floor(sendMinutes / 60), sendMinutes % 60, 0, 0);

    if (!best || candidate < best) best = candidate;
  }

  return best ?? new Date();
}
