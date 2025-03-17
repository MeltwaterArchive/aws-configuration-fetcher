#!/usr/bin/env bash

set -e
set -u

pkg_name=$(jq -r '.name' package.json)
pkg_version=$(jq -r '.version' package.json)

notify_mpkg () {
  mpkg_name="${pkg_name##*/}"

  body='{"packageName":"'"$mpkg_name"'","version":"'"$pkg_version"'"}'

  curl \
    -H "Content-Type: application/json" \
    -d "$body" \
    -X POST \
    "https://v1.mpkg.meltwater.io/npm/manualHook"

  echo "> Notified MPKG of $mpkg_name version $pkg_version."
}

if [[ "$(git log -1 --pretty='%s')" == "chore(release): ${pkg_version}" ]]; then
  if [[ -z "$(npm view ${pkg_name}@${pkg_version})" ]]; then
    npm publish
    notify_mpkg
    echo
    echo "> Published ${pkg_name}@${pkg_version}."
    echo
  else
    echo
    echo "> Already published ${pkg_name}@${pkg_version}."
    echo
  fi
else
  echo
  echo '> Nothing to publish: not a new version commit.'
  echo
fi
