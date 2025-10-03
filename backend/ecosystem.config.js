module.exports = {
  apps: [
    {
      name: "ahauros-backend",
      script: "src/server.js",
      instances: "max",         // Folosește toate core-urile disponibile
      exec_mode: "cluster",     // Cluster mode pentru load balancing
      watch: false,             // Dezactivează watch în producție
      env: {
        NODE_ENV: "production",
        PORT: 3001,
        OPENAI_API_KEY: process.env.OPENAI_API_KEY,
        ANDREEA_SERVICE_URL: process.env.ANDREEA_SERVICE_URL,
        ADS_SERVICE_URL: process.env.ADS_SERVICE_URL,
        FRAUD_SERVICE_URL: process.env.FRAUD_SERVICE_URL,
        COURIER_SERVICE_URL: process.env.COURIER_SERVICE_URL,
        NEUROMARKETING_SERVICE_URL: process.env.NEUROMARKETING_SERVICE_URL,
        SUPPLIER_SERVICE_URL: process.env.SUPPLIER_SERVICE_URL
      }
    }
  ]
};
