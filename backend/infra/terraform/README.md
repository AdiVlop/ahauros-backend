# Ahauros Backend Monitoring Infrastructure

## 📋 Overview
Infrastructure pentru monitorizarea backend-ului Ahauros cu CloudWatch, SNS și alerte automate.

## 🚀 Components

### 1. CloudWatch Logging
- **Log Group**: `/ahauros/admin-backend`
- **Retention**: 14 zile
- **Streams**: ECS container logs

### 2. Metric Filters
- **ERROR**: Detectează erori în loguri
- **OpenAI Timeouts**: Monitorizează timeout-uri OpenAI
- **CORS Errors**: Detectează probleme CORS
- **Andreea Requests**: Numără requesturile către Andreea GPT

### 3. Alarms
- **High Errors**: >5 erori/minut
- **OpenAI Timeouts**: >3 timeout-uri/5 minute
- **CORS Errors**: >10 erori CORS/minut
- **Andreea GPT Errors**: >3 erori/minut

### 4. Notifications
- **Email**: admin@ahauros.io
- **Slack**: Webhook integration
- **SNS Topics**: Critical și Performance alerts

## 🔧 Setup Instructions

### 1. Configure Variables
```bash
# Setează Slack webhook URL
export TF_VAR_slack_webhook_url="https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK"
```

### 2. Deploy Infrastructure
```bash
cd backend/infra/terraform
terraform init
terraform plan
terraform apply
```

### 3. Configure ECS Task Definition
```bash
# Update ECS service cu noua task definition
aws ecs update-service \
  --cluster ahauros-cluster \
  --service admin-backend \
  --task-definition ahauros-admin-backend
```

## 📊 Monitoring Dashboard

### CloudWatch Dashboard
- **URL**: https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards:name=Ahauros-AdminBackend
- **Metrics**: Error counts, timeouts, CORS errors, request counts

### Key Metrics
1. **AdminBackendErrorCount** - Total erori backend
2. **OpenAITimeoutCount** - Timeout-uri OpenAI
3. **CORSErrorCount** - Erori CORS
4. **AndreeaRequestCount** - Requesturi Andreea GPT

## 🚨 Alerting Rules

### Critical Alerts (SNS: critical-alerts)
- Andreea GPT errors >3/minut
- Authentication failures pentru adrian@payai.ro
- Rate limiting exceeded

### Performance Alerts (SNS: performance-alerts)
- OpenAI timeouts >3/5 minute
- CORS errors >10/minut
- High error rate >5/minut

## 📧 Email Notifications

### Recipients
- **Primary**: admin@ahauros.io
- **Backup**: adrian@payai.ro

### Alert Types
1. **Critical**: Erori care afectează funcționalitatea
2. **Performance**: Probleme de performanță
3. **Security**: Tentative de autentificare eșuate

## 🔍 Log Analysis

### Log Patterns
```bash
# Erori generale
ERROR

# OpenAI timeouts
OpenAI request timed out

# CORS problems
CORS blocked

# Andreea GPT requests
Andreea GPT request

# Auth failures
Authentication failed for user adrian@payai.ro
```

### Log Queries
```bash
# Erori în ultima oră
aws logs filter-log-events \
  --log-group-name /ahauros/admin-backend \
  --filter-pattern "ERROR" \
  --start-time $(date -d '1 hour ago' +%s)000
```

## 🛠️ Troubleshooting

### Common Issues
1. **Logs nu apar**: Verifică ECS task definition și IAM permissions
2. **Alerts nu funcționează**: Verifică SNS topic subscriptions
3. **Dashboard gol**: Verifică metric filters și log patterns

### Debug Commands
```bash
# Verifică log group
aws logs describe-log-groups --log-group-name-prefix /ahauros

# Verifică metric filters
aws logs describe-metric-filters --log-group-name /ahauros/admin-backend

# Verifică alarms
aws cloudwatch describe-alarms --alarm-names AdminBackendHighErrors
```

## 📈 Cost Optimization

### Recommendations
1. **Log Retention**: 14 zile (optimizat pentru cost)
2. **Metric Filters**: Doar pentru pattern-uri importante
3. **Alarm Thresholds**: Setate pentru a evita false positives

### Estimated Costs
- **CloudWatch Logs**: ~$5-10/lună
- **CloudWatch Metrics**: ~$2-5/lună
- **SNS Notifications**: ~$1-2/lună

## 🔐 Security

### IAM Permissions
- **ECS Execution Role**: CloudWatch logs write
- **Lambda Role**: SNS publish, CloudWatch read
- **Task Role**: Secrets Manager access

### Secrets Management
- **OpenAI API Key**: Stocat în AWS Secrets Manager
- **Slack Webhook**: Configurat ca environment variable
- **Email Credentials**: Gestionate prin SNS

## 📞 Support

### Contact
- **Admin**: admin@ahauros.io
- **Developer**: adrian@payai.ro
- **Slack**: #ahauros-alerts

### Escalation
1. **Level 1**: Automated alerts
2. **Level 2**: Email notifications
3. **Level 3**: Slack alerts
4. **Level 4**: Phone call (critical issues)
