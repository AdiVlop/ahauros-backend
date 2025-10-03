# Terraform Outputs

# API Gateway Outputs
output "api_gateway_url" {
  description = "API Gateway URL"
  value       = "https://${aws_api_gateway_rest_api.main.id}.execute-api.${data.aws_region.current.name}.amazonaws.com/${var.environment}"
}

output "api_domain_url" {
  description = "API Domain URL"
  value       = "https://${local.api_domain}"
}

output "api_gateway_domain_name" {
  description = "API Gateway domain name"
  value       = aws_api_gateway_domain_name.main.regional_domain_name
}

# Database Outputs
output "rds_endpoint" {
  description = "RDS PostgreSQL endpoint"
  value       = aws_db_instance.main.endpoint
  sensitive   = true
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

# Redis Outputs
output "redis_endpoint" {
  description = "ElastiCache Redis endpoint"
  value       = aws_elasticache_replication_group.main.primary_endpoint_address
  sensitive   = true
}

output "redis_port" {
  description = "Redis port"
  value       = aws_elasticache_replication_group.main.port
}

# S3 Outputs
output "s3_bucket_name" {
  description = "S3 bucket name for storage"
  value       = aws_s3_bucket.main.bucket
}

output "s3_app_bucket_name" {
  description = "S3 bucket name for app hosting"
  value       = aws_s3_bucket.app.bucket
}

output "landing_bucket_name" {
  description = "S3 bucket name for landing page"
  value       = aws_s3_bucket.landing.bucket
}

# CloudFront Outputs
output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name for app"
  value       = aws_cloudfront_distribution.app.domain_name
}

output "landing_cloudfront_domain" {
  description = "CloudFront domain for landing page"
  value       = aws_cloudfront_distribution.landing.domain_name
}

output "landing_cloudfront_url" {
  description = "CloudFront URL for landing page"
  value       = "https://${aws_cloudfront_distribution.landing.domain_name}"
}

# Route53 Outputs
output "route53_zone_id" {
  description = "Route53 Hosted Zone ID"
  value       = aws_route53_zone.main.zone_id
}

output "route53_name_servers" {
  description = "Route53 Name Servers"
  value       = aws_route53_zone.main.name_servers
}

# Domain URLs
output "landing_website_url" {
  description = "Landing page website URL"
  value       = "https://${var.domain_name}"
}

output "app_website_url" {
  description = "App website URL"
  value       = "https://app.${var.domain_name}"
}

output "api_website_url" {
  description = "API website URL"
  value       = "https://api.${var.domain_name}"
}

# Lambda Outputs
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
    subscribe = "https://api.${var.domain_name}/billing/subscribe"
    webhook   = "https://api.${var.domain_name}/billing/webhook"
  }
}

# VPC Outputs
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

# ACM Certificate Outputs
output "acm_wildcard_certificate_arn" {
  description = "Wildcard ACM Certificate ARN"
  value       = data.aws_acm_certificate.wildcard.arn
}

output "acm_root_certificate_arn" {
  description = "Root domain ACM Certificate ARN"
  value       = data.aws_acm_certificate.root.arn
}

output "ssl_validation_emails" {
  description = "Email addresses that will receive SSL validation requests"
  value = [
    "contact@${var.domain_name}",
    "admin@${var.domain_name}",
    "administrator@${var.domain_name}", 
    "hostmaster@${var.domain_name}",
    "postmaster@${var.domain_name}",
    "webmaster@${var.domain_name}"
  ]
}

# DNS Configuration for Manual Setup (if needed)
output "dns_records_for_manual_setup" {
  description = "DNS records to add manually if Route53 is not used"
  value = {
    # Root domain for landing page
    root_cname = {
      name  = "@"
      type  = "CNAME"
      value = aws_cloudfront_distribution.landing.domain_name
    }
    # WWW subdomain
    www_cname = {
      name  = "www"
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
      value = aws_cloudfront_distribution.app.domain_name
    }
  }
}