import { db, schema } from "@/db";
import { AUTH_PASSWORD_POLICY } from "@/lib/auth-password-policy";
import { sendVerificationEmail } from "@/server/auth/verification-email";
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
    minPasswordLength: AUTH_PASSWORD_POLICY.minLength,
    maxPasswordLength: AUTH_PASSWORD_POLICY.maxLength,
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail,
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
