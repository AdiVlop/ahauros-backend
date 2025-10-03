import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import { createProxyMiddleware } from "http-proxy-middleware";
import authRoutes from "./routes/auth.js";

dotenv.config();
const app = express();

// Middleware
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());

// Reverse proxy pentru Andreea Service
const andreeaServiceUrl = process.env.ANDREEA_SERVICE_URL || "http://andreea-service:3002";
app.use(
  "/andreea/gpt",
  createProxyMiddleware({
    target: andreeaServiceUrl,
    changeOrigin: true,
    timeout: 10000,
    logLevel: "debug",
    onError: (err, req, res) => {
      console.error("Proxy error:", err.message);
      res.status(500).json({ error: "Andreea Service unavailable" });
    }
  })
);

// Proxy routing pentru agenții interni AI
app.use(
  "/ads",
  createProxyMiddleware({
    target: process.env.ADS_SERVICE_URL || "http://ads-service:3005",
    changeOrigin: true,
    pathRewrite: { "^/ads": "" },
    timeout: 10000,
    onError: (err, req, res) => {
      console.error("Ads Service proxy error:", err.message);
      res.status(500).json({ error: "Ads Service unavailable" });
    }
  })
);

app.use(
  "/fraud",
  createProxyMiddleware({
    target: process.env.FRAUD_SERVICE_URL || "http://fraud-service:3006",
    changeOrigin: true,
    pathRewrite: { "^/fraud": "" },
    timeout: 10000,
    onError: (err, req, res) => {
      console.error("Fraud Service proxy error:", err.message);
      res.status(500).json({ error: "Fraud Service unavailable" });
    }
  })
);

app.use(
  "/courier",
  createProxyMiddleware({
    target: process.env.COURIER_SERVICE_URL || "http://courier-service:3007",
    changeOrigin: true,
    pathRewrite: { "^/courier": "" },
    timeout: 10000,
    onError: (err, req, res) => {
      console.error("Courier Service proxy error:", err.message);
      res.status(500).json({ error: "Courier Service unavailable" });
    }
  })
);

app.use(
  "/neuromarketing",
  createProxyMiddleware({
    target: process.env.NEUROMARKETING_SERVICE_URL || "http://neuromarketing-service:3008",
    changeOrigin: true,
    pathRewrite: { "^/neuromarketing": "" },
    timeout: 10000,
    onError: (err, req, res) => {
      console.error("Neuromarketing Service proxy error:", err.message);
      res.status(500).json({ error: "Neuromarketing Service unavailable" });
    }
  })
);

app.use(
  "/supplier",
  createProxyMiddleware({
    target: process.env.SUPPLIER_SERVICE_URL || "http://supplier-service:3009",
    changeOrigin: true,
    pathRewrite: { "^/supplier": "" },
    timeout: 10000,
    onError: (err, req, res) => {
      console.error("Supplier Service proxy error:", err.message);
      res.status(500).json({ error: "Supplier Service unavailable" });
    }
  })
);

// MongoDB connection (optional for testing)
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB connected successfully"))
    .catch(err => console.error("❌ MongoDB connection error:", err));
} else {
  console.log("⚠️ MongoDB not configured - running without database");
}

// Routes
app.use("/auth", authRoutes);

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ message: "Ahauros AI Backend API is running!" });
});

// Health-check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

// =================== Profit API ===================
app.get("/profit/overview", (req, res) => {
  res.json({
    netProfit: 12450,
    adsSpend: 5200,
    roi: 139,
    predictions: 15800,
    totalUsers: 1247,
    activeCampaigns: 23,
    fraudDetected: 12,
    aiRecommendations: 45
  });
});

app.get("/profit/profit-ads", (req, res) => {
  res.json([
    { channel: "Facebook", spend: 3200, roi: 140 },
    { channel: "Google", spend: 4500, roi: 170 },
    { channel: "TikTok", spend: 2100, roi: 130 }
  ]);
});

app.get("/profit/fraud-returns", (req, res) => {
  res.json([
    { month: "Jan", fraud: 12, returns: 3 },
    { month: "Feb", fraud: 18, returns: 5 },
    { month: "Mar", fraud: 14, returns: 4 },
    { month: "Apr", fraud: 20, returns: 6 }
  ]);
});

// =================== Supplier Optimizer ===================
app.get("/supplier-optimizer/forecast", (req, res) => {
  res.json([
    { product: "Product A", current: 150, forecast: 200, reorder: 50 },
    { product: "Product B", current: 90, forecast: 120, reorder: 30 },
    { product: "Product C", current: 200, forecast: 240, reorder: 40 }
  ]);
});

app.get("/supplier-optimizer/stock-suppliers", (req, res) => {
  res.json([
    { id: 1, name: "Supplier A", rating: 4.5, deliveries: 120 },
    { id: 2, name: "Supplier B", rating: 4.2, deliveries: 98 },
    { id: 3, name: "Supplier C", rating: 3.9, deliveries: 76 }
  ]);
});

// =================== Andreea GPT API ===================
// Ruta /andreea/gpt este acum proxy-uită către Andreea Service
// Configurarea proxy-ului este în middleware-urile de mai sus

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📧 Email service: ${process.env.EMAIL_USER ? 'Configured' : 'Not configured'}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'Not set'}`);
});
