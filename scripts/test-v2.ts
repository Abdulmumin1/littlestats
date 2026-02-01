// Test script for LittleStats Analytics v2.0
// Run with: npx tsx scripts/test-v2.ts

import { env } from "process";

const BASE_URL = env.TEST_URL || "http://localhost:8787";
const SITE_ID = env.TEST_SITE_ID || "";

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  data?: any;
}

async function runTests(): Promise<void> {
  console.log("🧪 Testing LittleStats Analytics v2.0\n");
  console.log(`Base URL: ${BASE_URL}\n`);

  const results: TestResult[] = [];

  // Test 1: Health check
  results.push(await testHealth());

  // Test 2: Create site
  const siteResult = await testCreateSite();
  results.push(siteResult);

  let testSiteId = SITE_ID;
  if (siteResult.passed && siteResult.data?.domainKey) {
    testSiteId = siteResult.data.domainKey;
    console.log(`   Created test site: ${testSiteId}\n`);
  }

  if (!testSiteId) {
    console.error("❌ No site ID available for further tests");
    console.error("   Set TEST_SITE_ID env var or ensure create site test passes");
    return;
  }

  // Test 3: Track pageview
  results.push(await testTrackPageview(testSiteId));

  // Test 4: Track custom event
  results.push(await testTrackCustomEvent(testSiteId));

  // Test 5: Get stats
  results.push(await testGetStats(testSiteId));

  // Test 6: List sites
  results.push(await testListSites());

  // Print results
  console.log("\n" + "=".repeat(50));
  console.log("📊 Test Results:");
  console.log("=".repeat(50));

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  results.forEach(result => {
    const icon = result.passed ? "✅" : "❌";
    console.log(`${icon} ${result.name}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });

  console.log("=".repeat(50));
  console.log(`Total: ${passed} passed, ${failed} failed`);

  if (failed === 0) {
    console.log("\n🎉 All tests passed!");
  } else {
    console.log("\n⚠️  Some tests failed");
    process.exit(1);
  }
}

async function testHealth(): Promise<TestResult> {
  try {
    const response = await fetch(`${BASE_URL}/api/v2/health/test-site`);
    const data = await response.json();

    return {
      name: "Health Check",
      passed: response.ok && data.status === "healthy",
      data,
    };
  } catch (error) {
    return {
      name: "Health Check",
      passed: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function testCreateSite(): Promise<TestResult> {
  try {
    const testDomain = `test-${Date.now()}.com`;
    
    const response = await fetch(`${BASE_URL}/api/v2/sites`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        domain: testDomain,
        name: "Test Site",
      }),
    });

    const data = await response.json();

    return {
      name: "Create Site",
      passed: response.ok && data.id && data.domainKey,
      data,
      error: !response.ok ? data.error : undefined,
    };
  } catch (error) {
    return {
      name: "Create Site",
      passed: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function testTrackPageview(siteId: string): Promise<TestResult> {
  try {
    const payload = {
      type: "pageview",
      website: siteId,
      url: "/test-page",
      referrer: "https://google.com",
      title: "Test Page",
      screen: "1920x1080",
      language: "en-US",
      timezone: "America/New_York",
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      cache: {
        visitId: `visit-${Date.now()}`,
        iat: Math.floor(Date.now() / 1000),
      },
      visitorId: `visitor-${Date.now()}`,
    };

    const response = await fetch(`${BASE_URL}/api/v2/track/${siteId}`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Origin": "http://test.com",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    return {
      name: "Track Pageview",
      passed: response.ok && data.success === true,
      data,
      error: !response.ok ? data.error : undefined,
    };
  } catch (error) {
    return {
      name: "Track Pageview",
      passed: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function testTrackCustomEvent(siteId: string): Promise<TestResult> {
  try {
    const payload = {
      type: "event",
      website: siteId,
      url: "/test-page",
      name: "button_click",
      data: {
        color: "blue",
        price: 29.99,
        urgent: true,
      },
      screen: "1920x1080",
      language: "en-US",
      timezone: "America/New_York",
      cache: {
        visitId: `visit-${Date.now()}`,
        iat: Math.floor(Date.now() / 1000),
      },
      visitorId: `visitor-${Date.now()}`,
    };

    const response = await fetch(`${BASE_URL}/api/v2/track/${siteId}`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Origin": "http://test.com",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    return {
      name: "Track Custom Event",
      passed: response.ok && data.success === true,
      data,
      error: !response.ok ? data.error : undefined,
    };
  } catch (error) {
    return {
      name: "Track Custom Event",
      passed: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function testGetStats(siteId: string): Promise<TestResult> {
  try {
    const response = await fetch(`${BASE_URL}/api/v2/stats/${siteId}`);
    const data = await response.json();

    return {
      name: "Get Stats",
      passed: response.ok && data !== null,
      data,
      error: !response.ok ? data.error : undefined,
    };
  } catch (error) {
    return {
      name: "Get Stats",
      passed: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function testListSites(): Promise<TestResult> {
  try {
    const response = await fetch(`${BASE_URL}/api/v2/sites`);
    const data = await response.json();

    return {
      name: "List Sites",
      passed: response.ok && Array.isArray(data.sites),
      data,
      error: !response.ok ? data.error : undefined,
    };
  } catch (error) {
    return {
      name: "List Sites",
      passed: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Run tests
runTests().catch(console.error);
