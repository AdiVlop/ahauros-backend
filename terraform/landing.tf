# Landing Page Hosting Configuration for ahauros.ai

# S3 Bucket for Landing Page
resource "aws_s3_bucket" "landing" {
  bucket = "ahauros-landing-${random_id.bucket_suffix.hex}"

  tags = {
    Name = "${local.project_name}-landing-bucket"
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

# Upload landing page files to S3
resource "aws_s3_object" "landing_index" {
  bucket       = aws_s3_bucket.landing.id
  key          = "index.html"
  source       = "../landing/index.html"
  content_type = "text/html"
  etag         = filemd5("../landing/index.html")

  tags = {
    Name = "${local.project_name}-landing-index"
  }
}

resource "aws_s3_object" "landing_css" {
  bucket       = aws_s3_bucket.landing.id
  key          = "assets/css/style.css"
  source       = "../landing/assets/css/style.css"
  content_type = "text/css"
  etag         = filemd5("../landing/assets/css/style.css")

  tags = {
    Name = "${local.project_name}-landing-css"
  }
}

resource "aws_s3_object" "landing_js" {
  bucket       = aws_s3_bucket.landing.id
  key          = "assets/js/script.js"
  source       = "../landing/assets/js/script.js"
  content_type = "application/javascript"
  etag         = filemd5("../landing/assets/js/script.js")

  tags = {
    Name = "${local.project_name}-landing-js"
  }
}

resource "aws_s3_object" "landing_favicon" {
  bucket       = aws_s3_bucket.landing.id
  key          = "assets/images/favicon.png"
  source       = "../landing/assets/images/favicon.png"
  content_type = "image/png"
  etag         = filemd5("../landing/assets/images/favicon.png")

  tags = {
    Name = "${local.project_name}-landing-favicon"
  }
}

# CloudFront Origin Access Control for Landing Page
resource "aws_cloudfront_origin_access_control" "landing" {
  name                              = "${local.project_name}-landing-oac"
  description                       = "OAC for ${local.project_name} landing page"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# CloudFront Distribution for Landing Page (ahauros.ai)
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
    Name = "${local.project_name}-landing-distribution"
  }
}



# S3 Bucket for Landing Page
resource "aws_s3_bucket" "landing" {
  bucket = "ahauros-landing-${random_id.bucket_suffix.hex}"

  tags = {
    Name = "${local.project_name}-landing-bucket"
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

# Upload landing page files to S3
resource "aws_s3_object" "landing_index" {
  bucket       = aws_s3_bucket.landing.id
  key          = "index.html"
  source       = "../landing/index.html"
  content_type = "text/html"
  etag         = filemd5("../landing/index.html")

  tags = {
    Name = "${local.project_name}-landing-index"
  }
}

resource "aws_s3_object" "landing_css" {
  bucket       = aws_s3_bucket.landing.id
  key          = "assets/css/style.css"
  source       = "../landing/assets/css/style.css"
  content_type = "text/css"
  etag         = filemd5("../landing/assets/css/style.css")

  tags = {
    Name = "${local.project_name}-landing-css"
  }
}

resource "aws_s3_object" "landing_js" {
  bucket       = aws_s3_bucket.landing.id
  key          = "assets/js/script.js"
  source       = "../landing/assets/js/script.js"
  content_type = "application/javascript"
  etag         = filemd5("../landing/assets/js/script.js")

  tags = {
    Name = "${local.project_name}-landing-js"
  }
}

resource "aws_s3_object" "landing_favicon" {
  bucket       = aws_s3_bucket.landing.id
  key          = "assets/images/favicon.png"
  source       = "../landing/assets/images/favicon.png"
  content_type = "image/png"
  etag         = filemd5("../landing/assets/images/favicon.png")

  tags = {
    Name = "${local.project_name}-landing-favicon"
  }
}

# CloudFront Origin Access Control for Landing Page
resource "aws_cloudfront_origin_access_control" "landing" {
  name                              = "${local.project_name}-landing-oac"
  description                       = "OAC for ${local.project_name} landing page"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# CloudFront Distribution for Landing Page (ahauros.ai)
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
    Name = "${local.project_name}-landing-distribution"
  }
}










