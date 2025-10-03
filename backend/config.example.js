// Copy this file to .env and update with your actual values

export const config = {
  // MongoDB Connection
  MONGO_URI: "mongodb+srv://username:password@cluster.mongodb.net/ahauros-ai?retryWrites=true&w=majority",
  
  // JWT Secret (generate a strong secret key)
  JWT_SECRET: "your_super_secret_jwt_key_here_change_this_in_production",
  
  // Email Configuration (Gmail)
  EMAIL_USER: "youremail@gmail.com",
  EMAIL_PASS: "your_app_password_here",
  
  // Frontend URL
  FRONTEND_URL: "http://localhost:5173",
  
  // Server Port
  PORT: 3001,
  
  // OpenAI API Key for Andreea GPT
  OPENAI_API_KEY: "your-openai-api-key-here",
  
  // Andreea Service URL (for reverse proxy)
  ANDREEA_SERVICE_URL: "http://andreea-service:3002",
  
  // AI Agents Service URLs (for reverse proxy)
  ADS_SERVICE_URL: "http://ads-service:3005",
  FRAUD_SERVICE_URL: "http://fraud-service:3006",
  COURIER_SERVICE_URL: "http://courier-service:3007",
  NEUROMARKETING_SERVICE_URL: "http://neuromarketing-service:3008",
  SUPPLIER_SERVICE_URL: "http://supplier-service:3009",
  
  // Environment
  NODE_ENV: "development"
};

// Instructions:
// 1. Create a .env file in the backend directory
// 2. Copy the values above into the .env file
// 3. Update with your actual MongoDB URI, email credentials, etc.
// 4. Make sure to use Gmail App Password for EMAIL_PASS
// 5. Get your OpenAI API key from https://platform.openai.com/api-keys
// 6. ANDREEA_SERVICE_URL is used for reverse proxy to Andreea Service
// 7. AI Agents Service URLs are used for reverse proxy to internal AI agents
// 8. Update service URLs based on your Docker/ECS deployment configuration

