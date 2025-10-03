# ============================
# Performance Monitoring
# ============================

# Metric Filter pentru timeout-uri OpenAI
resource "aws_cloudwatch_log_metric_filter" "openai_timeouts" {
  name           = "OpenAITimeouts"
  log_group_name = aws_cloudwatch_log_group.admin_backend.name

  pattern = "OpenAI request timed out"

  metric_transformation {
    name      = "OpenAITimeoutCount"
    namespace = "Ahauros/AdminBackend"
    value     = "1"
  }
}

# Metric Filter pentru CORS errors
resource "aws_cloudwatch_log_metric_filter" "cors_errors" {
  name           = "CORSErrors"
  log_group_name = aws_cloudwatch_log_group.admin_backend.name

  pattern = "CORS blocked"

  metric_transformation {
    name      = "CORSErrorCount"
    namespace = "Ahauros/AdminBackend"
    value     = "1"
  }
}

# Metric Filter pentru Andreea GPT requests
resource "aws_cloudwatch_log_metric_filter" "andreea_requests" {
  name           = "AndreeaRequests"
  log_group_name = aws_cloudwatch_log_group.admin_backend.name

  pattern = "Andreea GPT request"

  metric_transformation {
    name      = "AndreeaRequestCount"
    namespace = "Ahauros/AdminBackend"
    value     = "1"
  }
}

# ============================
# Alarms pentru Performance
# ============================

# Alarm pentru OpenAI timeouts
resource "aws_cloudwatch_metric_alarm" "openai_timeout_alarm" {
  alarm_name          = "OpenAITimeoutHigh"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "OpenAITimeoutCount"
  namespace           = "Ahauros/AdminBackend"
  period              = 300
  statistic           = "Sum"
  threshold           = 3

  alarm_description = "Trigger if more than 3 OpenAI timeouts in 5 minutes"
  alarm_actions     = [aws_sns_topic.admin_backend_alerts.arn]
}

# Alarm pentru CORS errors
resource "aws_cloudwatch_metric_alarm" "cors_error_alarm" {
  alarm_name          = "CORSErrorHigh"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "CORSErrorCount"
  namespace           = "Ahauros/AdminBackend"
  period              = 60
  statistic           = "Sum"
  threshold           = 10

  alarm_description = "Trigger if more than 10 CORS errors in 1 minute"
  alarm_actions     = [aws_sns_topic.admin_backend_alerts.arn]
}

# ============================
# Dashboard pentru monitoring
# ============================
resource "aws_cloudwatch_dashboard" "admin_backend_dashboard" {
  dashboard_name = "Ahauros-AdminBackend"

  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 12
        height = 6

        properties = {
          metrics = [
            ["Ahauros/AdminBackend", "AdminBackendErrorCount"],
            ["Ahauros/AdminBackend", "OpenAITimeoutCount"],
            ["Ahauros/AdminBackend", "CORSErrorCount"],
            ["Ahauros/AdminBackend", "AndreeaRequestCount"]
          ]
          view    = "timeSeries"
          stacked = false
          region  = "us-east-1"
          title   = "Backend Metrics"
          period  = 300
        }
      }
    ]
  })
}
