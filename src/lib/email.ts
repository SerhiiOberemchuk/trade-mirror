import nodemailer from "nodemailer";

const googleEmail = process.env.GOOGLE_EMAIL;
const googleAppPassword = process.env.GOOGLE_APP_PASSWORD;

export const isEmailConfigured = Boolean(googleEmail && googleAppPassword);

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  if (!googleEmail || !googleAppPassword) {
    throw new Error("Google email SMTP credentials are not configured.");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: googleEmail,
      pass: googleAppPassword,
    },
  });

  await transporter.sendMail({
    from: `"TradeMirror" <${googleEmail}>`,
    to,
    subject,
    html,
    text,
  });
}
