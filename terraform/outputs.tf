# Terraform Outputs

output "api_gateway_url" {
  description = "API Gateway URL"
  value       = "https://${aws_api_gateway_rest_api.main.id}.execute-api.${data.aws_region.current.name}.amazonaws.com/${var.environment}"
}

output "api_domain_url" {
  description = "API Domain URL"
  value       = "https://${local.api_domain}"
}

output "rds_endpoint" {
  description = "RDS PostgreSQL endpoint"
  value       = aws_db_instance.main.endpoint
  sensitive   = true
}

output "redis_endpoint" {
  description = "ElastiCache Redis endpoint"
  value       = aws_elasticache_replication_group.main.primary_endpoint_address
  sensitive   = true
}

output "s3_bucket_name" {
  description = "S3 bucket name for storage"
  value       = aws_s3_bucket.main.bucket
}

output "dns_records_for_squarespace" {
  description = "DNS records to add manually in Squarespace"
  value = {
    # Root domain for landing page
    root_cname = {
      name  = "@"
      type  = "CNAME"
      value = aws_cloudfront_distribution.landing.domain_name
    }
    # API subdomain
    api_cname = {
      name  = "api"
      type  = "CNAME"
      value = aws_api_gateway_domain_name.main.regional_domain_name
    }
    # App subdomain
    app_cname = {
      name  = "app"
      type  = "CNAME"
      value = aws_cloudfront_distribution.frontend.domain_name
    }
  }
}

output "acm_wildcard_certificate_arn" {
  description = "Wildcard ACM Certificate ARN (validated and issued)"
  value       = "arn:aws:acm:us-east-1:344707020061:certificate/1ff0d1f0-a589-4817-ab18-8dd240953ffb"
}

output "acm_root_certificate_arn" {
  description = "Root domain ACM Certificate ARN (validated and issued)"
  value       = "arn:aws:acm:us-east-1:344707020061:certificate/fa414d7a-f18e-4b47-9582-79523ef81efa"
}

output "ssl_validation_emails" {
  description = "Email addresses that will receive SSL validation requests"
  value = [
    "contact@ahauros.io",
    "admin@ahauros.io",
    "administrator@ahauros.io", 
    "hostmaster@ahauros.io",
    "postmaster@ahauros.io",
    "webmaster@ahauros.io"
  ]
}

output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name"
  value       = aws_cloudfront_distribution.app.domain_name
}

output "s3_app_bucket_name" {
  description = "S3 bucket name for app hosting"
  value       = aws_s3_bucket.app.bucket
}

output "s3_frontend_bucket_name" {
  description = "S3 bucket name for frontend hosting"
  value       = aws_s3_bucket.frontend.bucket
}

output "cloudfront_frontend_domain" {
  description = "CloudFront domain for frontend"
  value       = aws_cloudfront_distribution.frontend.domain_name
}

output "frontend_url" {
  description = "Frontend URL"
  value       = "https://app.ahauros.io"
}

output "api_gateway_domain_name" {
  description = "API Gateway domain name"
  value       = aws_api_gateway_domain_name.main.regional_domain_name
}

output "lambda_function_name" {
  description = "Lambda function name"
  value       = aws_lambda_function.api.function_name
}

output "billing_lambda_function_name" {
  description = "Billing Lambda function name"
  value       = aws_lambda_function.billing.function_name
}

output "billing_endpoints" {
  description = "Billing API endpoints"
  value = {
    subscribe = "https://api.ahauros.io/billing/subscribe"
    webhook   = "https://api.ahauros.io/billing/webhook"
  }
}

output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = aws_subnet.private[*].id
}

output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = aws_subnet.public[*].id
}

output "rds_username" {
  description = "RDS PostgreSQL username"
  value       = var.db_username
  sensitive   = true
}

output "rds_password" {
  description = "RDS PostgreSQL password"
  value       = random_password.db_password.result
  sensitive   = true
}

output "redis_port" {
  description = "Redis port"
  value       = aws_elasticache_replication_group.main.port
}

# Landing Page Outputs
output "landing_bucket_name" {
  description = "S3 bucket name for landing page"
  value       = aws_s3_bucket.landing.bucket
}

output "landing_cloudfront_domain" {
  description = "CloudFront domain for landing page"
  value       = aws_cloudfront_distribution.landing.domain_name
}

output "landing_cloudfront_url" {
  description = "CloudFront URL for landing page"
  value       = "https://${aws_cloudfront_distribution.landing.domain_name}"
}

output "landing_website_url" {
  description = "Landing page website URL"
  value       = "https://ahauros.io"
}



