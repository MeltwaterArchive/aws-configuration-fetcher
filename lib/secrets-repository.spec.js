import * as td from 'testdouble'

import { NoopLogger } from './noop-logger.js'
import { SecretsRepository } from './secrets-repository.js'
import { SecretsManagerClient } from '@aws-sdk/client-secrets-manager'

let options
beforeEach(() => {
  const smClient = new SecretsManagerClient({})
  options = {
    log: new NoopLogger(),
    smClient
  }
})

test('should throw if secrets manager client is not an AWS SecretsManager client', () => {
  expect(
    () => new SecretsRepository({ log: new NoopLogger(), smClient: null })
  ).toThrow(/instance of SecretsManagerClient/i)
})

test('getSecret should throw if secretId is not a string', async () => {
  const secretsRepository = new SecretsRepository(options)

  await expect(secretsRepository.getSecret(1234)).rejects.toThrow(
    /secretId.*string/i
  )
})

test('getSecret should throw if smClient throws', async () => {
  td.replace(options.smClient, 'send', () => Promise.reject(new Error('boom')))

  const secretsRepository = new SecretsRepository(options)

  await expect(secretsRepository.getSecret('something valid')).rejects.toThrow(
    /boom/i
  )
})

test('getSecret should map secretId to GetSecretValueCommand input', async () => {
  td.replace(options.smClient, 'send', (command) => {
    expect(command.input).toMatchSnapshot()
    return Promise.resolve({ SecretString: 'yay' })
  })

  const secretsRepository = new SecretsRepository(options)

  await secretsRepository.getSecret('something valid')
})

test('getSecret should map response to type and value', async () => {
  const smResponse = {
    SecretString: '🙅‍♂️'
  }
  td.replace(options.smClient, 'send', () => Promise.resolve(smResponse))

  const secretsRepository = new SecretsRepository(options)

  const result = await secretsRepository.getSecret('something valid')

  expect(result).toBe(smResponse.SecretString)
})
