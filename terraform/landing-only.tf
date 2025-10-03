# Landing Page Configuration for ahauros.io ONLY

# Random ID for bucket suffix
resource "random_id" "bucket_suffix" {
  byte_length = 4
}

# S3 Bucket for Landing Page
resource "aws_s3_bucket" "landing" {
  bucket = "ahauros-landing-${random_id.bucket_suffix.hex}"

  tags = {
    Name = "ahauros-landing-bucket"
  }
}

# S3 Bucket Website Configuration
resource "aws_s3_bucket_website_configuration" "landing" {
  bucket = aws_s3_bucket.landing.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "error.html"
  }
}

# S3 Bucket Public Access Block
resource "aws_s3_bucket_public_access_block" "landing" {
  bucket = aws_s3_bucket.landing.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# S3 Bucket Policy for CloudFront Access
resource "aws_s3_bucket_policy" "landing" {
  bucket = aws_s3_bucket.landing.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.landing.arn}/*"
      }
    ]
  })

  depends_on = [aws_s3_bucket_public_access_block.landing]
}

# Upload landing page files to S3 from landing-react/dist
resource "aws_s3_object" "landing_index" {
  bucket       = aws_s3_bucket.landing.id
  key          = "index.html"
  source       = "../landing-react/dist/index.html"
  content_type = "text/html"
  etag         = filemd5("../landing-react/dist/index.html")

  tags = {
    Name = "ahauros-landing-index"
  }
}

# Upload all assets from landing-react/dist/assets
resource "aws_s3_object" "landing_assets" {
  for_each = fileset("../landing-react/dist/assets", "**/*")
  
  bucket       = aws_s3_bucket.landing.id
  key          = "assets/${each.value}"
  source       = "../landing-react/dist/assets/${each.value}"
  content_type = lookup({
    "css" = "text/css"
    "js"  = "application/javascript"
    "png" = "image/png"
    "jpg" = "image/jpeg"
    "jpeg" = "image/jpeg"
    "svg" = "image/svg+xml"
    "ico" = "image/x-icon"
  }, split(".", each.value)[length(split(".", each.value)) - 1], "application/octet-stream")
  etag         = filemd5("../landing-react/dist/assets/${each.value}")

  tags = {
    Name = "ahauros-landing-asset-${each.value}"
  }
}

# CloudFront Origin Access Control for Landing Page
resource "aws_cloudfront_origin_access_control" "landing" {
  name                              = "ahauros-landing-oac"
  description                       = "OAC for ahauros landing page"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# CloudFront Distribution for Landing Page (ahauros.io)
resource "aws_cloudfront_distribution" "landing" {
  origin {
    domain_name              = aws_s3_bucket.landing.bucket_regional_domain_name
    origin_id                = "S3-${aws_s3_bucket.landing.bucket}"
    origin_access_control_id = aws_cloudfront_origin_access_control.landing.id
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  aliases             = ["ahauros.io"]

  default_cache_behavior {
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${aws_s3_bucket.landing.bucket}"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

  # Cache behavior for assets
  ordered_cache_behavior {
    path_pattern     = "/assets/*"
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${aws_s3_bucket.landing.bucket}"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 86400
    max_ttl                = 31536000
    compress               = true
  }

  price_class = "PriceClass_100"

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = "arn:aws:acm:us-east-1:344707020061:certificate/fa414d7a-f18e-4b47-9582-79523ef81efa"
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }

  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index.html"
  }

  tags = {
    Name = "ahauros-landing-distribution"
  }
}


# Outputs
output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name"
  value       = aws_cloudfront_distribution.landing.domain_name
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = aws_cloudfront_distribution.landing.id
}

output "s3_bucket_name" {
  description = "S3 bucket name for landing page"
  value       = aws_s3_bucket.landing.bucket
}

output "route53_zone_id" {
  description = "Route53 hosted zone ID"
  value       = aws_route53_zone.main.zone_id
}

output "route53_name_servers" {
  description = "Route53 name servers"
  value       = aws_route53_zone.main.name_servers
}



# Route53 Hosted Zone for ahauros.io
resource "aws_route53_zone" "main" {
  name = "ahauros.io"

  tags = {
    Name        = "ahauros-hosted-zone"
    Environment = "prod"
  }
}

# Route53 Record for root domain (ahauros.io) -> CloudFront
resource "aws_route53_record" "root" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "ahauros.io"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.landing.domain_name
    zone_id                = aws_cloudfront_distribution.landing.hosted_zone_id
    evaluate_target_health = false
  }
}

# Route53 Record for www subdomain (www.ahauros.io) -> CloudFront
resource "aws_route53_record" "www" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "www.ahauros.io"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.landing.domain_name
    zone_id                = aws_cloudfront_distribution.landing.hosted_zone_id
    evaluate_target_health = false
  }
}
