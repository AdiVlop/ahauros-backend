# Existing Infrastructure Configuration
# This file configures resources for existing AWS infrastructure

# Data sources for existing resources
data "aws_cloudfront_distribution" "existing" {
  id = "E265MO5HKFF25R"
}

data "aws_s3_bucket" "existing_landing" {
  bucket = "ahauros-landing-9f335278"
}

data "aws_s3_bucket" "existing_dashboard" {
  bucket = "ahauros-dashboard"
}

# S3 bucket policy for public access
resource "aws_s3_bucket_policy" "landing_bucket_policy" {
  bucket = data.aws_s3_bucket.existing_landing.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${data.aws_s3_bucket.existing_landing.arn}/*"
      }
    ]
  })
}

# S3 website configuration
resource "aws_s3_bucket_website_configuration" "landing_website" {
  bucket = data.aws_s3_bucket.existing_landing.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }
}

# CloudFront cache invalidation
resource "aws_cloudfront_invalidation" "landing_invalidation" {
  distribution_id = data.aws_cloudfront_distribution.existing.id
  paths           = ["/*"]

  depends_on = [aws_s3_bucket_policy.landing_bucket_policy]
}

