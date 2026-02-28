import { setGlobalOptions } from "firebase-functions/v2";
import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { GoogleGenAI } from "@google/genai";
import Stripe from "stripe";

// Set global options to limit instances (cost control)
setGlobalOptions({ maxInstances: 10 });

// Define the secret for the Gemini API Key
const GEMINI_KEY = defineSecret("GEMINI_KEY");
const STRIPE_SECRET_KEY = defineSecret("STRIPE_SECRET_KEY");

/**
 * Main API endpoint for Gemini Requests
 * This acts as a secure proxy so the API Key is never exposed to the browser.
 */
export const api = onRequest(
  { 
    secrets: [GEMINI_KEY],
    cors: true // Enables browser access from your hosting domain
  },
  async (req, res) => {
    try {
      const { prompt, config, model = 'gemini-3-pro-preview' } = req.body;
      
      if (!prompt) {
        res.status(400).send("Missing prompt");
        return;
      }

      const apiKey = GEMINI_KEY.value();
      const ai = new GoogleGenAI({ apiKey });
      
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: config || {}
      });

      res.status(200).send({ text: response.text });
    } catch (error) {
      console.error("Gemini API Error:", error);
      res.status(500).send({ error: error.message });
    }
  }
);

/**
 * Stripe Checkout Session Function
 */
export const createCheckoutSession = onRequest(
  { 
    secrets: [STRIPE_SECRET_KEY],
    cors: true 
  },
  async (req, res) => {
    try {
      const { priceId, userId, email } = req.body;
      const stripeKey = STRIPE_SECRET_KEY.value();
      
      if (!stripeKey) {
        res.status(500).send({ error: "Stripe key not configured in Firebase Secrets" });
        return;
      }

      const stripe = new Stripe(stripeKey);
      
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: "subscription",
        customer_email: email,
        client_reference_id: userId,
        subscription_data: { trial_period_days: 1 },
        allow_promotion_codes: true,
        success_url: `${req.headers.origin}/?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/pricing`,
      });

      res.status(200).send({ url: session.url });
    } catch (error) {
      console.error("Stripe Error:", error);
      res.status(500).send({ error: error.message });
    }
  }
);
