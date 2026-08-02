import ac, { argName } from './argument-contracts/index.js'

import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm'

export class SsmRepository {
  constructor({ log, ssmClient }) {
    if (!(ssmClient instanceof SSMClient)) {
      throw new TypeError(
        `ssmClient must be an instance of SSMClient. Provided value: ${ssmClient}`
      )
    }
    this._log = log.child({ class: argName({ SsmRepository }) })
    this._ssmClient = ssmClient
  }

  async getParameter(parameterPath) {
    const log = this._log.child({ parameterPath })
    log.info('start: getParameter')

    ac.assertString(parameterPath, argName({ parameterPath }))

    try {
      const ssmResult = await this._ssmClient.send(
        new GetParameterCommand({
          Name: parameterPath
        })
      )

      log.info('end: getParameter')
      log.debug({ data: ssmResult }, 'end: getParameter')
      return ssmResult.Parameter.Value
    } catch (err) {
      log.error({ err }, 'fail: getParameter')
      throw err
    }
  }
}
