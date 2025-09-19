#!/bin/bash

# Ahauros.io Deployment Monitoring Script
# Use this to monitor the status of your deployment

if [ -z "$1" ]; then
    echo "Usage: $0 <INSTANCE_ID>"
    echo "Example: $0 i-1234567890abcdef0"
    exit 1
fi

INSTANCE_ID=$1

echo "🔍 Monitoring Ahauros.io Deployment"
echo "===================================="
echo "Instance ID: $INSTANCE_ID"
echo ""

# Check instance status
echo "📊 Instance Status:"
aws ec2 describe-instances \
  --instance-ids $INSTANCE_ID \
  --query 'Reservations[0].Instances[0].[State.Name,PublicIpAddress,Tags[?Key==`Name`].Value|[0]]' \
  --output table

echo ""

# Check recent SSM commands
echo "📋 Recent SSM Commands:"
aws ssm list-commands \
  --instance-id $INSTANCE_ID \
  --max-items 10 \
  --query 'Commands[*].[CommandId,Status,Comment,RequestedDateTime]' \
  --output table

echo ""

# Check if site is responding
PUBLIC_IP=$(aws ec2 describe-instances \
  --instance-ids $INSTANCE_ID \
  --query 'Reservations[0].Instances[0].PublicIpAddress' \
  --output text)

if [ "$PUBLIC_IP" != "None" ] && [ "$PUBLIC_IP" != "null" ]; then
    echo "🌐 Site Status:"
    echo "Public IP: $PUBLIC_IP"
    
    # Test HTTP
    echo -n "HTTP (port 80): "
    if curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 http://$PUBLIC_IP | grep -q "200\|301\|302"; then
        echo "✅ Responding"
    else
        echo "❌ Not responding"
    fi
    
    # Test HTTPS
    echo -n "HTTPS (port 443): "
    if curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 https://$PUBLIC_IP | grep -q "200\|301\|302"; then
        echo "✅ Responding"
    else
        echo "❌ Not responding"
    fi
    
    # Test domain (if DNS is configured)
    echo -n "Domain (ahauros.io): "
    if curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 https://ahauros.io | grep -q "200\|301\|302"; then
        echo "✅ Responding"
    else
        echo "❌ Not responding (DNS may not be configured yet)"
    fi
else
    echo "❌ Instance has no public IP address"
fi

echo ""

# Check file structure on server
echo "📁 File Structure Check:"
COMMAND_ID=$(aws ssm send-command \
  --targets "Key=instanceIds,Values=$INSTANCE_ID" \
  --document-name "AWS-RunShellScript" \
  --comment "Check file structure" \
  --parameters 'commands=[
    "ls -la /var/www/ahauros.io/",
    "sudo systemctl status nginx --no-pager",
    "sudo certbot certificates"
  ]' \
  --query 'Command.CommandId' \
  --output text)

echo "Command sent: $COMMAND_ID"
echo "⏳ Waiting for results..."
sleep 10

# Get command output
echo ""
echo "📄 Command Output:"
aws ssm get-command-invocation \
  --command-id $COMMAND_ID \
  --instance-id $INSTANCE_ID \
  --query 'StandardOutputContent' \
  --output text

echo ""
echo "🔧 Useful Commands:"
echo "==================="
echo "Check all commands:"
echo "aws ssm list-commands --instance-id $INSTANCE_ID"
echo ""
echo "Get command output:"
echo "aws ssm get-command-invocation --command-id COMMAND_ID --instance-id $INSTANCE_ID"
echo ""
echo "SSH to instance (if key pair is configured):"
echo "ssh -i your-key.pem ubuntu@$PUBLIC_IP"
echo ""
echo "Check Nginx logs:"
echo "aws ssm send-command --targets \"Key=instanceIds,Values=$INSTANCE_ID\" --document-name \"AWS-RunShellScript\" --parameters 'commands=[\"sudo tail -20 /var/log/nginx/error.log\"]'"

