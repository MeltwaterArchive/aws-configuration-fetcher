#!/usr/bin/env bash

set -e
set -u

deploy_env="${1:-}"
explicit_deploy_ver="${2:-}"

if [[ -z "${deploy_env}" ]]; then
  echo "Must pass environment first argument."
  exit 2
fi

if [[ "${deploy_env}" == "production" && -z "${explicit_deploy_ver}" ]]; then
  echo "Must pass explicit version as second argument for production deployment."
  exit 2
fi

repo=$(jq -r '.repository' package.json)
pkg_deploy_ver="$(jq -r '.version' package.json)"
deploy_ver="${explicit_deploy_ver:-$pkg_deploy_ver}"

build_num="$(drone build ls $repo \
  --event tag \
  --format="{{ .Number }} {{ .Ref }}" \
  | grep -m 1 "refs/tags/v${deploy_ver}" | cut -d' ' -f1)"

if [[ -z "${build_num}" ]]; then
  echo "No recent build for tag v${deploy_ver} found."
  exit 1
fi

drone build promote $repo $build_num $deploy_env
