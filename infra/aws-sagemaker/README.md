# AWS SageMaker

Modele de machine learning și AI pentru sistemul Ahauros.

## Modele

- `nlp-model` - Procesare limbaj natural
- `recommendation-engine` - Sistem de recomandări
- `anomaly-detection` - Detectare anomalii

## Training

```bash
# Pregătire date
python prepare_data.py

# Training model
python train_model.py

# Deploy model
python deploy_model.py
```

## Endpoints

- SageMaker Endpoints pentru inferență
- Batch Transform pentru procesare în lot
- Real-time inference pentru aplicații

