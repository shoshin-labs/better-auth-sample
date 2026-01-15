# Deploying to Railway

This guide walks you through deploying this Better Auth application to Railway.

## Prerequisites

- A [Railway](https://railway.app) account
- The [Railway CLI](https://docs.railway.app/develop/cli) (optional, for running migrations manually)

## Step 1: Create a New Project

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Connect your GitHub account and select this repository

## Step 2: Add a PostgreSQL Database

1. In your Railway project, click **"+ New"**
2. Select **"Database"** → **"PostgreSQL"**
3. Railway will automatically provision the database

## Step 3: Configure Environment Variables

1. Click on your service (the web app, not the database)
2. Go to the **"Variables"** tab
3. Add the following required variables:

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Click "Add Reference" and select the PostgreSQL `DATABASE_URL` | Auto-filled by Railway |
| `BETTER_AUTH_SECRET` | Generate with `openssl rand -base64 32` | `your-random-secret` |
| `BETTER_AUTH_URL` | Your Railway app URL | `https://your-app.up.railway.app` |
| `NEXT_PUBLIC_APP_URL` | Same as `BETTER_AUTH_URL` | `https://your-app.up.railway.app` |

### Optional Variables (for full functionality)

| Variable | Description |
|----------|-------------|
| `RESEND_API_KEY` | For sending emails (get from [Resend](https://resend.com)) |
| `EMAIL_FROM` | Sender email address |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth client secret |
| `DISCORD_CLIENT_ID` | Discord OAuth client ID |
| `DISCORD_CLIENT_SECRET` | Discord OAuth client secret |
| `PASSKEY_RP_ID` | Your domain (e.g., `your-app.up.railway.app`) |
| `PASSKEY_ORIGIN` | Full URL (e.g., `https://your-app.up.railway.app`) |

> **Note:** OAuth callback URLs must be configured in each provider's console:
> - Google: `https://your-app.up.railway.app/api/auth/callback/google`
> - GitHub: `https://your-app.up.railway.app/api/auth/callback/github`
> - Discord: `https://your-app.up.railway.app/api/auth/callback/discord`

## Step 4: Deploy

Railway automatically deploys when you push to your connected branch. The deployment will:

1. Build the Next.js application
2. Run database migrations automatically on start
3. Start the production server

## Running Migrations Manually

If you need to run migrations manually (e.g., after a schema change), you have several options:

### Option A: Using Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Link to your project
railway link

# Run migrations
railway run npm run db:migrate
```

### Option B: Using Railway Dashboard

1. Go to your service in Railway
2. Click the **"Shell"** tab
3. Run:
   ```bash
   npm run db:migrate
   ```

### Option C: Trigger a Redeploy

Since migrations run automatically on startup, you can simply trigger a redeploy:

1. Go to **Deployments** tab
2. Click **"Redeploy"** on the latest deployment

## Generating a Secure Secret

Generate a secure `BETTER_AUTH_SECRET` using one of these methods:

```bash
# Using OpenSSL
openssl rand -base64 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Troubleshooting

### Database Connection Issues

- Ensure `DATABASE_URL` is properly set (use Railway's variable reference)
- Check that the PostgreSQL service is running

### Build Failures

- Check the build logs in Railway dashboard
- Ensure all dependencies are in `package.json`

### Migration Failures

- Check if the database is accessible
- Review migration files in `/drizzle` folder
- Try running migrations manually via Railway Shell

### OAuth Not Working

- Verify callback URLs are correct in provider consoles
- Ensure `BETTER_AUTH_URL` matches your actual Railway URL
- Check that client ID and secret are correct

## Custom Domain (Optional)

1. Go to your service **Settings**
2. Under **Domains**, click **"+ Custom Domain"**
3. Add your domain and configure DNS as instructed
4. Update `BETTER_AUTH_URL`, `NEXT_PUBLIC_APP_URL`, and Passkey variables to use your custom domain

## Monitoring

- View logs in the **Deployments** tab
- Monitor database in the PostgreSQL service panel
- Set up alerts in Railway project settings
