#!/bin/bash

set -e

BACKEND_ENV="./backend/.env"
FRONTEND_ENV="./frontend/.env"
STACK_NAME="culi-ecs-stack"

# Retrieve EIP from CloudFormation output
  # Change this to your actual stack name
EIP=$(aws cloudformation describe-stacks \
  --stack-name "$STACK_NAME" \
  --query "Stacks[0].Outputs[?OutputKey=='PublicIP'].OutputValue" \
  --output text)

if [ -z "$EIP" ]; then
  echo "❌ Could not retrieve EIP from CloudFormation."
  exit 1
fi

echo "🌐 Using EIP: $EIP"

### Update backend/.env
if [ -f "$BACKEND_ENV" ]; then
  echo "🔧 Updating backend .env..."
  sed -i.bak -E \
    -e "s|^FRONTEND_HOST=.*|FRONTEND_HOST=http://$EIP:3000|" \
    -e "s|^BACKEND_CORS_ORIGINS=.*|BACKEND_CORS_ORIGINS=http://$EIP:3000,http://$EIP:8000,https://$EIP:3000,https://$EIP:8000|" \
    "$BACKEND_ENV"
  echo "✅ backend/.env updated."
else
  echo "⚠️ backend/.env not found."
fi

### Update frontend/.env.production
if [ -f "$FRONTEND_ENV" ]; then
  echo "🔧 Updating frontend .env.production..."
  sed -i.bak -E \
    "s|^BASE_BACKEND_URL=.*|BASE_BACKEND_URL=http://$EIP:8000|" \
    "$FRONTEND_ENV"
  echo "✅ frontend/.env updated."
else
  echo "⚠️ frontend/.env not found."
fi
