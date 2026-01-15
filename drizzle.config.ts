import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Load .env.local for local development (drizzle-kit doesn't auto-load it)
// In production/CI, DATABASE_URL is set as an environment variable
config({ path: ".env.local" });

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
