import { emailLayout, ctaButton } from "./layout";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://nextact.se";

export function welcomeEmailHtml(name: string): string {
  const content = `
    <h2 style="margin:0 0 16px;font-family:'Montserrat',Helvetica,Arial,sans-serif;font-size:20px;font-weight:700;color:#1A2332;">
      Välkommen till Next Act, ${name}!
    </h2>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#3D4A5C;">
      Du har tagit det första steget mot att bygga mental styrka som idrottare.
      Vårt program bygger på ACT (Acceptance and Commitment Therapy)
      — samma metoder som används av elit­idrottare världen över.
    </p>
    <p style="margin:0 0 8px;font-size:15px;line-height:1.6;color:#3D4A5C;">
      <strong>Så här kommer du igång:</strong>
    </p>
    <ol style="margin:0 0 16px;padding-left:20px;font-size:15px;line-height:1.8;color:#3D4A5C;">
      <li>Börja med modul 1: <strong>Värderingar</strong></li>
      <li>Jobba igenom lektionerna i din egen takt</li>
      <li>Använd AI-coachen för stöd längs vägen</li>
    </ol>
    ${ctaButton("Gå till din dashboard", `${APP_URL}/dashboard`)}
    <p style="margin:0;font-size:14px;color:#8B95A5;">
      Lycka till med din mentala träning!
    </p>`;

  return emailLayout(content);
}
