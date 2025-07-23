#!/bin/bash

set -e

echo "===  Starting Full CULI Deployment ==="

# Optional: Check and install dependencies
# ./scripts/dependency.sh

# ./scripts/infra_initiate.sh

# ./scripts/generate_env.sh

# ./scripts/ecr_initiate.sh

# ./scripts/image_upload.sh

./scripts/update_env.sh

echo "All done. Your ECS infra is ready with updated environment!"
