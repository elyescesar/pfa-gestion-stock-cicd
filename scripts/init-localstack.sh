#!/usr/bin/env bash
set -euo pipefail
BUCKET="${S3_BUCKET_EXPORTS:-pfa-stock-exports}"
ENDPOINT="${AWS_ENDPOINT_URL:-http://localhost:4566}"
docker run --rm --network pfa_pfa \
  -e AWS_ACCESS_KEY_ID=test \
  -e AWS_SECRET_ACCESS_KEY=test \
  amazon/aws-cli:latest \
  --endpoint-url="$ENDPOINT" \
  s3 mb "s3://${BUCKET}" 2>/dev/null || true
docker run --rm --network pfa_pfa \
  -e AWS_ACCESS_KEY_ID=test \
  -e AWS_SECRET_ACCESS_KEY=test \
  amazon/aws-cli:latest \
  --endpoint-url="$ENDPOINT" \
  s3 ls
