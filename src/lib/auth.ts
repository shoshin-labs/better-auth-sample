import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import {
  twoFactor,
  admin,
  organization,
  anonymous,
  magicLink,
  multiSession,
} from "better-auth/plugins";
import { passkey } from "@better-auth/passkey";
import { db } from "./db";
import * as schema from "./db/schema";
import { sendEmail } from "./email/send";

// Log config on startup
console.log("[Auth Config]", {
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  hasSecret: !!process.env.BETTER_AUTH_SECRET,
  secretLength: process.env.BETTER_AUTH_SECRET?.length,
  googleConfigured: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
  githubConfigured: !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
  discordConfigured: !!(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET),
});

export const auth = betterAuth({
  appName: "Better Auth Demo",
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: [process.env.BETTER_AUTH_URL || "http://localhost:3000"],

  // Production cookie settings - Railway terminates HTTPS at edge
  // so we force secure cookies based on baseURL, not internal protocol
  advanced: {
    useSecureCookies: process.env.BETTER_AUTH_URL?.startsWith("https://") ?? false,
  },

  // Enhanced logging
  logger: {
    disabled: false,
    level: "debug",
  },

  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
      twoFactor: schema.twoFactor,
      passkey: schema.passkey,
      organization: schema.organization,
      member: schema.member,
      invitation: schema.invitation,
      team: schema.team,
      teamMember: schema.teamMember,
    },
  }),

  // Email/Password Authentication
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true in production
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Reset your password",
        template: "password-reset",
        data: { url, name: user.name },
      });
    },
  },

  // Email Verification
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Verify your email address",
        template: "email-verification",
        data: { url, name: user.name },
      });
    },
    sendOnSignUp: true,
  },

  // Social Providers (optional - configure via env vars)
  socialProviders: {
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            prompt: "select_account", // Always show account picker
          },
        }
      : {}),
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ? {
          github: {
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
          },
        }
      : {}),
    ...(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET
      ? {
          discord: {
            clientId: process.env.DISCORD_CLIENT_ID,
            clientSecret: process.env.DISCORD_CLIENT_SECRET,
          },
        }
      : {}),
  },

  // Account Linking
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "github", "discord"],
    },
  },

  // Session Configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },

  // User configuration
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "user",
      },
    },
    deleteUser: {
      enabled: true,
    },
  },

  // Auth hooks for logging
  onAPIError: {
    onError: (error) => {
      console.error("[Auth API Error]", error);
    },
  },

  // Plugins
  plugins: [
    nextCookies(),

    // Multi-session support
    multiSession(),

    // Two-Factor Authentication
    twoFactor({
      issuer: "Better Auth Demo",
      totpOptions: {
        digits: 6,
        period: 30,
      },
      otpOptions: {
        async sendOTP({ user, otp }) {
          await sendEmail({
            to: user.email,
            subject: "Your verification code",
            template: "otp",
            data: { otp, name: user.name },
          });
        },
      },
      backupCodeOptions: {
        amount: 10,
        length: 10,
      },
    }),

    // Passkey/WebAuthn
    passkey({
      rpID: process.env.PASSKEY_RP_ID || "localhost",
      rpName: process.env.PASSKEY_RP_NAME || "Better Auth Demo",
      origin: process.env.PASSKEY_ORIGIN || "http://localhost:3000",
    }),

    // Magic Link
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await sendEmail({
          to: email,
          subject: "Sign in to Better Auth Demo",
          template: "magic-link",
          data: { url },
        });
      },
      expiresIn: 60 * 10, // 10 minutes
    }),

    // Anonymous Sessions
    anonymous({
      emailDomainName: "guest.better-auth-demo.local",
    }),

    // Organization & Teams
    organization({
      async sendInvitationEmail(data) {
        const inviteLink = `${process.env.BETTER_AUTH_URL}/organizations/invite/${data.id}`;
        await sendEmail({
          to: data.email,
          subject: `You've been invited to join ${data.organization.name}`,
          template: "org-invitation",
          data: {
            inviteLink,
            organizationName: data.organization.name,
            inviterName: data.inviter.user.name,
            role: data.role,
          },
        });
      },
      teams: {
        enabled: true,
      },
      creatorRole: "owner",
      invitationExpiresIn: 60 * 60 * 48, // 48 hours
    }),

    // Admin Plugin
    admin({
      defaultRole: "user",
      adminRoles: ["admin"],
      impersonationSessionDuration: 60 * 60, // 1 hour
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
