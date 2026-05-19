import { db, schema } from "@/db";
import { sendEmail } from "@/lib/email";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  plugins: [
    admin(),
    nextCookies(),
  ],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    async sendVerificationEmail({ user, url }) {
      await sendEmail({
        to: user.email,
        subject: "Verify your TradeMirror email",
        text: `Verify your TradeMirror email by opening this link: ${url}`,
        html: `
          <div style="font-family:Arial,sans-serif;background:#050816;color:#f9fafb;padding:32px">
            <div style="max-width:560px;margin:0 auto;background:#0b1020;border:1px solid #1f2937;border-radius:12px;padding:24px">
              <h1 style="margin:0 0 12px;font-size:22px">Verify your TradeMirror email</h1>
              <p style="color:#9ca3af;line-height:1.6">Hi ${user.name}, confirm this email address to access the simulated trading workspace.</p>
              <a href="${url}" style="display:inline-block;margin-top:16px;background:#22d3ee;color:#020617;text-decoration:none;font-weight:700;padding:12px 16px;border-radius:8px">Verify email</a>
              <p style="color:#9ca3af;font-size:12px;line-height:1.6;margin-top:20px">TradeMirror is a copy trading simulation platform. No real financial operations are performed.</p>
            </div>
          </div>
        `,
      });
    },
  },
  socialProviders:
    googleClientId && googleClientSecret
      ? {
          google: {
            enabled: true,
            clientId: googleClientId,
            clientSecret: googleClientSecret,
          },
        }
      : undefined,
});
