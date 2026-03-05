import { Resend } from "resend";

export function getResendClient() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set");
  return new Resend(key);
}

export async function sendWelcomeEmail(params: { to: string; name: string }) {
  const resend = getResendClient();
  return resend.emails.send({
    from: "Next Act <noreply@nextact.se>",
    to: params.to,
    subject: "Välkommen till Next Act!",
    html: `<h1>Välkommen, ${params.name}!</h1><p>Du har tagit det första steget mot mental styrka.</p>`,
  });
}

export async function sendNotificationEmail(params: {
  to: string;
  subject: string;
  html: string;
}) {
  const resend = getResendClient();
  return resend.emails.send({
    from: "Next Act <noreply@nextact.se>",
    to: params.to,
    subject: params.subject,
    html: params.html,
  });
}
