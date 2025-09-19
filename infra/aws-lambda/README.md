# AWS Lambda Functions

Funcții serverless pentru sistemul Ahauros AI.

## Funcții

- `data-processor` - Procesare date în timp real
- `ai-inference` - Inferență modele AI
- `notification-sender` - Trimite notificări

## Deployment

```bash
# Build și deploy
npm run build
npm run deploy

# Test local
npm run test
```

## Configurare

- Runtime: Node.js 18.x / Python 3.9
- Memory: 512MB - 3GB
- Timeout: 15 minute
- VPC: Configurat pentru acces la baze de date

