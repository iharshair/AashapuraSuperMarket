#!/usr/bin/env bash
# Local review server for manual/browser testing.
set -euo pipefail
cd "$(dirname "$0")/.."
exec npx vite preview --port "${1:-4173}" --host 127.0.0.1
