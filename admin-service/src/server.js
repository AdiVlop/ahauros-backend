import express from "express";
import cors from "cors";
import { dbHealth } from "./db/index.js";
import authRouter from "./routes/auth.js";
import adminAiRouter from "./routes/admin-ai.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health",(req,res)=>res.json({status:"ok", service:"ahauros-admin-service"}));
app.get("/db/health", async (req,res)=>{
  const ok = await dbHealth();
  res.status(ok?200:500).json({ db: ok });
});

// Admin AI routes
app.get("/admin/info", (req, res) => {
  res.json({
    message: "Ahauros Admin AI Routes",
    endpoints: {
      "POST /admin/ai/andreea/train": "Train an AI agent through Andreea",
      "GET /admin/ai/andreea/reports": "Get Andreea training reports",
      "GET /admin/ai/:agent/health": "Get agent health status",
      "GET /admin/ai/:agent/metrics": "Get agent performance metrics",
      "GET /admin/ai/agents": "Get list of all available agents"
    },
    validAgents: ["ads", "fraud", "courier", "neuromarketing", "supplier", "pricing", "forecast", "profit"],
    authentication: "Requires x-dashboard-role: admin header"
  });
});

app.use("/auth", authRouter);
app.use("/admin/ai", adminAiRouter);

const PORT=process.env.PORT||3001;
app.listen(PORT,()=>console.log("✅ Admin Service on",PORT));

