# Ahauros Backend - Terraform Variables

variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "eu-west-1"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "prod"
}

variable "domain_name" {
  description = "Domain name for the application"
  type        = string
  default     = "ahauros.io"
}

variable "api_domain" {
  description = "API subdomain"
  type        = string
  default     = "api.ahauros.io"
}

variable "db_username" {
  description = "Database username"
  type        = string
  default     = "ahauros_user"
  sensitive   = true
}

variable "db_password" {
  description = "Database password"
  type        = string
  default     = "secret123"
  sensitive   = true
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "ahauros"
}

variable "redis_node_type" {
  description = "ElastiCache Redis node type"
  type        = string
  default     = "cache.t3.micro"
}

variable "rds_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "lambda_timeout" {
  description = "Lambda function timeout in seconds"
  type        = number
  default     = 30
}

variable "lambda_memory_size" {
  description = "Lambda function memory size in MB"
  type        = number
  default     = 512
}

variable "cloudfront_price_class" {
  description = "CloudFront price class"
  type        = string
  default     = "PriceClass_100"
}

variable "enable_app_subdomain" {
  description = "Enable app subdomain with CloudFront"
  type        = bool
  default     = true
}

# Stripe Billing Variables
variable "stripe_secret_key" {
  description = "Stripe secret key for billing"
  type        = string
  default     = "sk_test_your_stripe_secret_key_here"
  sensitive   = true
}

variable "stripe_webhook_secret" {
  description = "Stripe webhook secret"
  type        = string
  default     = "whsec_your-stripe-webhook-secret"
  sensitive   = true
}

