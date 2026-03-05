import { emailLayout } from "./layout";

export function paymentReceiptHtml(params: {
  name: string;
  planName: string;
  amount: string;
  currency: string;
  nextBillingDate: string;
  isRenewal: boolean;
}): string {
  const heading = params.isRenewal
    ? "Prenumeration f\u00F6rnyad"
    : "Prenumeration bekr\u00E4ftad";

  const content = `
    <h2 style="margin:0 0 16px;font-family:'Montserrat',Helvetica,Arial,sans-serif;font-size:20px;font-weight:700;color:#1A2332;">
      ${heading}
    </h2>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#3D4A5C;">
      Tack, ${params.name}! H\u00E4r \u00E4r ditt kvitto.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;border:1px solid #E8EBF0;border-radius:8px;overflow:hidden;">
      <tr>
        <td style="padding:12px 16px;font-size:14px;color:#8B95A5;border-bottom:1px solid #E8EBF0;">Plan</td>
        <td style="padding:12px 16px;font-size:14px;font-weight:600;color:#1A2332;text-align:right;border-bottom:1px solid #E8EBF0;">
          Next Act ${params.planName}
        </td>
      </tr>
      <tr>
        <td style="padding:12px 16px;font-size:14px;color:#8B95A5;border-bottom:1px solid #E8EBF0;">Belopp</td>
        <td style="padding:12px 16px;font-size:14px;font-weight:600;color:#1A2332;text-align:right;border-bottom:1px solid #E8EBF0;">
          ${params.amount} ${params.currency}
        </td>
      </tr>
      <tr>
        <td style="padding:12px 16px;font-size:14px;color:#8B95A5;">N\u00E4sta fakturering</td>
        <td style="padding:12px 16px;font-size:14px;font-weight:600;color:#1A2332;text-align:right;">
          ${params.nextBillingDate}
        </td>
      </tr>
    </table>
    <p style="margin:0;font-size:13px;color:#8B95A5;line-height:1.5;">
      Har du fr\u00E5gor om din prenumeration? Kontakta oss p\u00E5
      <a href="mailto:support@nextact.se" style="color:#2670E6;text-decoration:none;">support@nextact.se</a>.
    </p>`;

  return emailLayout(content);
}
