import { sendEmail } from "@/server/email/send-email";

type SendVerificationEmailInput = {
  user: {
    email: string;
    name: string;
  };
  url: string;
};

export async function sendVerificationEmail({
  user,
  url,
}: SendVerificationEmailInput) {
  await sendEmail({
    to: user.email,
    subject: "Verify your TradeMirror email",
    text: `Verify your TradeMirror email by opening this link: ${url}`,
    html: getVerificationEmailHtml({
      name: user.name,
      url,
    }),
  });
}

function getVerificationEmailHtml({ name, url }: { name: string; url: string }) {
  return `
    <div style="font-family:Arial,sans-serif;background:#050816;color:#f9fafb;padding:32px">
      <div style="max-width:560px;margin:0 auto;background:#0b1020;border:1px solid #1f2937;border-radius:12px;padding:24px">
        <h1 style="margin:0 0 12px;font-size:22px">Verify your TradeMirror email</h1>
        <p style="color:#9ca3af;line-height:1.6">Hi ${name}, confirm this email address to access the simulated trading workspace.</p>
        <a href="${url}" style="display:inline-block;margin-top:16px;background:#22d3ee;color:#020617;text-decoration:none;font-weight:700;padding:12px 16px;border-radius:8px">Verify email</a>
        <p style="color:#9ca3af;font-size:12px;line-height:1.6;margin-top:20px">TradeMirror is a copy trading simulation platform. No real financial operations are performed.</p>
      </div>
    </div>
  `;
}
