# 🚨 ANDREEA SERVICE - RAPORT ERORI

## ❌ **PROBLEME IDENTIFICATE:**

### 1. **OPENAI_API_KEY Missing Error**
```
OpenAIError: The OPENAI_API_KEY environment variable is missing or empty
```

**Cauză:** 
- Fișierul `.env` nu există în `andreea-service/`
- Environment variable nu este încărcat

**Soluție:**
- Creez fișierul `.env` cu `OPENAI_API_KEY`
- Adaug `dotenv.config()` în `server.js`

### 2. **Import Error în server.js**
```javascript
import andreeaRoutes from "./routes/andreea.js";
```

**Cauză:**
- `server.js` încearcă să importe `andreeaRoutes` dar nu are `dotenv.config()`
- OpenAI client se inițializează la import, fără API key

**Soluție:**
- Adaug `dotenv.config()` la începutul `server.js`
- Mut inițializarea OpenAI client în funcții, nu la import

### 3. **Port Conflict**
```
Port 8000 already in use by centrak-service
```

**Cauză:**
- Portul 8000 este ocupat de alt serviciu
- Andreea Service nu poate porni

**Soluție:**
- Folosesc port diferit (8001, 8002, etc.)
- Sau opresc serviciul care ocupă portul 8000

### 4. **Missing Dependencies**
- `openai` package instalat dar nu funcționează
- `zod` package instalat dar nu este folosit corect

---

## 🔧 **CORECTĂRI NECESARE:**

### **1. Fix server.js:**
```javascript
import express from "express";
import cors from "cors";
import dotenv from "dotenv"; // ✅ Adaugat
import andreeaRoutes from "./routes/andreea.js";

dotenv.config(); // ✅ Adaugat

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/andreea", andreeaRoutes);

const PORT = process.env.PORT || 8001; // ✅ Port diferit
app.listen(PORT, () => {
  console.log(`AI Support Service running on port ${PORT}`);
});
```

### **2. Fix openai.js:**
```javascript
import OpenAI from "openai";

// ✅ Lazy initialization - nu se inițializează la import
let client = null;

function getClient() {
  if (!client) {
    client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      defaultHeaders: { "User-Agent": "AhaurosAI/1.0" },
      timeout: 30000,
    });
  }
  return client;
}

export async function ask(prompt, userId) {
  const openaiClient = getClient();
  const completion = await openaiClient.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  return completion.choices[0].message.content;
}
```

### **3. Creez .env file:**
```env
OPENAI_API_KEY=your-openai-api-key-here
PORT=8001
```

### **4. Fix andreea.js:**
```javascript
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
```

---

## 🧪 **TESTE PENTRU VERIFICARE:**

### **1. Test Environment:**
```bash
cd /Users/adrianpersonal/Desktop/ahauros-backup/andreea-service
echo $OPENAI_API_KEY  # Trebuie să afișeze cheia
```

### **2. Test Service:**
```bash
PORT=8001 npm run dev
# Trebuie să afișeze: "AI Support Service running on port 8001"
```

### **3. Test Health:**
```bash
curl -X GET "http://localhost:8001/health"
# Trebuie să returneze: {"status":"ok"}
```

### **4. Test GPT:**
```bash
curl -X POST "http://localhost:8001/andreea/gpt" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello Andreea"}'
# Trebuie să returneze: {"success": true, "answer": "..."}
```

---

## 📋 **PAȘI PENTRU CORECTARE:**

1. **Creez .env file** cu OPENAI_API_KEY
2. **Adaug dotenv.config()** în server.js
3. **Fix openai.js** cu lazy initialization
4. **Testez pe port diferit** (8001)
5. **Verific toate endpoint-urile**

---

## 🎯 **STATUS ACTUAL:**

- ❌ **Environment** - OPENAI_API_KEY missing
- ❌ **Server** - Nu pornește din cauza OpenAI error
- ❌ **Port** - 8000 ocupat de centrak-service
- ❌ **Dependencies** - Instalate dar nu funcționează corect

**Necesită corectări pentru a funcționa!** 🔧
