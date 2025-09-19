# CI/CD Pipeline

Pipeline de integrare și deployment continuu.

## Workflow

1. **Build** - Compilare și testare
2. **Test** - Teste unitare și integrare
3. **Security** - Scan vulnerabilități
4. **Deploy** - Deployment automat

## Tehnologii

- **GitHub Actions** - CI/CD pipeline
- **Docker** - Containerizare
- **Kubernetes** - Orchestrare
- **Helm** - Package management

## Environments

- **Development** - Auto-deploy la push
- **Staging** - Deploy manual cu aprobare
- **Production** - Deploy cu review și aprobare

## Comenzi

```bash
# Build local
docker build -t ahauros-backend .

# Test
npm test
python -m pytest

# Deploy
kubectl apply -f k8s/
```

