import ac, { argName } from './argument-contracts/index.js'

import {
  SecretsManagerClient,
  GetSecretValueCommand
} from '@aws-sdk/client-secrets-manager'

export class SecretsRepository {
  constructor({ log, smClient }) {
    if (!(smClient instanceof SecretsManagerClient)) {
      throw new TypeError(
        `smClient must be an instance of SecretsManagerClient. Provided value: ${smClient}`
      )
    }
    this._log = log.child({ class: argName({ SecretsRepository }) })
    this._smClient = smClient
  }

  async getSecret(secretId) {
    const log = this._log.child({ secretId })
    log.info('start: getSecret')

    ac.assertString(secretId, argName({ secretId }))

    try {
      const smResult = await this._smClient.send(
        new GetSecretValueCommand({
          SecretId: secretId
        })
      )

      log.info('end: getSecret')
      log.debug({ data: smResult }, 'end: getSecret')
      return smResult.SecretString
    } catch (err) {
      log.error({ err }, 'fail: getSecret')
      throw err
    }
  }
}
