#!/bin/bash

set -e

STACK_NAME="culi-ecr-stack"
TEMPLATE_FILE="./infra/ecr-stack.yml"
REGION="us-east-1"

# Check if both repos exist
check_repo() {
  aws ecr describe-repositories --repository-names "$1" --region "$REGION" >/dev/null 2>&1
}

if check_repo "culi-prod/frontend" && check_repo "culi-prod/backend"; then
  echo "ECR repositories already exist. Skipping stack creation."
else
  echo "Deploying ECR stack: $STACK_NAME"
  aws cloudformation deploy \
    --template-file "$TEMPLATE_FILE" \
    --stack-name "$STACK_NAME" \
    --capabilities CAPABILITY_NAMED_IAM \
    --region "$REGION"
fi
