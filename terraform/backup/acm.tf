# ACM Certificates for ahauros.io (Email Validation)

# Wildcard ACM Certificate for *.ahauros.io (Already created and validated)
# ARN: arn:aws:acm:us-east-1:344707020061:certificate/1ff0d1f0-a589-4817-ab18-8dd240953ffb
data "aws_acm_certificate" "wildcard" {
  domain   = "*.${var.domain_name}"
  statuses = ["ISSUED"]
  provider = aws.us_east_1
}

# Root domain ACM Certificate for ahauros.io (Already created and validated)
# ARN: arn:aws:acm:us-east-1:344707020061:certificate/fa414d7a-f18e-4b47-9582-79523ef81efa
data "aws_acm_certificate" "root" {
  domain   = var.domain_name
  statuses = ["ISSUED"]
  provider = aws.us_east_1
}

# Note: Email validation requires manual approval
# Check the following email addresses for validation emails:
# - contact@ahauros.io
# - admin@ahauros.io
# - administrator@ahauros.io
# - hostmaster@ahauros.io
# - postmaster@ahauros.io
# - webmaster@ahauros.io