#!/bin/bash

set -e

echo "🔍 Checking if sed is installed..."

# Check if sed is available
if command -v sed >/dev/null 2>&1; then
  echo "sed is already installed."
else
  echo "sed not found. Attempting to install..."

  # Detect OS and install accordingly
  if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    if command -v apt >/dev/null 2>&1; then
      sudo apt update
      sudo apt install -y sed
    elif command -v yum >/dev/null 2>&1; then
      sudo yum install -y sed
    else
      echo "Unsupported Linux package manager."
      exit 1
    fi
  elif [[ "$OSTYPE" == "darwin"* ]]; then
    if command -v brew >/dev/null 2>&1; then
      brew install gnu-sed
      echo "Installed GNU sed as gsed (use 'gsed' instead of 'sed')."
    else
      echo "Homebrew not found. Please install Homebrew: https://brew.sh"
      exit 1
    fi
  else
    echo "Unsupported OS: $OSTYPE"
    exit 1
  fi
fi

echo "Dependency check complete."
