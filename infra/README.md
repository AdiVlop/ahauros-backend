# Infrastructure

Infrastructura și configurații pentru deployment și monitorizare.

## Componente

- `aws-lambda/` - Funcții AWS Lambda
- `aws-sagemaker/` - Modele AWS SageMaker
- `monitoring/` - Monitorizare și alerting
- `ci-cd/` - Pipeline CI/CD

## Deployment

- **Development**: Docker Compose local
- **Staging**: AWS ECS / Kubernetes
- **Production**: AWS EKS cu auto-scaling

## Monitorizare

- Prometheus + Grafana
- CloudWatch
- ELK Stack pentru logging