output "api_gateway_url" {
  description = "API Gateway URL"
  value       = "https://${aws_api_gateway_rest_api.main.id}.execute-api.${data.aws_region.current.name}.amazonaws.com/${var.environment}"
}

output "api_domain_url" {
  description = "API Domain URL"
  value       = "https://${local.api_domain}"
}

output "rds_endpoint" {
  description = "RDS PostgreSQL endpoint"
  value       = aws_db_instance.main.endpoint
  sensitive   = true
}

output "redis_endpoint" {
  description = "ElastiCache Redis endpoint"
  value       = aws_elasticache_replication_group.main.primary_endpoint_address
  sensitive   = true
}

output "s3_bucket_name" {
  description = "S3 bucket name for storage"
  value       = aws_s3_bucket.main.bucket
}

output "dns_records_for_squarespace" {
  description = "DNS records to add manually in Squarespace"
  value = {
    # Root domain for landing page
    root_cname = {
      name  = "@"
      type  = "CNAME"
      value = aws_cloudfront_distribution.landing.domain_name
    }
    # API subdomain
    api_cname = {
      name  = "api"
      type  = "CNAME"
      value = aws_api_gateway_domain_name.main.regional_domain_name
    }
    # App subdomain
    app_cname = {
      name  = "app"
      type  = "CNAME"
      value = aws_cloudfront_distribution.frontend.domain_name
    }
  }
}

output "acm_wildcard_certificate_arn" {
  description = "Wildcard ACM Certificate ARN (validated and issued)"
  value       = "arn:aws:acm:us-east-1:344707020061:certificate/1ff0d1f0-a589-4817-ab18-8dd240953ffb"
}

output "acm_root_certificate_arn" {
  description = "Root domain ACM Certificate ARN (validated and issued)"
  value       = "arn:aws:acm:us-east-1:344707020061:certificate/fa414d7a-f18e-4b47-9582-79523ef81efa"
}

output "ssl_validation_emails" {
  description = "Email addresses that will receive SSL validation requests"
  value = [
    "contact@ahauros.io",
    "admin@ahauros.io",
    "administrator@ahauros.io", 
    "hostmaster@ahauros.io",
    "postmaster@ahauros.io",
    "webmaster@ahauros.io"
  ]
}

output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name"
  value       = aws_cloudfront_distribution.app.domain_name
}

output "s3_app_bucket_name" {
  description = "S3 bucket name for app hosting"
  value       = aws_s3_bucket.app.bucket
}

output "s3_frontend_bucket_name" {
  description = "S3 bucket name for frontend hosting"
  value       = aws_s3_bucket.frontend.bucket
}

output "cloudfront_frontend_domain" {
  description = "CloudFront domain for frontend"
  value       = aws_cloudfront_distribution.frontend.domain_name
}

output "frontend_url" {
  description = "Frontend URL"
  value       = "https://app.ahauros.io"
}

output "api_gateway_domain_name" {
  description = "API Gateway domain name"
  value       = aws_api_gateway_domain_name.main.regional_domain_name
}

output "lambda_function_name" {
  description = "Lambda function name"
  value       = aws_lambda_function.api.function_name
}

output "billing_lambda_function_name" {
  description = "Billing Lambda function name"
  value       = aws_lambda_function.billing.function_name
}

output "billing_endpoints" {
  description = "Billing API endpoints"
  value = {
    subscribe = "https://api.ahauros.io/billing/subscribe"
    webhook   = "https://api.ahauros.io/billing/webhook"
  }
}

output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = aws_subnet.private[*].id
}

output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = aws_subnet.public[*].id
}

output "rds_username" {
  description = "RDS PostgreSQL username"
  value       = var.db_username
  sensitive   = true
}

output "rds_password" {
  description = "RDS PostgreSQL password"
  value       = random_password.db_password.result
  sensitive   = true
}

output "redis_port" {
  description = "Redis port"
  value       = aws_elasticache_replication_group.main.port
}

# Landing Page Outputs
output "landing_bucket_name" {
  description = "S3 bucket name for landing page"
  value       = aws_s3_bucket.landing.bucket
}

output "landing_cloudfront_domain" {
  description = "CloudFront domain for landing page"
  value       = aws_cloudfront_distribution.landing.domain_name
}

output "landing_cloudfront_url" {
  description = "CloudFront URL for landing page"
  value       = "https://${aws_cloudfront_distribution.landing.domain_name}"
}

output "landing_website_url" {
  description = "Landing page website URL"
  value       = "https://ahauros.io"
}










