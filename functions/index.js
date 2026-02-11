import { setGlobalOptions } from "firebase-functions/v2";
import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { GoogleGenAI } from "@google/genai";

// Set global options to limit instances (cost control)
setGlobalOptions({ maxInstances: 10 });

// Define the secret for the Gemini API Key
const GEMINI_KEY = defineSecret("GEMINI_KEY");

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
      const { prompt, config, model = 'gemini-3-flash-preview' } = req.body;
      
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
 * Health check function
 */
export const mapleHealth = onRequest(
  { secrets: [GEMINI_KEY] },
  (req, res) => {
    try {
      const key = GEMINI_KEY.value();
      res.status(200).send({
        status: "online",
        message: "MaplePrep backend is healthy",
        hasKey: !!key
      });
    } catch (error) {
      res.status(500).send("Internal Server Error: " + error.message);
    }
  }
);
