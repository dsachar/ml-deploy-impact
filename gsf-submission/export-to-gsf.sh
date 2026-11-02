#!/usr/bin/env bash
set -euo pipefail

# export-to-gsf.sh
# Copies ml-deploy-impact into a clone of Green-Software-Foundation/reference-implementations
# under tools/community/ml-deploy-impact/

if [ "$#" -ne 1 ]; then
  echo "Usage: $0 <path-to-reference-implementations-repo>"
  exit 1
fi

DEST_REPO="$1"
TARGET_DIR="${DEST_REPO}/tools/community/ml-deploy-impact"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

echo "=== 1. Running offline test suite ==="
(cd "${ROOT_DIR}" && npm test)

echo "=== 2. Creating target directory: ${TARGET_DIR} ==="
mkdir -p "${TARGET_DIR}"

echo "=== 3. Copying project files ==="
cp "${ROOT_DIR}/README.md" "${TARGET_DIR}/"
cp "${ROOT_DIR}/index.html" "${TARGET_DIR}/"
cp "${ROOT_DIR}/styles.css" "${TARGET_DIR}/"
cp "${ROOT_DIR}/app.js" "${TARGET_DIR}/"
cp "${ROOT_DIR}/simulation-core.js" "${TARGET_DIR}/"
cp "${ROOT_DIR}/i18n.js" "${TARGET_DIR}/"
cp "${ROOT_DIR}/package.json" "${TARGET_DIR}/"
cp "${ROOT_DIR}/info.md" "${TARGET_DIR}/"
cp "${ROOT_DIR}/LICENSE" "${TARGET_DIR}/"
cp "${ROOT_DIR}/.gitignore" "${TARGET_DIR}/"

mkdir -p "${TARGET_DIR}/locales"
cp -r "${ROOT_DIR}/locales/"* "${TARGET_DIR}/locales/"

mkdir -p "${TARGET_DIR}/tests"
cp -r "${ROOT_DIR}/tests/"* "${TARGET_DIR}/tests/"

echo "=== 4. Verifying exported tests in destination ==="
(cd "${TARGET_DIR}" && npm test)

echo "=== Export completed successfully! ==="
echo "Files ready at: ${TARGET_DIR}"
