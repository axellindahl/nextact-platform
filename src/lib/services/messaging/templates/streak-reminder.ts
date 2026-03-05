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
      Din streak \u00E4r p\u00E5 v\u00E4g att brytas!
    </h2>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#3D4A5C;">
      Hej ${params.name}, du har en streak p\u00E5 <strong>${params.currentStreak} dagar</strong>
      \u2014 imponerande! Missa inte att forts\u00E4tta idag.
    </p>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#3D4A5C;">
      Bara n\u00E5gra minuter r\u00E4cker f\u00F6r att h\u00E5lla din streak vid liv.
      Varje dag du \u00F6var bygger du mental styrka.
    </p>
    ${ctaButton("Forts\u00E4tt din lektion", lessonHref)}
    <p style="margin:0;font-size:14px;color:#8B95A5;">
      Kom ih\u00E5g: konsistens sl\u00E5r perfektion.
    </p>`;

  return emailLayout(content);
}
