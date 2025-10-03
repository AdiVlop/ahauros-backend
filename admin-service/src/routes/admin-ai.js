import { Router } from "express";
import axios from "axios";

const router = Router();

// Valid AI agents
const VALID_AGENTS = [
  'ads', 'fraud', 'courier', 'neuromarketing', 
  'supplier', 'pricing', 'forecast', 'profit'
];

// Simple in-memory storage for training reports
let reports = [];

// Helper function to add report
function addReport(agent, text, status = "started") {
  const report = {
    id: Date.now() + Math.random(),
    timestamp: new Date().toISOString(),
    agent,
    text,
    status
  };
  
  reports.unshift(report); // Add to beginning
  
  // Keep only last 50 reports
  if (reports.length > 50) {
    reports = reports.slice(0, 50);
  }
  
  return report;
}

// Helper function to get reports
function getReports(limit = 20) {
  return reports.slice(0, limit);
}

// Helper function to get reports by agent
function getReportsByAgent(agent, limit = 10) {
  return reports
    .filter(report => report.agent === agent)
    .slice(0, limit);
}

// Helper function to generate Andreea message
async function generateAndreeaMessage(agent, action = 'train') {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const agentDescriptions = {
    ads: 'Ads AI - optimizes advertising campaigns and budget allocation',
    fraud: 'Fraud Detection AI - identifies and prevents fraudulent transactions',
    courier: 'Courier AI - optimizes delivery routes and logistics',
    neuromarketing: 'Neuromarketing AI - analyzes customer behavior and preferences',
    supplier: 'Supplier AI - manages supplier relationships and procurement',
    pricing: 'Pricing AI - optimizes product pricing strategies',
    forecast: 'Forecast AI - predicts sales and demand patterns',
    profit: 'Profit AI - analyzes profitability and financial metrics'
  };

  const agentDescription = agentDescriptions[agent] || `${agent} AI agent`;

  const systemPrompt = `You are Andreea, the Ahauros AI mentor and orchestrator. You are responsible for training and managing AI agents. Always respond in Romanian and be professional but friendly. Your responses should be informative and show expertise in AI training.`;

  const userPrompt = `Am început ${action === 'train' ? 'antrenamentul' : action === 'optimize' ? 'optimizarea' : 'analiza'} pentru ${agentDescription}. Generează un mesaj profesional care să explice ce se întâmplă și ce rezultate se așteaptă. Include detalii tehnice despre îmbunătățiri și metrici estimate.`;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API Error:', error.response?.data || error.message);
    throw new Error('Failed to generate Andreea message');
  }
}

// Helper function to generate status message
async function generateStatusMessage(agent, status) {
  if (!process.env.OPENAI_API_KEY) {
    return `Agentul ${agent} este ${status === 'online' ? 'activ' : 'inactiv'}.`;
  }

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are Andreea, the Ahauros AI mentor. Respond in Romanian. Be concise and professional when reporting agent status.'
          },
          {
            role: 'user',
            content: `Generează un mesaj scurt despre statusul agentului ${agent} care este ${status}.`
          }
        ],
        max_tokens: 100,
        temperature: 0.5
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API Error:', error.response?.data || error.message);
    return `Agentul ${agent} este ${status === 'online' ? 'activ' : 'inactiv'}.`;
  }
}

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

// =================== Andreea GPT Orchestration ===================

/**
 * POST /admin/ai/andreea/train
 * Train an AI agent through Andreea
 */
router.post('/andreea/train', async (req, res) => {
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
router.get('/andreea/reports', (req, res) => {
  try {
    const { agent, limit = 20 } = req.query;
    
    let reportsData;
    if (agent) {
      if (!VALID_AGENTS.includes(agent)) {
        return res.status(400).json({ 
          error: 'Invalid agent name',
          validAgents: VALID_AGENTS
        });
      }
      reportsData = getReportsByAgent(agent, parseInt(limit));
    } else {
      reportsData = getReports(parseInt(limit));
    }

    res.json({
      success: true,
      reports: reportsData,
      count: reportsData.length
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
router.get('/:agent/health', async (req, res) => {
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
router.get('/:agent/metrics', (req, res) => {
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
router.get('/agents', (req, res) => {
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

export default router;
