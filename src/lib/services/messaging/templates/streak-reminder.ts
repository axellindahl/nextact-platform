import { emailLayout, ctaButton } from "./layout";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://nextact.se";

export function streakReminderHtml(params: {
  name: string;
  currentStreak: number;
  lessonUrl?: string;
}): string {
  const lessonHref = params.lessonUrl
    ? `${APP_URL}${params.lessonUrl}`
    : `${APP_URL}/dashboard`;

  const content = `
    <h2 style="margin:0 0 16px;font-family:'Montserrat',Helvetica,Arial,sans-serif;font-size:20px;font-weight:700;color:#1A2332;">
      Din streak är på väg att brytas!
    </h2>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#3D4A5C;">
      Hej ${params.name}, du har en streak på <strong>${params.currentStreak} dagar</strong>
      — imponerande! Missa inte att fortsätta idag.
    </p>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#3D4A5C;">
      Bara några minuter räcker för att hålla din streak vid liv.
      Varje dag du övar bygger du mental styrka.
    </p>
    ${ctaButton("Fortsätt din lektion", lessonHref)}
    <p style="margin:0;font-size:14px;color:#8B95A5;">
      Kom ihåg: konsistens slår perfektion.
    </p>`;

  return emailLayout(content);
}
