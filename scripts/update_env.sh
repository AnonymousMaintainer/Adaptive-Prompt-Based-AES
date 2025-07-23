#!/bin/bash

set -e
export AWS_PAGER=""

CLUSTER_NAME="CULI-Cluster"
BACKEND_FAMILY="culi-backend-task"
FRONTEND_FAMILY="culi-frontend-task"

echo "=== 🚀 Deploying updated backend task definition ==="
aws cloudformation deploy \
  --template-file ./infra/template-backend.yml \
  --stack-name "culi-backend-taskdef" \
  --capabilities CAPABILITY_IAM

echo "=== 🚀 Deploying updated frontend task definition ==="
aws cloudformation deploy \
  --template-file ./infra/template-frontend.yml \
  --stack-name "culi-frontend-taskdef" \
  --capabilities CAPABILITY_IAM

echo "=== 🔍 Fetching latest task definition ARNs directly ==="
BACKEND_TASK_DEF=$(aws ecs describe-task-definition \
  --task-definition "$BACKEND_FAMILY" \
  --query "taskDefinition.taskDefinitionArn" \
  --output text)

FRONTEND_TASK_DEF=$(aws ecs describe-task-definition \
  --task-definition "$FRONTEND_FAMILY" \
  --query "taskDefinition.taskDefinitionArn" \
  --output text)

# echo "Backend Task Definition: $BACKEND_TASK_DEF"
# echo "Frontend Task Definition: $FRONTEND_TASK_DEF"

echo "=== 🔁 Updating ECS services with new task definitions ==="
aws ecs update-service \
  --cluster "$CLUSTER_NAME" \
  --service "CULI-Backend-Service" \
  --task-definition "$BACKEND_TASK_DEF"

aws ecs update-service \
  --cluster "$CLUSTER_NAME" \
  --service "CULI-Frontend-Service" \
  --task-definition "$FRONTEND_TASK_DEF"

echo "✅ ECS services successfully updated."
