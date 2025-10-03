// Admin AI routes for orchestrating AI agents
import express from 'express';
import { isAdmin } from '../middleware/auth.js';
import { addReport, getReports, getReportsByAgent } from '../services/reports.js';
import { generateAndreeaMessage, generateStatusMessage } from '../services/openai.js';

const router = express.Router();

// Valid AI agents
const VALID_AGENTS = [
  'ads', 'fraud', 'courier', 'neuromarketing', 
  'supplier', 'pricing', 'forecast', 'profit'
];

// =================== Andreea GPT Orchestration ===================

/**
 * POST /admin/ai/andreea/train
 * Train an AI agent through Andreea
 */
router.post('/ai/andreea/train', isAdmin, async (req, res) => {
  try {
    const { agent } = req.body;

    if (!agent) {
      return res.status(400).json({ error: 'Agent name is required' });
    }

    if (!VALID_AGENTS.includes(agent)) {
      return res.status(400).json({ 
        error: 'Invalid agent name',
        validAgents: VALID_AGENTS
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    // Generate Andreea training message
    const andreeaMessage = await generateAndreeaMessage(agent, 'train');
    
    // Save report
    const report = addReport(agent, andreeaMessage, 'started');

    res.json({
      success: true,
      message: `Training started for ${agent} agent`,
      andreeaMessage,
      report
    });

  } catch (error) {
    console.error('Training error:', error);
    res.status(500).json({ 
      error: 'Failed to start training',
      message: error.message
    });
  }
});

/**
 * GET /admin/ai/andreea/reports
 * Get Andreea training reports
 */
router.get('/ai/andreea/reports', isAdmin, (req, res) => {
  try {
    const { agent, limit = 20 } = req.query;
    
    let reports;
    if (agent) {
      if (!VALID_AGENTS.includes(agent)) {
        return res.status(400).json({ 
          error: 'Invalid agent name',
          validAgents: VALID_AGENTS
        });
      }
      reports = getReportsByAgent(agent, parseInt(limit));
    } else {
      reports = getReports(parseInt(limit));
    }

    res.json({
      success: true,
      reports,
      count: reports.length
    });

  } catch (error) {
    console.error('Reports error:', error);
    res.status(500).json({ 
      error: 'Failed to get reports',
      message: error.message
    });
  }
});

// =================== Agent Health & Metrics ===================

/**
 * GET /admin/ai/:agent/health
 * Get agent health status
 */
router.get('/ai/:agent/health', isAdmin, async (req, res) => {
  try {
    const { agent } = req.params;

    if (!VALID_AGENTS.includes(agent)) {
      return res.status(400).json({ 
        error: 'Invalid agent name',
        validAgents: VALID_AGENTS
      });
    }

    // Simulate health check (in real implementation, this would check actual services)
    const isOnline = Math.random() > 0.1; // 90% chance of being online
    const status = isOnline ? 'online' : 'offline';
    
    // Generate status message from Andreea
    const statusMessage = await generateStatusMessage(agent, status);

    res.json({
      agent,
      status,
      timestamp: new Date().toISOString(),
      message: statusMessage,
      uptime: isOnline ? Math.floor(Math.random() * 86400) : 0, // Random uptime in seconds
      lastCheck: new Date().toISOString()
    });

  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ 
      error: 'Failed to check agent health',
      message: error.message
    });
  }
});

/**
 * GET /admin/ai/:agent/metrics
 * Get agent performance metrics
 */
router.get('/ai/:agent/metrics', isAdmin, (req, res) => {
  try {
    const { agent } = req.params;

    if (!VALID_AGENTS.includes(agent)) {
      return res.status(400).json({ 
        error: 'Invalid agent name',
        validAgents: VALID_AGENTS
      });
    }

    // Generate mock metrics (in real implementation, this would come from actual services)
    const metrics = {
      agent,
      accuracy: Math.round((Math.random() * 20 + 80) * 100) / 100, // 80-100%
      efficiency: Math.round((Math.random() * 15 + 85) * 100) / 100, // 85-100%
      lastTraining: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(), // Last 7 days
      totalPredictions: Math.floor(Math.random() * 10000 + 1000),
      successRate: Math.round((Math.random() * 10 + 90) * 100) / 100, // 90-100%
      responseTime: Math.round((Math.random() * 500 + 100) * 100) / 100, // 100-600ms
      memoryUsage: Math.round((Math.random() * 30 + 20) * 100) / 100, // 20-50%
      cpuUsage: Math.round((Math.random() * 40 + 10) * 100) / 100, // 10-50%
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      metrics
    });

  } catch (error) {
    console.error('Metrics error:', error);
    res.status(500).json({ 
      error: 'Failed to get agent metrics',
      message: error.message
    });
  }
});

/**
 * GET /admin/ai/agents
 * Get list of all available agents
 */
router.get('/ai/agents', isAdmin, (req, res) => {
  try {
    const agents = VALID_AGENTS.map(agent => ({
      name: agent,
      description: getAgentDescription(agent),
      status: Math.random() > 0.1 ? 'online' : 'offline',
      lastActivity: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
    }));

    res.json({
      success: true,
      agents,
      count: agents.length
    });

  } catch (error) {
    console.error('Agents list error:', error);
    res.status(500).json({ 
      error: 'Failed to get agents list',
      message: error.message
    });
  }
});

// Helper function to get agent descriptions
function getAgentDescription(agent) {
  const descriptions = {
    ads: 'Ads AI - optimizes advertising campaigns and budget allocation',
    fraud: 'Fraud Detection AI - identifies and prevents fraudulent transactions',
    courier: 'Courier AI - optimizes delivery routes and logistics',
    neuromarketing: 'Neuromarketing AI - analyzes customer behavior and preferences',
    supplier: 'Supplier AI - manages supplier relationships and procurement',
    pricing: 'Pricing AI - optimizes product pricing strategies',
    forecast: 'Forecast AI - predicts sales and demand patterns',
    profit: 'Profit AI - analyzes profitability and financial metrics'
  };
  
  return descriptions[agent] || `${agent} AI agent`;
}

export default router;
