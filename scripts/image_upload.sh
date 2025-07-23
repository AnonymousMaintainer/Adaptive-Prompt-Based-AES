#!/bin/bash

set -e

REGION="us-east-1"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

FRONTEND_REPO="$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/culi-prod/frontend"
BACKEND_REPO="$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/culi-prod/backend"

echo "Logging into ECR..."
aws ecr get-login-password --region "$REGION" | docker login --username AWS --password-stdin "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com"

echo "Building Docker images..."
docker build -t culi-frontend ./frontend
docker build -t culi-backend ./backend

echo "Tagging images..."
docker tag culi-frontend:latest "$FRONTEND_REPO:latest"
docker tag culi-backend:latest "$BACKEND_REPO:latest"

echo "Pushing to ECR..."
docker push "$FRONTEND_REPO:latest"
docker push "$BACKEND_REPO:latest"

echo "Images successfully pushed to ECR."
