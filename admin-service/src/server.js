import express from "express";
import cors from "cors";
import { dbHealth } from "./db/index.js";
import authRouter from "./routes/auth.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health",(req,res)=>res.json({status:"ok", service:"ahauros-admin-service"}));
app.get("/db/health", async (req,res)=>{
  const ok = await dbHealth();
  res.status(ok?200:500).json({ db: ok });
});
app.use("/auth", authRouter);

const PORT=process.env.PORT||3001;
app.listen(PORT,()=>console.log("✅ Service on",PORT));

