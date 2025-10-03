# ============================
# CloudWatch Log Group
# ============================
resource "aws_cloudwatch_log_group" "admin_backend" {
  name              = "/ahauros/admin-backend"
  retention_in_days = 14
  tags = {
    Project = "Ahauros"
    Service = "AdminBackend"
  }
}

# ============================
# Metric Filter - detectăm erori
# ============================
resource "aws_cloudwatch_log_metric_filter" "admin_backend_errors" {
  name           = "AdminBackendErrors"
  log_group_name = aws_cloudwatch_log_group.admin_backend.name

  pattern = "ERROR"

  metric_transformation {
    name      = "AdminBackendErrorCount"
    namespace = "Ahauros/AdminBackend"
    value     = "1"
  }
}

# ============================
# Alarm pentru erori
# ============================
resource "aws_cloudwatch_metric_alarm" "admin_backend_alarm" {
  alarm_name          = "AdminBackendHighErrors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "AdminBackendErrorCount"
  namespace           = "Ahauros/AdminBackend"
  period              = 60
  statistic           = "Sum"
  threshold           = 5

  alarm_description = "Trigger if more than 5 errors appear in 1 minute"
  alarm_actions     = [aws_sns_topic.admin_backend_alerts.arn]
}

# ============================
# SNS Topic pentru alerte
# ============================
resource "aws_sns_topic" "admin_backend_alerts" {
  name = "admin-backend-alerts"
}

# ============================
# Email Subscription
# ============================
resource "aws_sns_topic_subscription" "admin_backend_email" {
  topic_arn = aws_sns_topic.admin_backend_alerts.arn
  protocol  = "email"
  endpoint  = "admin@ahauros.io" # ✅ schimbă cu emailul tău
}

# ============================
# Slack Webhook Subscription (opțional)
# ============================
resource "aws_sns_topic_subscription" "admin_backend_slack" {
  topic_arn = aws_sns_topic.admin_backend_alerts.arn
  protocol  = "https"
  endpoint  = "https://hooks.slack.com/services/XXXXX/XXXXX/XXXXX" # ✅ Slack Incoming Webhook
}
