#!/usr/bin/env bash
# Rebuild this checkout and swap the server binary into the running platform container.
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$root"

docker=docker
if [[ $OSTYPE == msys* && -n ${LOCALAPPDATA:-} ]] && ! command -v docker >/dev/null 2>&1; then
  docker="$LOCALAPPDATA/Programs/Rancher Desktop/resources/resources/win32/bin/docker.exe"
fi
command -v "$docker" >/dev/null 2>&1 || { echo 'docker not found; add Docker to PATH' >&2; exit 1; }
DOCKER=("$docker")

mount="$root"
if [[ $OSTYPE == msys* ]]; then
  mount="$(pwd -W)"
  # Pass Windows host paths and Linux container paths to Docker unchanged.
  DOCKER=(env MSYS2_ARG_CONV_EXCL='*' "$docker")
fi

container="${RELEASE_CONTAINER:-$("${DOCKER[@]}" ps --filter name=loopforge-platform --format '{{.Names}}' | head -1)}"
[[ -n $container ]] || { echo 'no running loopforge platform container' >&2; exit 1; }

if command -v npm >/dev/null 2>&1; then
  [[ -d chatbot/node_modules/vite ]] || npm --prefix chatbot ci --include=dev --no-audit --no-fund
  npm --prefix chatbot run build
else
  win="$(command -v wslpath >/dev/null 2>&1 && wslpath -w "$root" || echo "$root")"
  cmd.exe /c "cd /d $win && npm --prefix chatbot run build"
fi

case "$("${DOCKER[@]}" exec "$container" uname -m)" in
  x86_64) goarch=amd64 ;;
  aarch64 | arm64) goarch=arm64 ;;
  *) echo "unsupported container arch" >&2; exit 1 ;;
esac

tag="$(sed -n 's/^FROM --platform=\$BUILDPLATFORM golang:\([^ ]*\) AS build/\1/p' Dockerfile | tr -d '[:space:]')"
tag="${tag:-1.26.11-bookworm}"

mkdir -p .local/bin
ldflags="-s -w"
"${DOCKER[@]}" run --rm \
  -v "$mount:/src" \
  -v loopforge-gomod:/go/pkg/mod \
  -v loopforge-gocache:/root/.cache/go-build \
  -w /src \
  -e CGO_ENABLED=0 -e GOOS=linux -e GOARCH="$goarch" \
  "golang:$tag" \
  go build -trimpath -ldflags="$ldflags" -o /src/.local/bin/agentflow ./cmd/agentflow

"${DOCKER[@]}" cp .local/bin/agentflow "$container:/app/bin/agentflow"
"${DOCKER[@]}" restart "$container"
port="$("${DOCKER[@]}" port "$container" 8080/tcp)"
port="${port##*:}"
printf 'applied to %s; refresh http://127.0.0.1:%s\n' "$container" "$port"
