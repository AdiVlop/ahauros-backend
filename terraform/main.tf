# Ahauros Landing - AWS Infrastructure
# Main Terraform configuration

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }
}

provider "aws" {
  region = "eu-west-1"
  
  default_tags {
    tags = {
      Project     = "Ahauros"
      Environment = "prod"
      ManagedBy   = "Terraform"
    }
  }
}

# Provider for us-east-1 (required for ACM certificates used by CloudFront)
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"

  default_tags {
    tags = {
      Environment = "prod"
      Project     = "Ahauros"
      ManagedBy   = "Terraform"
    }
  }
}