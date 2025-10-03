# Billing Service Configuration

# Build billing Lambda function
resource "null_resource" "build_billing_function" {
  triggers = {
    index_js     = filemd5("../services/billing/index.js")
    package_json = filemd5("../services/billing/package.json")
  }

  provisioner "local-exec" {
    command = <<EOT
      cd ../services/billing
      npm install
      zip -r billing.zip index.js package.json node_modules/
    EOT
  }
}

# Billing Lambda function
resource "aws_lambda_function" "billing" {
  filename         = "../services/billing/billing.zip"
  function_name    = "${local.project_name}-billing"
  role            = aws_iam_role.lambda_execution.arn
  handler         = "index.handler"
  runtime         = "nodejs18.x"
  timeout         = 30
  memory_size     = 256

  environment {
    variables = {
      NODE_ENV                = var.environment
      DATABASE_URL           = "postgresql://${var.db_username}:${random_password.db_password.result}@${aws_db_instance.main.endpoint}/${var.db_name}"
      STRIPE_SECRET_KEY      = var.stripe_secret_key
      STRIPE_WEBHOOK_SECRET  = var.stripe_webhook_secret
      STRIPE_PRICE_STARTER   = var.stripe_price_starter
      STRIPE_PRICE_GROWTH    = var.stripe_price_growth
      STRIPE_PRICE_ENTERPRISE = var.stripe_price_enterprise
      FRONTEND_URL           = "https://app.ahauros.io"
      JWT_SECRET             = var.jwt_secret
    }
  }

  vpc_config {
    subnet_ids         = aws_subnet.private[*].id
    security_group_ids = [aws_security_group.lambda.id]
  }

  depends_on = [
    null_resource.build_billing_function,
    aws_iam_role_policy_attachment.lambda_vpc_access,
    aws_iam_role_policy_attachment.lambda_logs,
    aws_iam_role_policy_attachment.lambda_rds_access
  ]

  tags = {
    Name = "${local.project_name}-billing-function"
  }
}

# Lambda permission for API Gateway
resource "aws_lambda_permission" "billing_api_gateway" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.billing.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

# API Gateway Resources for Billing
resource "aws_api_gateway_resource" "billing" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_rest_api.main.root_resource_id
  path_part   = "billing"
}

# API Gateway resources for reports
resource "aws_api_gateway_resource" "reports" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_rest_api.main.root_resource_id
  path_part   = "reports"
}

resource "aws_api_gateway_resource" "billing_subscribe" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.billing.id
  path_part   = "subscribe"
}

resource "aws_api_gateway_resource" "billing_webhook" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.billing.id
  path_part   = "webhook"
}

resource "aws_api_gateway_resource" "billing_status" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.billing.id
  path_part   = "status"
}

resource "aws_api_gateway_resource" "billing_setup" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.billing.id
  path_part   = "setup"
}

# Reports endpoints
resource "aws_api_gateway_resource" "reports_active_subscriptions" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.reports.id
  path_part   = "active-subscriptions"
}

resource "aws_api_gateway_resource" "reports_subscription_stats" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.reports.id
  path_part   = "subscription-stats"
}

# API Gateway Methods for Billing
resource "aws_api_gateway_method" "billing_subscribe_post" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.billing_subscribe.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_method" "billing_subscribe_options" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.billing_subscribe.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_method" "billing_webhook_post" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.billing_webhook.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_method" "billing_webhook_options" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.billing_webhook.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_method" "billing_status_get" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.billing_status.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_method" "billing_setup_post" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.billing_setup.id
  http_method   = "POST"
  authorization = "NONE"
}

# Reports methods
resource "aws_api_gateway_method" "reports_active_subscriptions_get" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.reports_active_subscriptions.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_method" "reports_subscription_stats_get" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.reports_subscription_stats.id
  http_method   = "GET"
  authorization = "NONE"
}

# API Gateway Integrations for Billing
resource "aws_api_gateway_integration" "billing_subscribe" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.billing_subscribe.id
  http_method = aws_api_gateway_method.billing_subscribe_post.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.billing.invoke_arn
}

resource "aws_api_gateway_integration" "billing_subscribe_options" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.billing_subscribe.id
  http_method = aws_api_gateway_method.billing_subscribe_options.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.billing.invoke_arn
}

resource "aws_api_gateway_integration" "billing_webhook" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.billing_webhook.id
  http_method = aws_api_gateway_method.billing_webhook_post.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.billing.invoke_arn
}

resource "aws_api_gateway_integration" "billing_webhook_options" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.billing_webhook.id
  http_method = aws_api_gateway_method.billing_webhook_options.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.billing.invoke_arn
}

resource "aws_api_gateway_integration" "billing_status" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.billing_status.id
  http_method = aws_api_gateway_method.billing_status_get.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.billing.invoke_arn
}

resource "aws_api_gateway_integration" "billing_setup" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.billing_setup.id
  http_method = aws_api_gateway_method.billing_setup_post.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.billing.invoke_arn
}

# Reports integrations
resource "aws_api_gateway_integration" "reports_active_subscriptions" {
  rest_api_id             = aws_api_gateway_rest_api.main.id
  resource_id             = aws_api_gateway_resource.reports_active_subscriptions.id
  http_method             = aws_api_gateway_method.reports_active_subscriptions_get.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.billing.invoke_arn
}

resource "aws_api_gateway_integration" "reports_subscription_stats" {
  rest_api_id             = aws_api_gateway_rest_api.main.id
  resource_id             = aws_api_gateway_resource.reports_subscription_stats.id
  http_method             = aws_api_gateway_method.reports_subscription_stats_get.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.billing.invoke_arn
}



# Build billing Lambda function
