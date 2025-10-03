#!/bin/bash

# Ahauros Landing Page Deployment Script
# This script deploys the landing page to AWS S3 and invalidates CloudFront cache

echo "🚀 Ahauros Landing Page Deployment"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
S3_BUCKET="ahauros-landing-9f335278"
CLOUDFRONT_DISTRIBUTIONS=(
    "E2DYVYPR0O99SL"
    "E37MVSKAUUE5QY"
    "E3ORBGKJMS6ZA7"
    "E265MO5HKFF25R"
)
DOMAIN="https://ahauros.io"

echo -e "${BLUE}📁 Building landing page...${NC}"
cd /Users/adrianpersonal/Desktop/ahauros-backend/landing-react
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build completed successfully!${NC}"

echo -e "${BLUE}📤 Uploading to S3 bucket: ${S3_BUCKET}${NC}"
aws s3 sync dist/ s3://${S3_BUCKET} --delete

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ S3 upload failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ S3 upload completed successfully!${NC}"

echo -e "${BLUE}🔄 Invalidating CloudFront cache...${NC}"
for distribution in "${CLOUDFRONT_DISTRIBUTIONS[@]}"; do
    echo -e "${YELLOW}  Invalidating distribution: ${distribution}${NC}"
    aws cloudfront create-invalidation --distribution-id ${distribution} --paths "/*" > /dev/null
done

echo -e "${GREEN}✅ CloudFront cache invalidation completed!${NC}"

echo -e "${BLUE}🔍 Testing deployment...${NC}"
sleep 5
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" ${DOMAIN})

if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Landing page is live at: ${DOMAIN}${NC}"
else
    echo -e "${YELLOW}⚠️  Landing page returned status: ${HTTP_STATUS}${NC}"
    echo -e "${YELLOW}   Cache might still be invalidating...${NC}"
fi

echo ""
echo -e "${GREEN}🎉 DEPLOYMENT COMPLETED!${NC}"
echo -e "${BLUE}📍 Landing Page URL: ${DOMAIN}${NC}"
echo -e "${BLUE}📊 S3 Bucket: ${S3_BUCKET}${NC}"
echo -e "${BLUE}☁️  CloudFront Distributions: ${#CLOUDFRONT_DISTRIBUTIONS[@]}${NC}"
echo ""
echo -e "${YELLOW}💡 Note: CloudFront cache invalidation may take a few minutes to complete.${NC}"

