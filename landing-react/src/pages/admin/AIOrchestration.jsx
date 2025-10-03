// src/pages/admin/AIOrchestration.jsx
import { useEffect, useState } from "react";
import {
  getAgents,
  getAgentHealth,
  getAgentMetrics,
  trainAgents,
  getReports,
} from "../../services/adminApi";

export default function AIOrchestration() {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [health, setHealth] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [agentsRes, reportsRes] = await Promise.all([
        getAgents(),
        getReports()
      ]);
      setAgents(agentsRes.data.agents || []);
      setReports(reportsRes.data.reports || []);
    } catch (err) {
      setError("Failed to load initial data");
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadAgentData = async (agent) => {
    try {
      setSelectedAgent(agent);
      setLoading(true);
      const [healthRes, metricsRes] = await Promise.all([
        getAgentHealth(agent),
        getAgentMetrics(agent)
      ]);
      setHealth(healthRes.data);
      setMetrics(metricsRes.data.metrics);
    } catch (err) {
      setError(`Failed to load data for ${agent}`);
      console.error("Error loading agent data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTrain = async () => {
    try {
      setLoading(true);
      await trainAgents({ message: "Retrain all agents" });
      alert("Training started with Andreea!");
      // Reload reports after training
      const reportsRes = await getReports();
      setReports(reportsRes.data.reports || []);
    } catch (err) {
      setError("Failed to start training");
      console.error("Training error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && agents.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center">Loading AI Orchestration...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">AI Orchestration</h1>
        <button
          onClick={handleTrain}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg shadow-md transition-colors"
        >
          {loading ? "Training..." : "Train Agents with Andreea"}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agents List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Available Agents</h2>
          <div className="space-y-3">
            {agents.map((agent) => (
              <div
                key={agent.name}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">{agent.name}</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      agent.status === 'online' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {agent.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{agent.description}</p>
                </div>
                <button
                  onClick={() => loadAgentData(agent.name)}
                  className="ml-3 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Agent Details */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {selectedAgent ? (
            <>
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Agent: {selectedAgent}
              </h2>
              
              {health && (
                <div className="mb-6">
                  <h3 className="font-medium text-gray-700 mb-2">Health Status</h3>
                  <div className="bg-gray-50 p-3 rounded">
                    <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                      {JSON.stringify(health, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {metrics && (
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Performance Metrics</h3>
                  <div className="bg-gray-50 p-3 rounded">
                    <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                      {JSON.stringify(metrics, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center text-gray-500 py-8">
              Select an agent to view details
            </div>
          )}
        </div>
      </div>

      {/* Andreea Reports */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Andreea Training Reports</h2>
        {reports.length > 0 ? (
          <div className="space-y-3">
            {reports.map((report, i) => (
              <div key={i} className="border-l-4 border-blue-500 pl-4 py-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">
                    {report.agent} - {report.status}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(report.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-700 mt-1">{report.text}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-4">
            No training reports available yet
          </div>
        )}
      </div>
    </div>
  );
}
