"use client";

import { createAuthClient } from "better-auth/react";
import {
  twoFactorClient,
  adminClient,
  organizationClient,
  anonymousClient,
  magicLinkClient,
  multiSessionClient,
} from "better-auth/client/plugins";
import { passkeyClient } from "@better-auth/passkey/client";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  plugins: [
    twoFactorClient({
      onTwoFactorRedirect() {
        window.location.href = "/two-factor";
      },
    }),
    passkeyClient(),
    magicLinkClient(),
    anonymousClient(),
    organizationClient(),
    adminClient(),
    multiSessionClient(),
  ],
});

// Export typed hooks and methods
export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
  // Two-factor
  twoFactor,
  // Passkey
  passkey,
  // Magic Link
  magicLink,
  // Anonymous
  anonymous,
  // Organization
  organization,
  useActiveOrganization,
  useListOrganizations,
  // Admin
  admin,
  // Session management
  listSessions,
  revokeSession,
  revokeOtherSessions,
  // User
  updateUser,
  changePassword,
  // Multi-session
  multiSession,
} = authClient;
