#!/bin/bash

set -e

echo "===  Starting Full CULI Deployment ==="

./scripts/variable_check.sh

./scripts/dependency_check.sh

./scripts/infra_initiate.sh

./scripts/generate_env.sh

./scripts/ecr_initiate.sh

./scripts/image_upload.sh

./scripts/update_env.sh

echo "All done. Your ECS infra is ready with updated environment!"
