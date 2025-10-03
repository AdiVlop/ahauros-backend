#!/bin/bash

# ============================
# Ahauros Backend Monitoring Deploy Script
# ============================

set -e

echo "🚀 Starting Ahauros Backend Monitoring Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if terraform is installed
if ! command -v terraform &> /dev/null; then
    echo -e "${RED}❌ Terraform is not installed. Please install Terraform first.${NC}"
    exit 1
fi

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed. Please install AWS CLI first.${NC}"
    exit 1
fi

# Check AWS credentials
echo -e "${YELLOW}🔍 Checking AWS credentials...${NC}"
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS credentials not configured. Please run 'aws configure' first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ AWS credentials configured${NC}"

# Check if terraform.tfvars exists
if [ ! -f "terraform.tfvars" ]; then
    echo -e "${YELLOW}⚠️  terraform.tfvars not found. Creating from example...${NC}"
    cp terraform.tfvars.example terraform.tfvars
    echo -e "${YELLOW}📝 Please edit terraform.tfvars with your configuration before continuing.${NC}"
    echo -e "${YELLOW}   Especially set your Slack webhook URL and email addresses.${NC}"
    read -p "Press Enter to continue after editing terraform.tfvars..."
fi

# Initialize Terraform
echo -e "${YELLOW}🔧 Initializing Terraform...${NC}"
terraform init

# Validate Terraform configuration
echo -e "${YELLOW}✅ Validating Terraform configuration...${NC}"
terraform validate

# Plan Terraform deployment
echo -e "${YELLOW}📋 Planning Terraform deployment...${NC}"
terraform plan -out=tfplan

# Ask for confirmation
echo -e "${YELLOW}🤔 Do you want to apply this plan? (y/N)${NC}"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo -e "${GREEN}🚀 Applying Terraform plan...${NC}"
    terraform apply tfplan
    
    echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
    
    # Display outputs
    echo -e "${YELLOW}📊 Deployment Outputs:${NC}"
    terraform output
    
    # Display dashboard URL
    echo -e "${YELLOW}📈 CloudWatch Dashboard:${NC}"
    echo "https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards:name=Ahauros-AdminBackend"
    
    # Display log group
    echo -e "${YELLOW}📝 CloudWatch Log Group:${NC}"
    terraform output -raw cloudwatch_log_group_name
    
    echo -e "${GREEN}🎉 Monitoring infrastructure deployed successfully!${NC}"
    echo -e "${YELLOW}📧 Don't forget to confirm your email subscription in SNS!${NC}"
    
else
    echo -e "${YELLOW}❌ Deployment cancelled.${NC}"
    rm -f tfplan
fi

echo -e "${GREEN}🏁 Script completed.${NC}"
