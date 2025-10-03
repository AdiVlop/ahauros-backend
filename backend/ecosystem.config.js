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
        ANDREEA_SERVICE_URL: process.env.ANDREEA_SERVICE_URL
      }
    }
  ]
};
