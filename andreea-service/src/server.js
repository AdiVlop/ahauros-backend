import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import andreeaRoutes from "./routes/andreea.js";

dotenv.config();

const app = express();
app.use(cors()); // ✅ fix CORS
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// ✅ montează ruta Andreea
app.use("/andreea", andreeaRoutes);

// ✅ port diferit pentru testare
const PORT = process.env.PORT || 8001;
app.listen(PORT, () => {
  console.log(`AI Support Service running on port ${PORT}`);
});
