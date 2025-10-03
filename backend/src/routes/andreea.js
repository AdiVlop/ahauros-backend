import express from "express";
import { z } from "zod";
import { ask } from "../services/openai.js";
import { logAndreeaRequest, logOpenAITimeout, logError } from "../utils/logger.js";

const router = express.Router();

const promptSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  userId: z.string().optional(),
});

router.post("/gpt", async (req, res) => {
  const startTime = Date.now();
  try {
    const data = promptSchema.parse(req.body);

    // ✅ timeout scurt pentru OpenAI (10 secunde)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const answer = await ask(data.prompt, data.userId, { signal: controller.signal });
    clearTimeout(timeout);

    const responseTime = Date.now() - startTime;
    logAndreeaRequest(data.prompt, data.userId, responseTime, true);

    res.json({ success: true, answer });
  } catch (err) {
    const responseTime = Date.now() - startTime;
    
    if (err.name === "AbortError") {
      logOpenAITimeout(req.body.prompt, req.body.userId);
      return res.status(504).json({ success: false, error: "OpenAI request timed out" });
    }
    
    logError("Andreea GPT Error", err, {
      body: req.body,
      origin: req.headers.origin,
      responseTime
    });
    
    res.status(400).json({ success: false, error: err.message });
  }
});

export default router;
