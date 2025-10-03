import OpenAI from "openai";

// ✅ Lazy initialization - nu se inițializează la import
let client = null;

function getClient() {
  if (!client) {
    client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      defaultHeaders: { "User-Agent": "AhaurosAI/1.0" },
      timeout: 30000,
    });
  }
  return client;
}

export async function ask(prompt, userId) {
  const openaiClient = getClient();
  const completion = await openaiClient.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  return completion.choices[0].message.content;
}
