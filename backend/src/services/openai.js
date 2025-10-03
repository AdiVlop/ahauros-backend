import OpenAI from "openai";

// ✅ verifică dacă API key-ul există la runtime
let client = null;

function getClient() {
  if (!client) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.warn("⚠️ OPENAI_API_KEY not set - OpenAI service will not work");
      return null;
    }
    client = new OpenAI({
      apiKey,
      timeout: 10000, // ✅ fallback timeout la nivel de client
    });
  }
  return client;
}

export async function ask(prompt, userId, options = {}) {
  const openaiClient = getClient();
  if (!openaiClient) {
    throw new Error("OpenAI client not initialized - check OPENAI_API_KEY");
  }
  
  // ✅ elimină signal din options pentru OpenAI API
  const { signal, ...openaiOptions } = options;
  
  const completion = await openaiClient.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    ...openaiOptions,
  });

  return completion.choices[0].message.content;
}

// Admin functions
export async function generateAndreeaMessage(agent, action) {
  const prompt = `Generate a training message for ${agent} agent. Action: ${action}. Keep it concise and professional.`;
  return await ask(prompt);
}

export async function generateStatusMessage(agent, status) {
  const prompt = `Generate a status message for ${agent} agent. Status: ${status}. Keep it concise.`;
  return await ask(prompt);
}