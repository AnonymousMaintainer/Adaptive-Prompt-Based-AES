#!/bin/bash

# Paths to .env files
BACKEND_ENV="./backend/.env"
FRONTEND_ENV="./frontend/.env"

# Required backend variables
REQUIRED_VARS_BACKEND=(
  AWS_ACCESS_KEY_ID
  AWS_SECRET_ACCESS_KEY
  BUCKET_NAME
  REGION_NAME
  OPENAI_API_KEY
  POSTGRESQL_USERNAME
  POSTGRESQL_PASSWORD
  POSTGRESQL_HOST
  POSTGRESQL_DATABASE
  FRONTEND_HOST
  BACKEND_CORS_ORIGINS
  SECRET_KEY
)

# Optional backend variables
OPTIONAL_VARS_BACKEND=(
  EMAIL_HOST
  EMAIL_PORT
  EMAIL_USER
  EMAIL_PASS
)

# Required frontend variables
REQUIRED_VARS_FRONTEND=(
  BASE_BACKEND_URL
)

# Function to check required variables
check_required_vars() {
  local vars=("$@")
  local missing=0
  for var in "${vars[@]}"; do
    if [ -z "${!var}" ]; then
      echo "Missing or empty required variable: $var"
      missing=1
    fi
  done
  return $missing
}

# Function to check optional variables
check_optional_vars() {
  local vars=("$@")
  for var in "${vars[@]}"; do
    if [ -z "${!var}" ]; then
      echo "Optional variable not set: $var"
    fi
  done
}

# === Check backend.env ===
if [ ! -f "$BACKEND_ENV" ]; then
  echo "Missing $BACKEND_ENV file."
  exit 1
fi

set -a
source "$BACKEND_ENV"
set +a

echo "Checking backend.env..."
check_required_vars "${REQUIRED_VARS_BACKEND[@]}"
BACKEND_MISSING=$?
check_optional_vars "${OPTIONAL_VARS_BACKEND[@]}"

# === Check frontend.env ===
if [ ! -f "$FRONTEND_ENV" ]; then
  echo "Missing $FRONTEND_ENV file."
  exit 1
fi

set -a
source "$FRONTEND_ENV"
set +a

echo "Checking frontend.env..."
check_required_vars "${REQUIRED_VARS_FRONTEND[@]}"
FRONTEND_MISSING=$?

# === Final check ===
if [ "$BACKEND_MISSING" -eq 1 ] || [ "$FRONTEND_MISSING" -eq 1 ]; then
  echo "Environment variable check failed. Fix the issues above."
  exit 1
else
  echo "All required environment variables are set."
fi
