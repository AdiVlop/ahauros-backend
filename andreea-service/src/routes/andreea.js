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
    const answer = await ask(data.prompt, data.userId);
    res.json({ success: true, answer });
  } catch (err) {
    console.error("Andreea GPT error:", err);
    res.status(400).json({ success: false, error: err.message });
  }
});

export default router;
