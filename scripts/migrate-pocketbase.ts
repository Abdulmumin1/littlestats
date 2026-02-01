#!/usr/bin/env tsx
/**
 * PocketBase to Better-Auth Migration Script
 * 
 * This script migrates users, domains (sites), and subscriptions from PocketBase
 * to the new better-auth + D1 architecture.
 * 
 * Usage:
 *   export PB_URL="https://your-pocketbase.com"
 *   export PB_ADMIN_EMAIL="admin@example.com"
 *   export PB_ADMIN_PASSWORD="password"
 *   export D1_DATABASE_ID="your-d1-database-id"
 *   export CF_ACCOUNT_ID="your-account-id"
 *   export CF_API_TOKEN="your-api-token"
 *   
 *   npx tsx scripts/migrate-pocketbase.ts
 */

import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

// Configuration from environment
const PB_URL = process.env.PB_URL || "";
const PB_ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL || "";
const PB_ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD || "";
const D1_DATABASE_ID = process.env.D1_DATABASE_ID || "";
const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID || "";
const CF_API_TOKEN = process.env.CF_API_TOKEN || "";

// Validate config
if (!PB_URL || !PB_ADMIN_EMAIL || !PB_ADMIN_PASSWORD) {
  console.error("❌ Missing PocketBase credentials");
  console.error("Set: PB_URL, PB_ADMIN_EMAIL, PB_ADMIN_PASSWORD");
  process.exit(1);
}

if (!D1_DATABASE_ID || !CF_ACCOUNT_ID || !CF_API_TOKEN) {
  console.error("❌ Missing Cloudflare credentials");
  console.error("Set: D1_DATABASE_ID, CF_ACCOUNT_ID, CF_API_TOKEN");
  process.exit(1);
}

interface PocketBaseUser {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  created: string;
  updated: string;
  sub_id?: string;
  sub_status?: string;
  variant_id?: string;
  variant_name?: string;
  renews_at?: string;
}

interface PocketBaseDomain {
  id: string;
  name: string;
  user: string;
  created: string;
  updated: string;
}

async function authenticatePocketBase(): Promise<string> {
  console.log("🔐 Authenticating with PocketBase...");
  
  const response = await fetch(`${PB_URL}/api/admins/auth-with-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      identity: PB_ADMIN_EMAIL,
      password: PB_ADMIN_PASSWORD,
    }),
  });

  if (!response.ok) {
    throw new Error(`PocketBase auth failed: ${response.status}`);
  }

  const data = await response.json();
  console.log("✅ PocketBase authenticated");
  return data.token;
}

async function fetchUsers(token: string): Promise<PocketBaseUser[]> {
  console.log("📥 Fetching users from PocketBase...");
  
  const response = await fetch(`${PB_URL}/api/collections/users/records?perPage=1000`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.status}`);
  }

  const data = await response.json();
  console.log(`✅ Fetched ${data.items.length} users`);
  return data.items;
}

async function fetchDomains(token: string): Promise<PocketBaseDomain[]> {
  console.log("📥 Fetching domains from PocketBase...");
  
  const response = await fetch(`${PB_URL}/api/collections/domain/records?perPage=1000`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch domains: ${response.status}`);
  }

  const data = await response.json();
  console.log(`✅ Fetched ${data.items.length} domains`);
  return data.items;
}

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function generateDomainKey(): string {
  return "ls_" + Math.random().toString(36).substring(2, 15);
}

async function generateSQLScript(users: PocketBaseUser[], domains: PocketBaseDomain[]): Promise<string> {
  console.log("📝 Generating SQL migration script...");
  
  const lines: string[] = [];
  lines.push("-- PocketBase to Better-Auth Migration");
  lines.push(`-- Generated: ${new Date().toISOString()}`);
  lines.push("-- Users: " + users.length);
  lines.push("-- Domains: " + domains.length);
  lines.push("");
  lines.push("BEGIN TRANSACTION;");
  lines.push("");
  
  // Create user ID mapping (PocketBase ID -> new UUID)
  const userIdMap = new Map<string, string>();
  
  // Migrate users
  lines.push("-- Migrate users");
  for (const user of users) {
    const newId = generateUUID();
    userIdMap.set(user.id, newId);
    
    const email = user.email.replace(/'/g, "''");
    const name = (user.name || "").replace(/'/g, "''");
    const image = (user.avatar || "").replace(/'/g, "''");
    
    lines.push(`INSERT INTO users (id, email, email_verified, name, image, created_at, updated_at) VALUES (`);
    lines.push(`  '${newId}',`);
    lines.push(`  '${email}',`);
    lines.push(`  1,`); // Assume verified since they logged in before
    lines.push(`  '${name}',`);
    lines.push(`  '${image}',`);
    lines.push(`  '${user.created}',`);
    lines.push(`  '${user.updated}'`);
    lines.push(`);`);
    
    // Migrate subscription if exists
    if (user.sub_id) {
      lines.push(`INSERT INTO subscriptions (id, user_id, provider, provider_subscription_id, plan_id, plan_name, status, current_period_end, created_at, updated_at) VALUES (`);
      lines.push(`  '${generateUUID()}',`);
      lines.push(`  '${newId}',`);
      lines.push(`  'lemonsqueezy',`); // Assuming based on code
      lines.push(`  '${user.sub_id}',`);
      lines.push(`  '${user.variant_id || "default"}',`);
      lines.push(`  '${user.variant_name || "monthly"}',`);
      lines.push(`  '${user.sub_status || "active"}',`);
      lines.push(`  '${user.renews_at || new Date().toISOString()}',`);
      lines.push(`  '${user.created}',`);
      lines.push(`  '${user.updated}'`);
      lines.push(`);`);
    }
    
    lines.push("");
  }
  
  // Migrate domains -> sites
  lines.push("-- Migrate domains to sites");
  for (const domain of domains) {
    const newUserId = userIdMap.get(domain.user);
    if (!newUserId) {
      console.warn(`⚠️  Domain ${domain.name} has no matching user, skipping`);
      continue;
    }
    
    const domainName = domain.name.replace(/'/g, "''");
    const domainKey = generateDomainKey();
    
    lines.push(`INSERT INTO sites (id, domain, user_id, name, plan, domain_key, created_at, updated_at) VALUES (`);
    lines.push(`  '${generateUUID()}',`);
    lines.push(`  '${domainName}',`);
    lines.push(`  '${newUserId}',`);
    lines.push(`  '${domainName}',`); // Use domain as name
    lines.push(`  'free',`); // Default to free, upgrade manually later
    lines.push(`  '${domainKey}',`);
    lines.push(`  '${domain.created}',`);
    lines.push(`  '${domain.updated}'`);
    lines.push(`);`);
    lines.push("");
  }
  
  lines.push("COMMIT;");
  lines.push("");
  
  return lines.join("\n");
}

async function executeD1Migration(sql: string): Promise<void> {
  console.log("🚀 Executing migration on D1...");
  
  // Write SQL to temp file
  const tempFile = path.join(process.cwd(), ".migration-temp.sql");
  fs.writeFileSync(tempFile, sql);
  
  try {
    // Execute using wrangler
    const cmd = `npx wrangler d1 execute ${D1_DATABASE_ID} --file=${tempFile} --yes`;
    console.log(`Running: ${cmd}`);
    
    execSync(cmd, {
      stdio: "inherit",
      env: {
        ...process.env,
        CLOUDFLARE_ACCOUNT_ID: CF_ACCOUNT_ID,
        CLOUDFLARE_API_TOKEN: CF_API_TOKEN,
      },
    });
    
    console.log("✅ Migration executed successfully");
  } finally {
    // Clean up temp file
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }
  }
}

async function main() {
  console.log("🚀 PocketBase to Better-Auth Migration\n");
  
  try {
    // Step 1: Authenticate
    const token = await authenticatePocketBase();
    
    // Step 2: Fetch data
    const [users, domains] = await Promise.all([
      fetchUsers(token),
      fetchDomains(token),
    ]);
    
    // Step 3: Generate SQL
    const sql = await generateSQLScript(users, domains);
    
    // Save SQL to file for review
    const outputFile = path.join(process.cwd(), "migration.sql");
    fs.writeFileSync(outputFile, sql);
    console.log(`\n💾 SQL saved to: ${outputFile}`);
    console.log("Review the SQL before executing!");
    
    // Step 4: Execute (optional)
    const shouldExecute = process.argv.includes("--execute");
    if (shouldExecute) {
      await executeD1Migration(sql);
    } else {
      console.log("\n⚠️  Pass --execute flag to run the migration");
      console.log("   npx tsx scripts/migrate-pocketbase.ts --execute");
    }
    
    console.log("\n✅ Migration preparation complete!");
    
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  }
}

main();
