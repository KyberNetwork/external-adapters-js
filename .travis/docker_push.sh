#!/bin/bash

set -euo pipefail

readonly DOCKER_PASSWORD=${DOCKER_PASSWORD:-}

if [[ -z "$DOCKER_PASSWORD" ]]; then
    echo 'DOCKER_PASSWORD is not available, aborting.'
    exit 1
fi

echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin

docker push kybernetwork/external-adapters-js
