# Better Auth Demo

A comprehensive demonstration of [Better Auth](https://better-auth.com) features built with Next.js 15, TypeScript, Tailwind CSS, and PostgreSQL.

## Features

- **Email/Password Authentication** - Classic sign up/sign in with email verification and password reset
- **Social OAuth** - Google, GitHub, and Discord integration (optional)
- **Magic Links** - Passwordless authentication via email
- **Passkeys** - WebAuthn/FIDO2 biometric authentication
- **Two-Factor Auth** - TOTP (authenticator apps), Email OTP, and backup codes
- **Organizations** - Multi-tenant support with teams and role-based access
- **Anonymous Sessions** - Guest mode with account linking
- **Admin Dashboard** - User management, ban/unban, and impersonation

## Prerequisites

- Node.js 18+ or Bun
- Docker and Docker Compose
- (Optional) OAuth credentials for Google, GitHub, Discord

## Quick Start

### 1. Start the Database

```bash
docker-compose up -d
```

This starts PostgreSQL on port 5432.

### 2. Create Environment File

Create a `.env.local` file in the project root:

```bash
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/better_auth_demo"

# Better Auth
BETTER_AUTH_SECRET="your-32-character-secret-here-minimum"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# OAuth Providers (optional - app works without these)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
DISCORD_CLIENT_ID=""
DISCORD_CLIENT_SECRET=""

# Passkey Configuration
PASSKEY_RP_ID="localhost"
PASSKEY_RP_NAME="Better Auth Demo"
PASSKEY_ORIGIN="http://localhost:3000"
```

### 3. Install Dependencies

```bash
bun install
```

### 4. Run Migrations (if not already done)

```bash
bun run db:migrate
```

### 5. Start the Dev Server

```bash
bun run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the app.

## Testing Features

### Basic Auth
1. Go to `/sign-up` and create an account
2. Sign in at `/sign-in`
3. Check the console for email verification links (emails are logged in dev mode)

### Security Features
1. Go to `/security` from the dashboard
2. Enable Two-Factor Authentication with an authenticator app
3. Register a Passkey for biometric login

### Organizations
1. Go to `/organizations` and create an organization
2. Invite team members via email
3. Create teams within the organization

### Admin Features
To access admin features:
1. Sign in with any account
2. Manually update your user role in the database:
   ```sql
   UPDATE "user" SET role = 'admin' WHERE email = 'your@email.com';
   ```
3. Access `/admin` to manage users

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Sign-in, sign-up, forgot-password, etc.
│   ├── (dashboard)/      # Protected user routes
│   ├── (admin)/          # Admin-only routes
│   ├── api/auth/         # Better Auth API routes
│   └── page.tsx          # Landing page
├── components/
│   ├── auth/             # Auth forms and buttons
│   ├── layout/           # Navbar, user menu, etc.
│   ├── organizations/    # Organization components
│   └── ui/               # shadcn/ui components
├── lib/
│   ├── auth.ts           # Server-side auth config
│   ├── auth-client.ts    # Client-side auth
│   ├── db/               # Drizzle ORM setup
│   └── email/            # Email sending (console in dev)
└── middleware.ts         # Route protection
```

## Database Connection

To connect to the PostgreSQL database (e.g., using VS Code SQLTools, pgAdmin, or any database client):

| Setting | Value |
|---------|-------|
| Host | `localhost` |
| Port | `5432` |
| Database | `better_auth_demo` |
| Username | `postgres` |
| Password | `postgres` |
| SSL | Disabled |

**Connection string:** `postgresql://postgres:postgres@localhost:5432/better_auth_demo`

You can also use Drizzle Studio for a web-based UI:
```bash
bun run db:studio
```

## Database Schema

The schema includes tables for:
- `user` - User accounts
- `session` - Active sessions
- `account` - OAuth accounts and credentials
- `verification` - Email verification tokens
- `two_factor` - 2FA secrets and backup codes
- `passkey` - WebAuthn credentials
- `organization` - Organizations
- `member` - Organization memberships
- `invitation` - Pending invitations
- `team` - Teams within organizations
- `team_member` - Team memberships

## Scripts

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run start` - Start production server
- `bun run db:generate` - Generate migrations
- `bun run db:migrate` - Apply migrations
- `bun run db:studio` - Open Drizzle Studio

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Auth**: Better Auth
- **Database**: PostgreSQL + Drizzle ORM
- **Styling**: Tailwind CSS + shadcn/ui
- **Forms**: React Hook Form + Zod
- **State**: TanStack Query

## License

MIT
