#!/usr/bin/env bash

set -e
set -u

help () {
  echo
  echo '# This will set all required secrets on the Drone project.'
  echo
  echo '# Supply values to set when prompted.'
  echo '# Values left blank will not be updated.'
  echo
  echo 'Values may also be provided via' \
       'the corresponding environment variable (prefixed with CI_).'
  echo 'Optionally, set NONINTERACTIVE=true to skip all prompts.'
  echo
  echo 'For example, update NPM_TOKEN with'
  echo
  echo '    $ NONINTERACTIVE=true CI_NPM_TOKEN=token .drone/secrets.sh'
}

help_drone () {
  echo
  echo '> You must have the Drone CLI configured:' \
       'https://drone.meltwater.io/account/token'
}

help_npm_token () {
  echo
  echo '> Use a valid token for the meltwater-mlabs user'
}

help_npm_team () {
  echo
  echo '> Use meltwater:read-only'
}

help_codecov () {
  echo
  echo '> Get the Repository Upload Token at' \
       "https://codecov.io/gh/${drone_repo}/settings"
}

help_drone () {
  echo
  echo '> Trigger deploys with Drone by setting the following environment variables.'
}

help_drone_server () {
  echo
  echo '> Just put https://drone.meltwater.io'
}

help_drone_token () {
  echo
  echo '> Use a valid token for the meltwater-mlabs GitHub user'
}

command -v jq >/dev/null 2>&1 || \
  (echo 'jq required: https://stedolan.github.io/jq/' && exit 2)

command -v drone >/dev/null 2>&1 || \
  (echo 'Drone CLI v1 required: https://docs.drone.io/cli/install/' && exit 2)

addsecret () {
  name=$1
  value=${2:-}
  if [[ -n "${value}" ]]; then
    drone secret add --repository $drone_repo --data $value --name $name || true
    echo "Added secret ${name}"
  fi
}

main () {
  noninteractive=$1
  drone_repo=$(jq -r .repository package.json)
  help_drone

  npm_token_ro=${CI_NPM_TOKEN_RO:-}
  [[ -n "${npm_token_ro}" || $noninteractive == 'true' ]] || help_npm_token
  if [[ -z $npm_token_ro && $noninteractive != 'true' ]]; then
    read -p '> NPM token (NPM_TOKEN_RO): ' npm_token_ro
  fi

  npm_token_rw=${CI_NPM_TOKEN_RW:-}
  [[ -n "${npm_token_rw}" || $noninteractive == 'true' ]] || help_npm_token
  if [[ -z $npm_token_rw && $noninteractive != 'true' ]]; then
    read -p '> NPM token (NPM_TOKEN_RW): ' npm_token_rw
  fi

  npm_team=${CI_NPM_TEAM:-}
  [[ -n "${npm_team}" || $noninteractive == 'true' ]] || help_npm_team
  if [[ -z $npm_team && $noninteractive != 'true' ]]; then
    read -p '> NPM team (NPM_TEAM): ' npm_team
  fi

  slack_webhook=${CI_SLACK_WEBHOOK:-}
  if [[ -z $slack_webhook && $noninteractive != 'true' ]]; then
    read -p '> Slack webhook (SLACK_WEBHOOK): ' slack_webhook
  fi

  [[ $noninteractive == 'true' ]] || help_drone

  drone_server=${CI_DRONE_SERVER:-}
  [[ -n "${drone_server}" || $noninteractive == 'true' ]] || help_drone_server
  if [[ -z $drone_server && $noninteractive != 'true' ]]; then
    read -p '> Drone server (DRONE_SERVER): ' drone_server
  fi

  drone_token=${CI_DRONE_TOKEN:-}
  [[ -n "${drone_token}" || $noninteractive == 'true' ]] || help_drone_token
  if [[ -z $drone_token && $noninteractive != 'true' ]]; then
    read -p '> Drone token (DRONE_TOKEN): ' drone_token
  fi

  aws_assume_role_arn_staging=${CI_AWS_ASSUME_ROLE_ARN_STAGING:-}
  if [[ -z $aws_assume_role_arn_staging && $noninteractive != 'true' ]]; then
    read -p '> AWS assume role ARN token (AWS_ASSUME_ROLE_ARN_STAGING): ' aws_assume_role_arn_staging
  fi

  aws_assume_role_external_id_staging=${CI_AWS_ASSUME_ROLE_EXTERNAL_ID_STAGING:-}
  if [[ -z $aws_assume_role_external_id_staging && $noninteractive != 'true' ]]; then
    read -p '> AWS assume role external id (AWS_ASSUME_ROLE_EXTERNAL_ID_STAGING): ' aws_assume_role_external_id_staging
  fi

  aws_assume_role_arn_production=${CI_AWS_ASSUME_ROLE_ARN_PRODUCTION:-}
  if [[ -z $aws_assume_role_arn_production && $noninteractive != 'true' ]]; then
    read -p '> AWS assume role ARN token (AWS_ASSUME_ROLE_ARN_PRODUCTION): ' aws_assume_role_arn_production
  fi

  aws_assume_role_external_id_production=${CI_AWS_ASSUME_ROLE_EXTERNAL_ID_PRODUCTION:-}
  if [[ -z $aws_assume_role_external_id_production && $noninteractive != 'true' ]]; then
    read -p '> AWS assume role external id (AWS_ASSUME_ROLE_EXTERNAL_ID_PRODUCTION): ' aws_assume_role_external_id_production
  fi

  echo 'Checking Drone server'
  drone info

  echo 'Synchronizing repos in drone. (This may take a while)'
  drone repo sync

  echo 'Adding Drone repository'
  drone repo enable "$drone_repo" || true
  drone repo update --config ".drone/config.yml" "$drone_repo" || true

  addsecret 'npm_token_ro' "${npm_token_ro}"
  addsecret 'npm_token_rw' "${npm_token_rw}"
  addsecret 'npm_team' "${npm_team}"
  addsecret 'slack_webhook' "${slack_webhook}"
  addsecret 'drone_server' "${drone_server}"
  addsecret 'drone_token' "${drone_token}"
  addsecret 'aws_assume_role_arn_staging' "${aws_assume_role_arn_staging}"
  addsecret 'aws_assume_role_external_id_staging' "${aws_assume_role_external_id_staging}"
  addsecret 'aws_assume_role_arn_production' "${aws_assume_role_arn_production}"
  addsecret 'aws_assume_role_external_id_production' "${aws_assume_role_external_id_production}"
}

noninteractive=${NONINTERACTIVE:-false}
if [[ $noninteractive != 'true' ]]; then
  help
fi
main $noninteractive
