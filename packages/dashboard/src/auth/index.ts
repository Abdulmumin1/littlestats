// Better-Auth configuration for Cloudflare Workers + D1 using Drizzle ORM
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../db/schema";
import type { Env } from "../types";

export function createAuth(env: Env) {
  // Validate required environment variables
  if (!env.BETTER_AUTH_SECRET) {
    throw new Error("BETTER_AUTH_SECRET is required");
  }
  if (!env.BETTER_AUTH_URL) {
    throw new Error("BETTER_AUTH_URL is required");
  }

  // Create Drizzle database instance
  const db = drizzle(env.DB, { schema });

  return betterAuth({
    // Use environment variables for secret and baseURL
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    basePath: "/api/auth",
    
    // Database adapter using Drizzle
    database: drizzleAdapter(db, {
      provider: "sqlite",
      schema: {
        user: schema.users,
        session: schema.sessions,
        account: schema.accounts,
        verification: schema.verifications,
      },
    }),
    
    // Social providers (only enable if credentials are provided)
    socialProviders: {
      google: env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET ? {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      } : undefined,
      github: env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET ? {
        clientId: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
      } : undefined,
    },
    
    // Session configuration - MUST store in database for persistence
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // 1 day
      storeSessionInDatabase: true, // Required for session persistence
    },
    
    // Advanced configuration for cross-domain cookies
    advanced: {
      crossSubDomainCookies: {
        enabled: true,
      },
      defaultCookieAttributes: {
        secure: false, // Allow http for localhost
        httpOnly: true,
        sameSite: "lax", // Allow redirects between domains
        path: "/",
      },
    },
    
    // Trusted origins for CSRF protection
    trustedOrigins: [
      "http://localhost:5173",    // Frontend dev server
      "http://localhost:8787",    // Worker dev server
      "http://localhost:3000",    // Alternative frontend port
      "https://littlestats.click",
      "https://www.littlestats.click",
    ],
  });
}
