# Andreea Service

AI Service for Ahauros platform providing GPT integration through Andreea AI mentor.

## Features

- **GPT Integration**: OpenAI API integration with gpt-4o-mini model
- **Multi-language Support**: Responses in English, Romanian, French, Spanish, Portuguese
- **Health Check**: `/health` endpoint for monitoring
- **Docker Ready**: Containerized with PM2 for production
- **AWS ECS**: Deployed on AWS Fargate

## API Endpoints

### Health Check
```
GET /health
```

### GPT Chat
```
POST /andreea/gpt
Content-Type: application/json

{
  "prompt": "Hello Andreea, who are you?",
  "language": "English"
}
```

## Environment Variables

- `OPENAI_API_KEY`: OpenAI API key for GPT integration
- `PORT`: Server port (default: 3002)
- `NODE_ENV`: Environment (production/development)

## Docker

```bash
# Build image
docker build -t andreea-service .

# Run container
docker run -p 3002:3002 -e OPENAI_API_KEY=your-key andreea-service
```

## Deployment

The service is automatically deployed to AWS ECS through GitHub Actions when pushing to main branch.

## Production URL

- **Service**: https://api.ahauros.io/andreea/gpt
- **Health**: https://api.ahauros.io/health
