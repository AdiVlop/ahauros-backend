import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3002;

// Health check
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    service: "andreea-service",
    timestamp: Date.now() 
  });
});

// =================== Andreea GPT API ===================
app.post("/andreea/gpt", async (req, res) => {
  try {
    const { prompt, language = "English" } = req.body;

    // Validare prompt
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    // Verificare API key
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "OpenAI API key not configured" });
    }

    // Request către OpenAI API
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are Andreea, the Ahauros AI mentor. Always reply strictly in ${language}, regardless of the input language.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    // Returnează răspunsul GPT
    res.json({ 
      reply: response.data.choices[0].message.content 
    });

  } catch (error) {
    console.error("GPT API Error:", error.response?.data || error.message);
    
    // Returnează eroare generică pentru client
    res.status(500).json({ 
      error: "Failed to get response from AI assistant" 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Andreea Service running on port ${PORT}`);
  console.log(`🤖 GPT Integration: ${process.env.OPENAI_API_KEY ? 'Configured' : 'Not configured'}`);
});
