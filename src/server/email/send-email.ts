import nodemailer from "nodemailer";

const googleEmail = process.env.GOOGLE_EMAIL;
const googleAppPassword = process.env.GOOGLE_APP_PASSWORD;

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export async function sendEmail({ to, subject, html, text }: SendEmailInput) {
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
