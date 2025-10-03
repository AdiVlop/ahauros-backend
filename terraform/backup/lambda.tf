# Lambda Functions Configuration

# Lambda function for API
resource "aws_lambda_function" "api" {
  filename         = "../aws-lambda/function.zip"
  function_name    = "${local.project_name}-api"
  role            = aws_iam_role.lambda_execution.arn
  handler         = "index.handler"
  runtime         = "nodejs18.x"
  timeout         = var.lambda_timeout
  memory_size     = var.lambda_memory_size

  vpc_config {
    subnet_ids         = aws_subnet.private[*].id
    security_group_ids = [aws_security_group.lambda.id]
  }

  environment {
    variables = {
      DB_HOST     = aws_db_instance.main.endpoint
      DB_PORT     = aws_db_instance.main.port
      DB_NAME     = aws_db_instance.main.db_name
      DB_USER     = aws_db_instance.main.username
      DB_PASSWORD = aws_db_instance.main.password
      REDIS_HOST  = aws_elasticache_replication_group.main.primary_endpoint_address
      REDIS_PORT  = aws_elasticache_replication_group.main.port
    }
  }

  depends_on = [
    aws_iam_role_policy_attachment.lambda_vpc_access,
    aws_cloudwatch_log_group.lambda_api
  ]

  tags = {
    Name = "${local.project_name}-api"
  }
}

# CloudWatch Log Group for Lambda
resource "aws_cloudwatch_log_group" "lambda_api" {
  name              = "/aws/lambda/${local.project_name}-api"
  retention_in_days = 14

  tags = {
    Name = "${local.project_name}-lambda-api-logs"
  }
}

# Lambda Permission for API Gateway
resource "aws_lambda_permission" "api_gateway" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

# Lambda Layer for dependencies (optional optimization)
resource "aws_lambda_layer_version" "dependencies" {
  filename   = "../aws-lambda/layer.zip"
  layer_name = "${local.project_name}-dependencies"

  compatible_runtimes = ["nodejs18.x"]

  depends_on = [null_resource.build_lambda_layer]
}

# Build Lambda layer
resource "null_resource" "build_lambda_layer" {
  provisioner "local-exec" {
    command = <<-EOT
      cd ../aws-lambda
      mkdir -p nodejs
      npm install --production --prefix nodejs
      zip -r layer.zip nodejs/
    EOT
  }

  triggers = {
    package_json = filemd5("../aws-lambda/package.json")
  }
}

# Build Lambda function
resource "null_resource" "build_lambda_function" {
  provisioner "local-exec" {
    command = <<-EOT
      cd ../aws-lambda
      npm install --production
      zip -r function.zip index.js package.json node_modules/
    EOT
  }

  triggers = {
    index_js     = filemd5("../aws-lambda/index.js")
    package_json = filemd5("../aws-lambda/package.json")
  }
}



# Lambda function for API
