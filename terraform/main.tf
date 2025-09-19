# Ahauros Backend - AWS Infrastructure
# Main Terraform configuration

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  # backend "s3" {
  #   bucket = "ahauros-terraform-state"
  #   key    = "ahauros-backend/terraform.tfstate"
  #   region = "us-east-1"
  # }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = "Ahauros"
      Environment = var.environment
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
      Environment = var.environment
      Project     = "Ahauros"
      ManagedBy   = "Terraform"
    }
  }
}

# Data sources
data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

# Local values
locals {
  project_name = "ahauros"
  domain_name  = "ahauros.ai"
  api_domain   = "api.ahauros.ai"
  
  common_tags = {
    Project     = "Ahauros"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}




terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  # backend "s3" {
  #   bucket = "ahauros-terraform-state"
  #   key    = "ahauros-backend/terraform.tfstate"
  #   region = "us-east-1"
  # }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = "Ahauros"
      Environment = var.environment
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
      Environment = var.environment
      Project     = "Ahauros"
      ManagedBy   = "Terraform"
    }
  }
}

# Data sources
data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

# Local values
locals {
  project_name = "ahauros"
  domain_name  = "ahauros.ai"
  api_domain   = "api.ahauros.ai"
  
  common_tags = {
    Project     = "Ahauros"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}










