# Better Auth Demo

A comprehensive demonstration of [Better Auth](https://better-auth.com) features built with Next.js 16, TypeScript, Tailwind CSS, and PostgreSQL.

## Features

- **Email/Password Authentication** - Classic sign up/sign in with email verification and password reset
- **Social OAuth** - Google, GitHub, and Discord integration (optional)
- **Magic Links** - Passwordless authentication via email
- **Passkeys** - WebAuthn/FIDO2 biometric authentication
- **Two-Factor Auth** - TOTP (authenticator apps), Email OTP, and backup codes
- **Organizations** - Multi-tenant support with teams and role-based access
- **Anonymous Sessions** - Guest mode with account linking
- **Multi-Session Support** - Manage multiple active sessions per user
- **Admin Dashboard** - User management, ban/unban, and impersonation

## Prerequisites

- Node.js 18+ (or Bun 1.0+)
- Docker and Docker Compose
- (Optional) OAuth credentials for Google, GitHub, Discord
- (Optional) [Resend](https://resend.com) API key for real emails

## Quick Start

### 1. Clone and Navigate

```bash
git clone <repository-url>
cd better-auth-sample
```

### 2. Start the Database

```bash
docker-compose up -d
```

This starts PostgreSQL 16 on port 5432. Wait a few seconds for it to be ready.

### 3. Create Environment File

Create a `.env.local` file in the project root:

```bash
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/better_auth_demo"

# Better Auth (REQUIRED)
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

# Email (optional - emails are logged to console if not configured)
RESEND_API_KEY=""
EMAIL_FROM="Better Auth Demo <onboarding@resend.dev>"
```

> **Tip:** Generate a secure secret with: `openssl rand -base64 32`

### 4. Install Dependencies

Using Bun (recommended):
```bash
bun install
```

Or using npm:
```bash
npm install
```

### 5. Run Database Migrations

Using Bun:
```bash
bun run db:migrate
```

Or using npm:
```bash
npm run db:migrate
```

### 6. Start the Dev Server

Using Bun:
```bash
bun run dev
```

Or using npm:
```bash
npm run dev
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

### Drizzle Studio

For a web-based database UI:
```bash
bun run db:studio
```

### Docker Commands

```bash
# Start database
docker-compose up -d

# Stop database (keeps data)
docker-compose stop

# Stop and remove containers (keeps data in volume)
docker-compose down

# Stop and delete all data
docker-compose down -v
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

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development server |
| `bun run build` | Build for production |
| `bun run start` | Start production server |
| `bun run lint` | Run ESLint |
| `bun run db:generate` | Generate new migrations from schema changes |
| `bun run db:migrate` | Apply pending migrations |
| `bun run db:studio` | Open Drizzle Studio (web UI for database) |

> **Note:** Replace `bun` with `npm` if using npm.

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker-compose ps

# View PostgreSQL logs
docker-compose logs postgres

# Restart the database
docker-compose down && docker-compose up -d
```

### Migration Errors

If migrations fail, ensure:
1. The database is running (`docker-compose ps`)
2. `DATABASE_URL` in `.env.local` is correct
3. Run `bun run db:generate` if you've modified the schema

### Auth Errors

- **"Invalid secret"**: Ensure `BETTER_AUTH_SECRET` is at least 32 characters
- **OAuth redirect errors**: Verify `BETTER_AUTH_URL` matches your OAuth provider's callback URL
- **Session issues**: Clear browser cookies and try again

### Email Not Working

In development, all emails are logged to the terminal console. Look for the `EMAIL SENT` block with verification links and OTP codes.

For production emails, configure `RESEND_API_KEY` and `EMAIL_FROM` in your environment variables.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Auth**: Better Auth v1.4+
- **Database**: PostgreSQL 16 + Drizzle ORM
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Forms**: React Hook Form + Zod
- **State**: TanStack Query

## Development Notes

### Email Verification

Email verification is **disabled** by default for easier local development. To enable it, set `requireEmailVerification: true` in `src/lib/auth.ts`.

### Session Configuration

- Sessions expire after 7 days of inactivity
- Session tokens are refreshed daily
- Cookie caching is enabled (5 minute TTL)

### Account Linking

Users can link multiple OAuth providers to the same account. Trusted providers (Google, GitHub, Discord) are automatically linked if the email matches.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT
