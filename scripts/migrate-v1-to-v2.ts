#!/usr/bin/env tsx
/**
 * V1 to V2 Events Migration Script
 * 
 * Migrates analytics events from the old v1 schema (one table per domain)
 * to the new v2 schema (unified tables with session tracking).
 * 
 * The script:
 * 1. Scans for all events_* tables in D1
 * 2. Groups events into sessions (IP + 30-min window)
 * 3. Generates deterministic session IDs
 * 4. Populates new tables: sessions, events, hourly_stats
 * 
 * Usage:
 *   export D1_DATABASE_ID="your-d1-database-id"
 *   export CF_ACCOUNT_ID="your-account-id"
 *   export CF_API_TOKEN="your-api-token"
 *   
 *   npx tsx scripts/migrate-v1-to-v2.ts
 */

import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

const D1_DATABASE_ID = process.env.D1_DATABASE_ID || "";
const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID || "";
const CF_API_TOKEN = process.env.CF_API_TOKEN || "";

if (!D1_DATABASE_ID || !CF_ACCOUNT_ID || !CF_API_TOKEN) {
  console.error("❌ Missing Cloudflare credentials");
  console.error("Set: D1_DATABASE_ID, CF_ACCOUNT_ID, CF_API_TOKEN");
  process.exit(1);
}

interface V1Event {
  id: number;
  domain_id: string;
  event_type: string;
  url: string;
  referrer: string | null;
  user_agent: string | null;
  timestamp: string;
  duration: number | null;
  ip: string | null;
  timezone: string | null;
  session_id: string | null;
  user_id: string | null;
  screen: string | null;
  language: string | null;
  event_name: string | null;
  event_data: string | null;
}

interface Session {
  id: string;
  siteId: string;
  visitorId: string;
  firstVisitAt: string;
  lastVisitAt: string;
  visitCount: number;
  deviceInfo: {
    browser: string | null;
    browserVersion: string | null;
    os: string | null;
    device: string | null;
    screen: string | null;
  };
  geoInfo: {
    country: string | null;
    timezone: string | null;
  };
  language: string | null;
  totalPageviews: number;
  events: V1Event[];
}

// Helper: Generate deterministic session ID
function generateSessionId(siteId: string, ip: string, userAgent: string, monthSalt: string): string {
  const input = `${siteId}|${ip || '0.0.0.0'}|${userAgent || ''}|${monthSalt}`;
  return hashToUUID(input);
}

function hashToUUID(input: string): string {
  // Simple hash-based UUID generation
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  const hashStr = Math.abs(hash).toString(16).padStart(32, '0');
  return `${hashStr.slice(0, 8)}-${hashStr.slice(8, 12)}-4${hashStr.slice(13, 16)}-${hashStr.slice(16, 20)}-${hashStr.slice(20, 32)}`;
}

// Helper: Parse user agent
function parseUserAgent(ua: string | null): { browser: string | null; os: string | null; device: string | null } {
  if (!ua) return { browser: null, os: null, device: null };
  
  const ual = ua.toLowerCase();
  
  // Browser
  let browser = 'Unknown';
  if (ual.includes('chrome/')) browser = 'Chrome';
  else if (ual.includes('firefox/')) browser = 'Firefox';
  else if (ual.includes('safari/') && !ual.includes('chrome/')) browser = 'Safari';
  else if (ual.includes('edge/')) browser = 'Edge';
  
  // OS
  let os = 'Unknown';
  if (ual.includes('windows')) os = 'Windows';
  else if (ual.includes('macintosh') || ual.includes('mac os')) os = 'macOS';
  else if (ual.includes('linux')) os = 'Linux';
  else if (ual.includes('android')) os = 'Android';
  else if (ual.includes('iphone') || ual.includes('ipad')) os = 'iOS';
  
  // Device
  let device = 'desktop';
  if (ual.includes('mobile') || ual.includes('android') || ual.includes('iphone')) {
    device = 'mobile';
  } else if (ual.includes('ipad') || ual.includes('tablet')) {
    device = 'tablet';
  }
  
  return { browser, os, device };
}

// Helper: Get month salt from timestamp
function getMonthSalt(timestamp: string): string {
  return timestamp.slice(0, 7); // YYYY-MM
}

// Helper: Group events into sessions
function groupEventsIntoSessions(events: V1Event[], siteId: string): Map<string, Session> {
  const sessions = new Map<string, Session>();
  const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
  
  // Sort events by timestamp
  events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  
  for (const event of events) {
    const ip = event.ip || '0.0.0.0';
    const ua = event.user_agent || '';
    const monthSalt = getMonthSalt(event.timestamp);
    
    // Generate session ID
    let sessionId: string;
    if (event.user_id) {
      // User was identified
      sessionId = generateSessionId(siteId, '', event.user_id, monthSalt);
    } else {
      // Anonymous user
      sessionId = generateSessionId(siteId, ip, ua, monthSalt);
    }
    
    // Check if session exists and is still active
    let session = sessions.get(sessionId);
    const eventTime = new Date(event.timestamp).getTime();
    
    if (session) {
      const lastVisitTime = new Date(session.lastVisitAt).getTime();
      
      // Check if session expired (30 min inactivity)
      if (eventTime - lastVisitTime > SESSION_TIMEOUT) {
        // Create new session with same visitor ID
        const newSessionId = generateSessionId(siteId, ip, ua, monthSalt) + '_2';
        session = {
          id: newSessionId,
          siteId,
          visitorId: event.user_id || sessionId,
          firstVisitAt: event.timestamp,
          lastVisitAt: event.timestamp,
          visitCount: 1,
          deviceInfo: parseUserAgent(event.user_agent),
          geoInfo: {
            country: null, // Would need CF headers
            timezone: event.timezone,
          },
          language: event.language,
          totalPageviews: 0,
          events: [],
        };
        sessions.set(newSessionId, session);
      } else {
        // Update existing session
        session.lastVisitAt = event.timestamp;
        session.totalPageviews++;
      }
    } else {
      // Create new session
      session = {
        id: sessionId,
        siteId,
        visitorId: event.user_id || sessionId,
        firstVisitAt: event.timestamp,
        lastVisitAt: event.timestamp,
        visitCount: 1,
        deviceInfo: parseUserAgent(event.user_agent),
        geoInfo: {
          country: null,
          timezone: event.timezone,
        },
        language: event.language,
        totalPageviews: 1,
        events: [],
      };
      sessions.set(sessionId, session);
    }
    
    // Add event to session
    session.events.push(event);
  }
  
  return sessions;
}

async function fetchV1Tables(): Promise<string[]> {
  console.log("📋 Fetching v1 tables from D1...");
  
  // Query to get all table names starting with "events_"
  const sql = `SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'events_%'`;
  
  const tempFile = path.join(process.cwd(), ".list-tables.sql");
  fs.writeFileSync(tempFile, sql);
  
  try {
    const result = execSync(
      `npx wrangler d1 execute ${D1_DATABASE_ID} --file=${tempFile} --json`,
      {
        encoding: "utf-8",
        env: {
          ...process.env,
          CLOUDFLARE_ACCOUNT_ID: CF_ACCOUNT_ID,
          CLOUDFLARE_API_TOKEN: CF_API_TOKEN,
        },
      }
    );
    
    const data = JSON.parse(result);
    const tables = data[0]?.results?.map((r: any) => r.name) || [];
    
    console.log(`✅ Found ${tables.length} domain tables: ${tables.join(', ')}`);
    return tables;
    
  } finally {
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }
  }
}

async function fetchEventsFromTable(tableName: string): Promise<V1Event[]> {
  console.log(`📥 Fetching events from ${tableName}...`);
  
  // Extract domain from table name (events_example_com -> example.com)
  const domain = tableName.replace('events_', '').replace(/_/g, '.');
  
  const sql = `SELECT * FROM ${tableName} ORDER BY timestamp ASC`;
  
  const tempFile = path.join(process.cwd(), ".fetch-events.sql");
  fs.writeFileSync(tempFile, sql);
  
  try {
    const result = execSync(
      `npx wrangler d1 execute ${D1_DATABASE_ID} --file=${tempFile} --json`,
      {
        encoding: "utf-8",
        env: {
          ...process.env,
          CLOUDFLARE_ACCOUNT_ID: CF_ACCOUNT_ID,
          CLOUDFLARE_API_TOKEN: CF_API_TOKEN,
        },
      }
    );
    
    const data = JSON.parse(result);
    const events = data[0]?.results || [];
    
    // Add domain_id to each event
    events.forEach((e: V1Event) => {
      e.domain_id = domain;
    });
    
    console.log(`✅ Fetched ${events.length} events`);
    return events;
    
  } finally {
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }
  }
}

function generateMigrationSQL(
  siteId: string, 
  domain: string, 
  sessions: Map<string, Session>
): string {
  const lines: string[] = [];
  
  // Insert sessions
  for (const [sessionId, session] of sessions) {
    lines.push(`INSERT INTO sessions (id, site_id, visitor_id, first_visit_at, last_visit_at, visit_count, browser, os, device, screen, country, language, timezone, total_pageviews, total_events) VALUES (`);
    lines.push(`  '${sessionId}',`);
    lines.push(`  '${siteId}',`);
    lines.push(`  '${session.visitorId}',`);
    lines.push(`  '${session.firstVisitAt}',`);
    lines.push(`  '${session.lastVisitAt}',`);
    lines.push(`  ${session.visitCount},`);
    lines.push(`  '${session.deviceInfo.browser || "Unknown"}',`);
    lines.push(`  '${session.deviceInfo.os || "Unknown"}',`);
    lines.push(`  '${session.deviceInfo.device || "desktop"}',`);
    lines.push(`  NULL,`); // screen
    lines.push(`  NULL,`); // country
    lines.push(`  '${session.language || "en"}',`);
    lines.push(`  '${session.geoInfo.timezone || "UTC"}',`);
    lines.push(`  ${session.totalPageviews},`);
    lines.push(`  ${session.events.length}`);
    lines.push(`);`);
    lines.push("");
    
    // Insert events
    for (const event of session.events) {
      const eventType = event.event_type === 'customEvent' ? 2 : 1;
      const urlPath = event.url?.split('?')[0]?.replace(/'/g, "''") || '/';
      const urlQuery = event.url?.includes('?') ? event.url.split('?')[1]?.replace(/'/g, "''") : null;
      
      lines.push(`INSERT INTO events (site_id, session_id, visit_id, event_type, url_path, url_query, referrer_domain, page_title, event_name, browser, os, device, screen, country, language, timezone, engagement_time, created_at) VALUES (`);
      lines.push(`  '${siteId}',`);
      lines.push(`  '${sessionId}',`);
      lines.push(`  '${sessionId}',`); // visit_id = session_id for v1 migration
      lines.push(`  ${eventType},`);
      lines.push(`  '${urlPath}',`);
      lines.push(`  ${urlQuery ? `'${urlQuery}'` : 'NULL'},`);
      lines.push(`  ${event.referrer ? `'${event.referrer.replace(/'/g, "''")}'` : 'NULL'},`);
      lines.push(`  NULL,`); // page_title
      lines.push(`  ${event.event_name ? `'${event.event_name.replace(/'/g, "''")}'` : 'NULL'},`);
      lines.push(`  '${session.deviceInfo.browser || "Unknown"}',`);
      lines.push(`  '${session.deviceInfo.os || "Unknown"}',`);
      lines.push(`  '${session.deviceInfo.device || "desktop"}',`);
      lines.push(`  ${event.screen ? `'${event.screen}'` : 'NULL'},`);
      lines.push(`  NULL,`); // country
      lines.push(`  '${event.language || "en"}',`);
      lines.push(`  '${event.timezone || "UTC"}',`);
      lines.push(`  ${event.duration || 0},`);
      lines.push(`  '${event.timestamp}'`);
      lines.push(`);`);
      lines.push("");
    }
  }
  
  return lines.join("\n");
}

async function executeMigration(sql: string, batchName: string): Promise<void> {
  console.log(`🚀 Executing migration batch: ${batchName}...`);
  
  const tempFile = path.join(process.cwd(), `.migration-${batchName}.sql`);
  fs.writeFileSync(tempFile, sql);
  
  try {
    execSync(
      `npx wrangler d1 execute ${D1_DATABASE_ID} --file=${tempFile} --yes`,
      {
        stdio: "inherit",
        env: {
          ...process.env,
          CLOUDFLARE_ACCOUNT_ID: CF_ACCOUNT_ID,
          CLOUDFLARE_API_TOKEN: CF_API_TOKEN,
        },
      }
    );
    
    console.log(`✅ Batch ${batchName} completed`);
  } finally {
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }
  }
}

async function main() {
  console.log("🚀 V1 to V2 Analytics Migration\n");
  
  try {
    // Step 1: Find all v1 tables
    const tables = await fetchV1Tables();
    
    if (tables.length === 0) {
      console.log("ℹ️  No v1 tables found. Nothing to migrate.");
      return;
    }
    
    // Step 2: Process each domain
    let totalSessions = 0;
    let totalEvents = 0;
    
    for (const tableName of tables) {
      console.log(`\n📦 Processing ${tableName}...`);
      
      // Extract domain
      const domain = tableName.replace('events_', '').replace(/_/g, '.');
      
      // Fetch v1 events
      const events = await fetchEventsFromTable(tableName);
      
      if (events.length === 0) {
        console.log(`⚠️  No events in ${tableName}, skipping`);
        continue;
      }
      
      // Group into sessions
      const sessions = groupEventsIntoSessions(events, domain);
      
      console.log(`📊 Grouped into ${sessions.size} sessions`);
      
      // Generate site ID (we'll need to look this up from sites table or create it)
      const siteId = domain; // Temporary - should be looked up from sites table
      
      // Generate migration SQL
      const sql = generateMigrationSQL(siteId, domain, sessions);
      
      // Save to file
      const outputFile = path.join(process.cwd(), `migration-${domain}.sql`);
      fs.writeFileSync(outputFile, sql);
      console.log(`💾 SQL saved to: ${outputFile}`);
      
      // Execute if flag provided
      if (process.argv.includes("--execute")) {
        await executeMigration(sql, domain);
      }
      
      totalSessions += sessions.size;
      totalEvents += events.length;
    }
    
    console.log("\n" + "=".repeat(50));
    console.log("✅ Migration Summary:");
    console.log(`   Domains processed: ${tables.length}`);
    console.log(`   Total sessions: ${totalSessions}`);
    console.log(`   Total events: ${totalEvents}`);
    console.log("=".repeat(50));
    
    if (!process.argv.includes("--execute")) {
      console.log("\n⚠️  Pass --execute flag to run the migrations");
      console.log("   npx tsx scripts/migrate-v1-to-v2.ts --execute");
    }
    
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  }
}

main();
