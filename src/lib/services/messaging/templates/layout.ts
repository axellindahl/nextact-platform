const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://nextact.se";

export function emailLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Next Act</title>
</head>
<body style="margin:0;padding:0;background-color:#F7F8FA;font-family:'Source Sans Pro',Helvetica,Arial,sans-serif;color:#1A2332;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F7F8FA;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#FFFFFF;border-radius:12px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background-color:#2670E6;padding:24px 32px;">
              <h1 style="margin:0;font-family:'Montserrat',Helvetica,Arial,sans-serif;font-size:22px;font-weight:700;color:#FFFFFF;letter-spacing:-0.3px;">
                Next Act
              </h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:32px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;border-top:1px solid #E8EBF0;">
              <p style="margin:0;font-size:12px;color:#8B95A5;line-height:1.5;">
                Next Act \u2014 Mental tr\u00E4ning f\u00F6r idrottare<br />
                <a href="${APP_URL}/profil/notifikationer" style="color:#8B95A5;text-decoration:underline;">Hantera notifikationer</a>
                &nbsp;\u00B7&nbsp;
                <a href="${APP_URL}/avregistrera" style="color:#8B95A5;text-decoration:underline;">Avprenumerera</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function ctaButton(text: string, href: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
  <tr>
    <td style="background-color:#2670E6;border-radius:48px;padding:14px 32px;">
      <a href="${href}" style="font-family:'Montserrat',Helvetica,Arial,sans-serif;font-size:15px;font-weight:600;color:#FFFFFF;text-decoration:none;display:inline-block;">
        ${text}
      </a>
    </td>
  </tr>
</table>`;
}
