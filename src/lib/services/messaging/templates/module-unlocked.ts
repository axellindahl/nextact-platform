import { emailLayout, ctaButton } from "./layout";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://nextact.se";

export function moduleUnlockedHtml(params: {
  name: string;
  moduleName: string;
  moduleDescription: string;
  moduleId: string;
}): string {
  const content = `
    <h2 style="margin:0 0 16px;font-family:'Montserrat',Helvetica,Arial,sans-serif;font-size:20px;font-weight:700;color:#1A2332;">
      Ny modul uppl\u00E5st: ${params.moduleName}
    </h2>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#3D4A5C;">
      Bra jobbat, ${params.name}! Du har l\u00E5st upp en ny modul i ditt mentala tr\u00E4ningsprogram.
    </p>
    <div style="margin:0 0 24px;padding:16px;background-color:#F0F5FF;border-radius:8px;border-left:4px solid #2670E6;">
      <p style="margin:0 0 4px;font-family:'Montserrat',Helvetica,Arial,sans-serif;font-size:16px;font-weight:600;color:#1A2332;">
        ${params.moduleName}
      </p>
      <p style="margin:0;font-size:14px;line-height:1.5;color:#3D4A5C;">
        ${params.moduleDescription}
      </p>
    </div>
    ${ctaButton("B\u00F6rja modulen", `${APP_URL}/learn/${params.moduleId}`)}`;

  return emailLayout(content);
}
