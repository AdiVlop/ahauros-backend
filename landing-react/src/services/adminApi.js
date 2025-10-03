// src/services/adminApi.js
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3001";

const adminClient = axios.create({
  baseURL: `${API_BASE}/admin/ai`,
  headers: {
    "Content-Type": "application/json",
    "x-dashboard-role": "admin",
  },
});

// Listează agenții disponibili
export const getAgents = () => adminClient.get("/agents");

// Health & Metrics pentru un agent
export const getAgentHealth = (agent) => adminClient.get(`/${agent}/health`);
export const getAgentMetrics = (agent) => adminClient.get(`/${agent}/metrics`);

// Andreea orchestration
export const trainAgents = (payload) =>
  adminClient.post("/andreea/train", payload);
export const getReports = () => adminClient.get("/andreea/reports");
