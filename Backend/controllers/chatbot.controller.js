
import { GoogleGenerativeAI } from "@google/generative-ai";
import Chat from "../models/chat.model.js";
import dotenv from "dotenv";
dotenv.config();

//  eminini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
console.log("Gemini API key loaded:", !!process.env.GEMINI_API_KEY);

//  Retry logic for overloaded model
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function safeGenerate(model, prompt) {
  for (let i = 0; i < 3; i++) {
    try {
      const result = await model.generateContent(prompt);

      if (!result || !result.response || typeof result.response.text !== "function") {
        console.error("Invalid Gemini response structure:", result);
        return null;
      }

      const text = result.response.text();
      console.log("Gemini response:", text);
      return text;

    } catch (error) {
      if (error.status === 503) {
        console.warn(`Model overloaded. Retrying in ${1000 * (i + 1)}ms...`);
        await sleep(1000 * (i + 1));
      } else {
        console.error("Gemini Error:", error.message);
        throw error;
      }
    }
  }
  return null;
}

// Main controller
export const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    console.log("Incoming message:", message);

    if (!message || typeof message !== "string" || message.trim() === "") {
      return res.status(400).json({ error: "Message is required" });
    }

    let botMessage;
    try {
      const model = genAI.getGenerativeModel(
        { model: "gemini-2.0-flash" },
        { apiVersion: "v1" }
      );

      botMessage = await safeGenerate(model, message);
    } catch (error) {
      if (error.status === 429 || error.code === "insufficient_quota") {
        return res.status(429).json({ error: "Gemini quota exceeded. Please try again later." });
      }
      return res.status(500).json({ error: "Failed to get response from Gemini." });
    }

    if (typeof botMessage !== "string" || botMessage.trim().length === 0) {
      console.error("Validation failed:", { botMessage });
      return res.status(500).json({ error: "Gemini returned an empty response" });
    }

    await Chat.create({ usermessage: message, botmessage: botMessage });
    return res.json({ reply: botMessage });

  } catch (error) {
    console.error("Backend Error:", error.message);
    if (!res.headersSent) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
};


