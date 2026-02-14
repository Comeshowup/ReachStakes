import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
    trackClick,
    trackEvent,
    recordConversion,
    shopifyWebhook,
    getBundleEvents,
    trackingPixel
} from "../controllers/eventController.js";

const router = express.Router();

// === PUBLIC TRACKING ENDPOINTS (No auth required) ===

// Short link redirect + click tracking
router.get("/track/:shortCode", trackClick);

// Tracking pixel (for client-side page view tracking)
router.get("/pixel.gif", trackingPixel);

// Track general events (clicks, page views, etc.)
router.post("/track", trackEvent);

// Record conversion event (typically from checkout)
router.post("/conversion", recordConversion);

// === WEBHOOK ENDPOINTS ===

// Shopify order webhook
router.post("/webhook/shopify", shopifyWebhook);

// Future: Add more e-commerce webhooks
// router.post("/webhook/woocommerce", woocommerceWebhook);
// router.post("/webhook/stripe", stripeWebhook);

// === PROTECTED ENDPOINTS ===

// Get events for a specific tracking bundle (admin/debug)
router.get("/bundle/:bundleId", protect, getBundleEvents);

export default router;
