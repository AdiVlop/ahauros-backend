# AWS SES Configuration for Ahauros AI

# SES Email Identity for no-reply@ahauros.ai
resource "aws_ses_email_identity" "no_reply" {
  email = "no-reply@ahauros.ai"
}

# SES Domain Identity for ahauros.ai
resource "aws_ses_domain_identity" "main" {
  domain = "ahauros.ai"
}

# SES Domain DKIM
resource "aws_ses_domain_dkim" "main" {
  domain = aws_ses_domain_identity.main.domain
}

# SES Domain Mail From
resource "aws_ses_domain_mail_from" "main" {
  domain           = aws_ses_domain_identity.main.domain
  mail_from_domain = "mail.ahauros.ai"
}

# Note: DNS records for SES domain verification and DKIM
# These need to be manually added to Squarespace DNS for ahauros.ai domain
# 
# Required DNS records to add in Squarespace:
# 1. TXT record: _amazonses.ahauros.ai = [verification_token]
# 2. CNAME records for DKIM (3 records):
#    - [dkim_token_1]._domainkey.ahauros.ai -> [dkim_token_1].dkim.amazonses.com
#    - [dkim_token_2]._domainkey.ahauros.ai -> [dkim_token_2].dkim.amazonses.com  
#    - [dkim_token_3]._domainkey.ahauros.ai -> [dkim_token_3].dkim.amazonses.com
# 3. MX record: mail.ahauros.ai -> 10 feedback-smtp.us-east-1.amazonses.com
# 4. TXT record: mail.ahauros.ai -> v=spf1 include:amazonses.com ~all

# IAM Policy for Lambda to send emails via SES
resource "aws_iam_role_policy" "lambda_ses_access" {
  name = "${local.project_name}-lambda-ses-access"
  role = aws_iam_role.lambda_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ses:SendEmail",
          "ses:SendRawEmail"
        ]
        Resource = "*"
      }
    ]
  })
}



# SES Email Identity for no-reply@ahauros.ai
resource "aws_ses_email_identity" "no_reply" {
  email = "no-reply@ahauros.ai"
}

# SES Domain Identity for ahauros.ai
resource "aws_ses_domain_identity" "main" {
  domain = "ahauros.ai"
}

# SES Domain DKIM
resource "aws_ses_domain_dkim" "main" {
  domain = aws_ses_domain_identity.main.domain
}

# SES Domain Mail From
resource "aws_ses_domain_mail_from" "main" {
  domain           = aws_ses_domain_identity.main.domain
  mail_from_domain = "mail.ahauros.ai"
}

# Note: DNS records for SES domain verification and DKIM
# These need to be manually added to Squarespace DNS for ahauros.ai domain
# 
# Required DNS records to add in Squarespace:
# 1. TXT record: _amazonses.ahauros.ai = [verification_token]
# 2. CNAME records for DKIM (3 records):
#    - [dkim_token_1]._domainkey.ahauros.ai -> [dkim_token_1].dkim.amazonses.com
#    - [dkim_token_2]._domainkey.ahauros.ai -> [dkim_token_2].dkim.amazonses.com  
#    - [dkim_token_3]._domainkey.ahauros.ai -> [dkim_token_3].dkim.amazonses.com
# 3. MX record: mail.ahauros.ai -> 10 feedback-smtp.us-east-1.amazonses.com
# 4. TXT record: mail.ahauros.ai -> v=spf1 include:amazonses.com ~all

# IAM Policy for Lambda to send emails via SES
resource "aws_iam_role_policy" "lambda_ses_access" {
  name = "${local.project_name}-lambda-ses-access"
  role = aws_iam_role.lambda_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ses:SendEmail",
          "ses:SendRawEmail"
        ]
        Resource = "*"
      }
    ]
  })
}










