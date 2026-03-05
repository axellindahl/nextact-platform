import { emailLayout, ctaButton } from "./layout";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://nextact.se";

export function welcomeEmailHtml(name: string): string {
  const content = `
    <h2 style="margin:0 0 16px;font-family:'Montserrat',Helvetica,Arial,sans-serif;font-size:20px;font-weight:700;color:#1A2332;">
      V\u00E4lkommen till Next Act, ${name}!
    </h2>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#3D4A5C;">
      Du har tagit det f\u00F6rsta steget mot att bygga mental styrka som idrottare.
      V\u00E5rt program bygger p\u00E5 ACT (Acceptance and Commitment Therapy)
      \u2014 samma metoder som anv\u00E4nds av elit\u00ADidrottare v\u00E4rlden \u00F6ver.
    </p>
    <p style="margin:0 0 8px;font-size:15px;line-height:1.6;color:#3D4A5C;">
      <strong>S\u00E5 h\u00E4r kommer du ig\u00E5ng:</strong>
    </p>
    <ol style="margin:0 0 16px;padding-left:20px;font-size:15px;line-height:1.8;color:#3D4A5C;">
      <li>B\u00F6rja med modul 1: <strong>V\u00E4rderingar</strong></li>
      <li>Jobba igenom lektionerna i din egen takt</li>
      <li>Anv\u00E4nd AI-coachen f\u00F6r st\u00F6d l\u00E4ngs v\u00E4gen</li>
    </ol>
    ${ctaButton("G\u00E5 till din dashboard", `${APP_URL}/dashboard`)}
    <p style="margin:0;font-size:14px;color:#8B95A5;">
      Lycka till med din mentala tr\u00E4ning!
    </p>`;

  return emailLayout(content);
}
