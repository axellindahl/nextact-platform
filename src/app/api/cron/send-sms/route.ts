import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendCriticalSMS } from "@/lib/services/messaging/twilio";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const now = new Date().toISOString();

  // TODO: sms_queue not yet in generated types — regenerate after migration
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: pending, error } = await (supabase as any)
    .from("sms_queue")
    .select("*")
    .eq("status", "pending")
    .lte("scheduled_for", now)
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let sent = 0;
  let failed = 0;

  for (const sms of (pending as {
    id: string;
    phone_number: string;
    message: string;
  }[]) ?? []) {
    try {
      await sendCriticalSMS({ to: sms.phone_number, message: sms.message });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("sms_queue")
        .update({ status: "sent", sent_at: new Date().toISOString() })
        .eq("id", sms.id);
      sent++;
    } catch {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("sms_queue")
        .update({ status: "failed", error_message: "Send failed" })
        .eq("id", sms.id);
      failed++;
    }
  }

  return NextResponse.json({ sent, failed });
}
