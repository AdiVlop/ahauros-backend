# ============================
# Advanced Alerting Configuration
# ============================

# Lambda function pentru procesarea alertelor
resource "aws_lambda_function" "alert_processor" {
  filename         = "alert_processor.zip"
  function_name    = "ahauros-alert-processor"
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  runtime         = "nodejs18.x"
  timeout         = 30

  environment {
    variables = {
      SLACK_WEBHOOK_URL = var.slack_webhook_url
      ADMIN_EMAIL      = "admin@ahauros.io"
    }
  }
}

# IAM Role pentru Lambda
resource "aws_iam_role" "lambda_role" {
  name = "ahauros-lambda-alert-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# SNS Topic pentru alerte critice
resource "aws_sns_topic" "critical_alerts" {
  name = "ahauros-critical-alerts"
}

# SNS Topic pentru alerte de performanță
resource "aws_sns_topic" "performance_alerts" {
  name = "ahauros-performance-alerts"
}

# ============================
# Alerte pentru User adrian@payai.ro
# ============================

# Alarm pentru autentificare eșuată
resource "aws_cloudwatch_log_metric_filter" "auth_failures" {
  name           = "AuthFailures"
  log_group_name = aws_cloudwatch_log_group.admin_backend.name

  pattern = "Authentication failed for user adrian@payai.ro"

  metric_transformation {
    name      = "AuthFailureCount"
    namespace = "Ahauros/AdminBackend"
    value     = "1"
  }
}

# Alarm pentru rate limiting
resource "aws_cloudwatch_log_metric_filter" "rate_limiting" {
  name           = "RateLimiting"
  log_group_name = aws_cloudwatch_log_group.admin_backend.name

  pattern = "Rate limit exceeded"

  metric_transformation {
    name      = "RateLimitCount"
    namespace = "Ahauros/AdminBackend"
    value     = "1"
  }
}

# ============================
# Alerte pentru Andreea GPT
# ============================

# Alarm pentru Andreea GPT errors
resource "aws_cloudwatch_metric_alarm" "andreea_gpt_errors" {
  alarm_name          = "AndreeaGPTErrors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "AdminBackendErrorCount"
  namespace           = "Ahauros/AdminBackend"
  period              = 60
  statistic           = "Sum"
  threshold           = 3

  alarm_description = "Trigger if Andreea GPT has more than 3 errors in 1 minute"
  alarm_actions     = [aws_sns_topic.critical_alerts.arn]

  dimensions = {
    Service = "AndreeaGPT"
  }
}

# ============================
# Variables
# ============================
variable "slack_webhook_url" {
  description = "Slack webhook URL for notifications"
  type        = string
  default     = ""
}

# ============================
# Outputs
# ============================
output "cloudwatch_log_group_name" {
  description = "CloudWatch Log Group name"
  value       = aws_cloudwatch_log_group.admin_backend.name
}

output "sns_topic_arn" {
  description = "SNS Topic ARN for alerts"
  value       = aws_sns_topic.admin_backend_alerts.arn
}

output "dashboard_url" {
  description = "CloudWatch Dashboard URL"
  value       = "https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards:name=${aws_cloudwatch_dashboard.admin_backend_dashboard.dashboard_name}"
}
