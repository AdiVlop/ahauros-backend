import express from "express";
import { z } from "zod";
import { ask } from "../services/openai.js";

const router = express.Router();

const promptSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  userId: z.string().optional(),
});

router.post("/gpt", async (req, res) => {
  try {
    const data = promptSchema.parse(req.body);

    // ✅ timeout scurt pentru OpenAI (10 secunde)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const answer = await ask(data.prompt, data.userId, { signal: controller.signal });
    clearTimeout(timeout);

    res.json({ success: true, answer });
  } catch (err) {
    console.error("❌ [Andreea GPT Error]", {
      message: err.message,
      stack: err.stack,
      body: req.body,
      origin: req.headers.origin,
    });
    if (err.name === "AbortError") {
      return res.status(504).json({ success: false, error: "OpenAI request timed out" });
    }
    res.status(400).json({ success: false, error: err.message });
  }
});

export default router;
