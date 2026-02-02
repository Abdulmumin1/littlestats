import { Hono } from "hono";
import DodoPayments from "dodopayments";
import type { Env } from "../types";
import { authMiddleware } from "../middleware/auth";

type Variables = {
  user: any;
  session: any;
};

const billingRouter = new Hono<{ Bindings: Env; Variables: Variables }>();

// Product IDs - Using provided test and live product IDs
const DODO_PRODUCTS = {
  test: {
    monthly: 'pdt_0NXY8Oz1kUf3jfQMcJH84',
  },
  live: {
    monthly: 'pdt_0NXY5RTCJcXsqRiV3U2Tm',
  }
};

// Helper to get Dodo client
function getDodoClient(env: Env) {
  const isTestMode = env.DODO_PAYMENTS_ENV === 'test';
  return new DodoPayments({
    bearerToken: env.DODO_PAYMENTS_API_KEY,
    environment: isTestMode ? 'test_mode' : 'live_mode',
  });
}

// Get available checkout options (Public)
billingRouter.get("/checkout-options", async (c) => {
  try {
    const isTestMode = c.env.DODO_PAYMENTS_ENV === 'test';
    const products = isTestMode ? DODO_PRODUCTS.test : DODO_PRODUCTS.live;
    
    // Return checkout options matching the frontend format
    // Format: [priceInCents, currency, billingInterval, checkoutUrlOrId]
    const checkoutOptions = [
      [400, 'USD', 'monthly', products.monthly],  // $4/month
    ];
    
    return c.json({ checkout: checkoutOptions });
  } catch (error) {
    console.error("[Billing] Error fetching checkout options:", error);
    return c.json({ error: "Failed to fetch checkout options" }, 500);
  }
});

// Protected routes
billingRouter.use("/checkout", authMiddleware);
billingRouter.use("/subscription", authMiddleware);
billingRouter.use("/usage", authMiddleware);
billingRouter.use("/portal", authMiddleware);

// Create checkout session
billingRouter.post("/checkout", async (c) => {
  try {
    const user = c.get("user");
    const body = await c.req.json();
    const { productId, quantity = 1, email, name, metadata = {} } = body;

    if (!productId || !email) {
      return c.json({ error: "Missing required fields: productId and email" }, 400);
    }

    const client = getDodoClient(c.env);
    const appUrl = c.env.APP_URL || 'https://littlestats.click';

    const session = await client.checkoutSessions.create({
      product_cart: [{ product_id: productId, quantity }],
      customer: { 
        email, 
        name: name || user.name || undefined 
      },
      metadata: {
        ...metadata,
        userId: user.id,
        source: 'littlestats'
      },
      return_url: `${appUrl}/billing/success${metadata?.siteId ? `?siteId=${metadata.siteId}` : ''}`,
    });

    return c.json({ 
      checkoutUrl: session.checkout_url,
      sessionId: session.session_id,
    });
  } catch (error: any) {
    console.error("[Billing] Checkout error:", error);
    return c.json({ 
      error: error.message || "Failed to create checkout session" 
    }, 500);
  }
});

// Get user subscription status with full details
billingRouter.get("/subscription", async (c) => {
  try {
    const user = c.get("user");
    
    // Query user's subscription from database
    const subscription = await c.env.DB.prepare(`
      SELECT * FROM subscriptions 
      WHERE user_id = ? 
      AND status = 'active'
      ORDER BY created_at DESC
      LIMIT 1
    `).bind(user.id).first<{
      id: string;
      status: string;
      plan_name: string;
      provider: string;
      current_period_start: string;
      current_period_end: string;
      cancel_at_period_end: number;
      provider_subscription_id: string;
      provider_customer_id: string;
      metadata: string | null;
      created_at: string;
      updated_at: string;
    }>();

    if (!subscription) {
      return c.json({ 
        hasSubscription: false,
        subscription: null 
      });
    }

    return c.json({
      hasSubscription: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        planName: subscription.plan_name,
        provider: subscription.provider,
        currentPeriodStart: subscription.current_period_start,
        currentPeriodEnd: subscription.current_period_end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        providerSubscriptionId: subscription.provider_subscription_id,
        providerCustomerId: subscription.provider_customer_id,
        metadata: subscription.metadata ? JSON.parse(subscription.metadata) : null,
        createdAt: subscription.created_at,
        updatedAt: subscription.updated_at
      }
    });
  } catch (error) {
    console.error("[Billing] Error fetching subscription:", error);
    return c.json({ error: "Failed to fetch subscription" }, 500);
  }
});

// Get usage statistics
billingRouter.get("/usage", async (c) => {
  try {
    const user = c.get("user");
    const now = new Date();
    const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();

    // 1. Get Plan Limits
    const subscription = await c.env.DB.prepare(
      "SELECT status, plan_name FROM subscriptions WHERE user_id = ? AND status = 'active'"
    ).bind(user.id).first();

    const isPaid = !!subscription;
    const limits = {
      sites: isPaid ? 10 : 2,
      events: isPaid ? 5_000_000 : 500_000
    };

    // 2. Get Site Usage
    const sitesResult = await c.env.DB.prepare(
      "SELECT COUNT(*) as count FROM sites WHERE user_id = ?"
    ).bind(user.id).first<{ count: number }>();

    // 3. Get Event Usage (Current Month)
    // We need to sum up views + custom_events from hourly_stats for all sites owned by the user
    const eventsResult = await c.env.DB.prepare(`
      SELECT SUM(h.views + h.custom_events) as total
      FROM hourly_stats h
      JOIN sites s ON h.site_id = s.id
      WHERE s.user_id = ? AND h.hour >= ?
    `).bind(user.id, startOfMonth).first<{ total: number }>();

    return c.json({
      plan: {
        name: subscription?.plan_name || "Free",
        isPaid
      },
      usage: {
        sites: sitesResult?.count || 0,
        events: eventsResult?.total || 0
      },
      limits
    }, {
      headers: {
        // Cache for 5 minutes to reduce DB load
        "Cache-Control": "private, max-age=300"
      }
    });
  } catch (error) {
    console.error("[Billing] Usage stats error:", error);
    return c.json({ error: "Failed to fetch usage stats" }, 500);
  }
});

// Customer portal - create Dodo customer portal session
billingRouter.get("/portal", async (c) => {
  try {
    const user = c.get("user");
    // Get customer's subscription with customer ID
    const subscription = await c.env.DB.prepare(`
      SELECT provider_subscription_id, provider_customer_id, provider 
      FROM subscriptions 
      WHERE user_id = ? 
      AND status = 'active'
      LIMIT 1
    `).bind(user.id).first();

    if (!subscription || subscription.provider !== 'dodo') {
      return c.json({ error: "No active Dodo subscription found" }, 404);
    }

    const client = getDodoClient(c.env);

    let customer_id = subscription.provider_customer_id

    if (!subscription.provider_customer_id) {
        const customer = await client.subscriptions.retrieve(subscription.provider_subscription_id as string)
        customer_id = customer.customer.customer_id
        if (!customer_id) {
            return c.json({ error: "Customer ID not found" }, 404);
        }
    }

    // Create Dodo customer portal session
    
    const portal = await client.customers.customerPortal.create(
      customer_id as string,
      { send_email: false }
    );

    return c.json({ 
      portalUrl: portal.link 
    });
  } catch (error) {
    console.error("[Billing] Portal error:", error);
    return c.json({ error: "Failed to generate portal URL" }, 500);
  }
});

export { billingRouter };
