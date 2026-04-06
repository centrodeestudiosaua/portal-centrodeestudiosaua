type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
};

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://portal-centrodeestudiosaua.vercel.app";
}

export function renderPortalEmail(input: {
  preview: string;
  title: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
}) {
  const { preview, title, body, ctaLabel, ctaUrl } = input;

  return `
    <!doctype html>
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title}</title>
      </head>
      <body style="margin:0;padding:0;background:#f5f3ee;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1a1a35;">
        <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preview}</div>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f3ee;padding:32px 16px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border:1px solid #e7dfd2;border-radius:24px;overflow:hidden;">
                <tr>
                  <td style="background:#1a1a35;padding:28px 32px;text-align:center;">
                    <div style="font-size:34px;font-weight:800;letter-spacing:0.18em;color:#e5c56a;">AUA</div>
                    <div style="margin-top:8px;font-size:11px;font-weight:700;letter-spacing:0.24em;text-transform:uppercase;color:#ffffffb3;">Centro de Estudios Juridicos</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:36px 32px;">
                    <div style="font-size:11px;font-weight:800;letter-spacing:0.24em;text-transform:uppercase;color:#911a26;">Portal del Alumno</div>
                    <h1 style="margin:16px 0 0;font-size:34px;line-height:1.1;color:#1a1a35;">${title}</h1>
                    <p style="margin:18px 0 0;font-size:16px;line-height:1.8;color:#4f5368;">${body}</p>
                    <div style="margin-top:32px;">
                      <a href="${ctaUrl}" style="display:inline-block;background:#911a26;color:#ffffff;text-decoration:none;font-weight:800;font-size:12px;letter-spacing:0.2em;text-transform:uppercase;padding:16px 22px;border-radius:14px;">
                        ${ctaLabel}
                      </a>
                    </div>
                    <p style="margin:28px 0 0;font-size:13px;line-height:1.8;color:#6d7185;">
                      Si el boton no funciona, copia y pega esta direccion en tu navegador:<br />
                      <a href="${ctaUrl}" style="color:#1a1a35;word-break:break-all;">${ctaUrl}</a>
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 32px 28px;">
                    <div style="border-top:1px solid #ece5da;padding-top:20px;font-size:12px;line-height:1.7;color:#7b7f91;">
                      Este correo fue enviado por ${getBaseUrl().replace(/^https?:\/\//, "")}. Si necesitas ayuda, responde a este mensaje o contacta a soporte.
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

export async function sendTransactionalEmail(input: SendEmailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    throw new Error("Missing Resend configuration");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject: input.subject,
      html: input.html,
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Resend error: ${message}`);
  }

  return response.json();
}
