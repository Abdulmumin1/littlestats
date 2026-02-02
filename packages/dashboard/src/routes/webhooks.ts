import { Hono } from "hono";
import type { Env } from "../types";

const webhooksRouter = new Hono<{ Bindings: Env }>();

// Dodo Payments Webhook Handler
webhooksRouter.post("/dodo", async (c) => {
  try {
    const payload = await c.req.text();
    const signature = c.req.header('x-dodo-signature');
    
    // Verify webhook signature if secret is configured
    if (c.env.DODO_WEBHOOK_SECRET && signature) {
      // TODO: Implement signature verification
      // const isValid = verifyDodoWebhook(payload, signature, c.env.DODO_WEBHOOK_SECRET);
      // if (!isValid) return c.json({ error: "Invalid signature" }, 401);
    }

    const event = JSON.parse(payload);
    console.log("[Webhook] Dodo event received:", event.type);

    switch (event.type) {
      case 'payment.succeeded':
      case 'subscription.active': {
        const { customer: {customer_id}, subscription_id, metadata } = event.data;
        const userId = metadata?.userId;
        
        if (userId && subscription_id) {
          // Store subscription in database
          await c.env.DB.prepare(`
            INSERT INTO subscriptions (
              id, user_id, provider, provider_subscription_id, provider_customer_id,
              plan_id, plan_name, status, metadata, created_at, updated_at
            ) VALUES (?, ?, 'dodo', ?, ?, ?, ?, 'active', ?, datetime('now'), datetime('now'))
          `).bind(
            crypto.randomUUID(),
            userId,
            subscription_id,
            customer_id || null,
            metadata?.planId || 'pro',
            metadata?.planName || 'Pro Plan',
            JSON.stringify(metadata || {})
          ).run();
          
          console.log("[Webhook] Subscription created for user:", userId, "Customer ID:", customer_id);
        }
        break;
      }
      
      case 'subscription.cancelled':
      case 'subscription.expired': {
        const { subscription_id } = event.data;
        
        // Update subscription status
        await c.env.DB.prepare(`
          UPDATE subscriptions 
          SET status = ?, updated_at = datetime('now')
          WHERE provider_subscription_id = ?
        `).bind(
          event.type === 'subscription.cancelled' ? 'cancelled' : 'expired',
          subscription_id
        ).run();
        
        console.log("[Webhook] Subscription updated:", subscription_id);
        break;
      }
      
      default:
        console.log("[Webhook] Unhandled event type:", event.type);
    }

    return c.json({ received: true });
  } catch (error) {
    console.error("[Webhook] Error processing webhook:", error);
    return c.json({ error: "Webhook processing failed" }, 500);
  }
});

export { webhooksRouter };
