import twilio from "twilio";

export function getTwilioClient() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) throw new Error("Twilio credentials not set");
  return twilio(sid, token);
}

export async function sendCriticalSMS(params: { to: string; message: string }) {
  const client = getTwilioClient();
  return client.messages.create({
    body: params.message,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: params.to,
  });
}
