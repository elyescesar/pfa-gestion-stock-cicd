#!/usr/bin/env bash
set -euo pipefail
IMAGE_KIND="${IMAGE_KIND:-golang:1.23-alpine}"
KIND_VERSION="${KIND_VERSION:-v0.26.0}"
docker run --rm \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v "$(pwd):/work" -w /work \
  -e KIND_EXPERIMENTAL_PROVIDER="${KIND_EXPERIMENTAL_PROVIDER:-}" \
  "$IMAGE_KIND" sh -ec "
    apk add --no-cache docker-cli >/dev/null 2>&1 || true
    go install sigs.k8s.io/kind@${KIND_VERSION}
    export PATH=\"\$PATH:/root/go/bin\"
    kind \"\$@\"
  " -- "$@"
