#!/bin/bash

set -e

STACK_NAME="culi-ecs-stack"
TEMPLATE_FILE="./infra/infra-stack.yml"
REGION="us-east-1"

echo "Deploying ECS infra..."
aws cloudformation deploy \
  --template-file "$TEMPLATE_FILE" \
  --stack-name "$STACK_NAME" \
  --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM \
  --region "$REGION"

echo "✅ Infrastructure deployment complete."
