// OpenAI service for Andreea AI orchestration
import axios from 'axios';

/**
 * Generate training message from Andreea using OpenAI
 * @param {string} agent - Agent name
 * @param {string} action - Action type (train, optimize, analyze)
 * @returns {Promise<string>} Generated message from Andreea
 */
export async function generateAndreeaMessage(agent, action = 'train') {
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

/**
 * Generate status message for agent health check
 * @param {string} agent - Agent name
 * @param {string} status - Agent status (online/offline)
 * @returns {Promise<string>} Generated status message
 */
export async function generateStatusMessage(agent, status) {
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

export default {
  generateAndreeaMessage,
  generateStatusMessage
};
