import * as td from 'testdouble'

import { ConfigurationRepository } from './configuration-repository.js'
import { SecretsRepository } from './secrets-repository.js'
import { SsmRepository } from './ssm-repository.js'
import { NoopLogger } from './noop-logger.js'
import { SSMClient } from '@aws-sdk/client-ssm'
import { SecretsManagerClient } from '@aws-sdk/client-secrets-manager'
import { ConfigurationRequest } from './configuration-request.js'

let ctx = {}

beforeAll(() => {
  td.config({ ignoreWarnings: true })
})

beforeEach(() => {
  const log = new NoopLogger()
  const ssmRepository = new SsmRepository({ log, ssmClient: new SSMClient({}) })
  const secretsRepository = new SecretsRepository({
    log,
    smClient: new SecretsManagerClient({})
  })

  ctx = {
    log,
    ssmRepository,
    secretsRepository
  }
})

test('should throw if ssmRepository does not have a getParameter method', () => {
  expect(
    () =>
      new ConfigurationRepository({
        ...ctx,
        ssmRepository: {}
      })
  ).toThrow()
})

test('getConfiguration should throw if provided requests are not valid', async () => {
  const configurationRepository = new ConfigurationRepository(ctx)

  await expect(() =>
    configurationRepository.getConfiguration({})
  ).rejects.toThrow()
  await expect(
    configurationRepository.getConfiguration([1234])
  ).rejects.toThrow()

  await expect(configurationRepository.getConfiguration([{}])).rejects.toThrow()
})

test('getConfiguration should throw if more multiple requests use the same propertyName', async () => {
  const configurationRepository = new ConfigurationRepository(ctx)
  const fakeGetParameter = td.func('fakeGetParameter')
  td.when(fakeGetParameter(td.matchers.anything())).thenReturn('yay')
  td.replace(ctx.ssmRepository, 'getParameter', fakeGetParameter)

  const configurationRequests = [
    {
      adapter: (x) => x,
      key: 'woot/woot/woot',
      propertyName: 'winner',
      type: 'ssm'
    },
    {
      adapter: (x) => x,
      key: 'yes/yes/yes',
      propertyName: 'winner',
      type: 'secret'
    }
  ]

  await expect(
    configurationRepository.getConfiguration(configurationRequests)
  ).rejects.toThrow()
})

test('getConfiguration should get all requested local parameters', async () => {
  const configurationRepository = new ConfigurationRepository(ctx)

  const configurationRequests = [
    {
      adapter: (x) => x,
      key: 'woot/woot/woot',
      propertyName: 'winner',
      type: 'local'
    },
    {
      adapter: (x) => x,
      key: 'yes/yes/yes',
      propertyName: 'successor',
      type: 'local'
    }
  ]

  const config = await configurationRepository.getConfiguration(
    configurationRequests
  )
  expect(config).toMatchObject({
    [configurationRequests[0].propertyName]: configurationRequests[0].key,
    [configurationRequests[1].propertyName]: configurationRequests[1].key
  })
})

test('getConfiguration should get all requested ssm parameters', async () => {
  const configurationRepository = new ConfigurationRepository(ctx)
  const fakeGetParameter = td.func('fakeGetParameter')
  td.when(fakeGetParameter(td.matchers.anything())).thenReturn('yay')
  td.replace(ctx.ssmRepository, 'getParameter', fakeGetParameter)

  const configurationRequests = [
    {
      adapter: (x) => x,
      key: 'woot/woot/woot',
      propertyName: 'winner',
      type: 'ssm'
    },
    {
      adapter: (x) => x,
      key: 'yes/yes/yes',
      propertyName: 'successor',
      type: 'ssm'
    }
  ]

  await configurationRepository.getConfiguration(configurationRequests)

  td.verify(fakeGetParameter(configurationRequests[0].key))
  td.verify(fakeGetParameter(configurationRequests[1].key))
  expect(true).toBe(true)
})

test('getConfiguration should get all requested secrets', async () => {
  const configurationRepository = new ConfigurationRepository(ctx)
  const fakeGetSecret = td.func('fakeGetSecret')
  td.when(fakeGetSecret(td.matchers.anything())).thenReturn('yay')
  td.replace(ctx.secretsRepository, 'getSecret', fakeGetSecret)

  const configurationRequests = [
    {
      adapter: (x) => x,
      key: 'woot/woot/woot',
      propertyName: 'winner',
      type: 'secret'
    },
    {
      adapter: (x) => x,
      key: 'yes/yes/yes',
      propertyName: 'successor',
      type: 'secret'
    }
  ]

  await configurationRepository.getConfiguration(configurationRequests)

  td.verify(fakeGetSecret(configurationRequests[0].key))
  td.verify(fakeGetSecret(configurationRequests[1].key))
  expect(true).toBe(true)
})

test('getConfiguration should adapt all responses', async () => {
  const configurationRepository = new ConfigurationRepository(ctx)
  const fakeGetParameter = td.func('fakeGetParameter')
  const responseOne = 'yay'
  const responseTwo = 'boo'
  td.when(fakeGetParameter(td.matchers.anything())).thenReturn(responseOne)
  td.replace(ctx.ssmRepository, 'getParameter', fakeGetParameter)
  const fakeGetSecret = td.func('fakeGetSecret')
  td.when(fakeGetSecret(td.matchers.anything())).thenReturn(responseTwo)
  td.replace(ctx.secretsRepository, 'getSecret', fakeGetSecret)

  const configurationRequests = [
    {
      adapter: td.func(),
      key: 'woot/woot/woot',
      propertyName: 'winner',
      type: 'ssm'
    },
    {
      adapter: td.func(),
      key: 'yes/yes/yes',
      propertyName: 'successor',
      type: 'secret'
    }
  ]

  await configurationRepository.getConfiguration(configurationRequests)

  td.verify(configurationRequests[0].adapter(responseOne))
  td.verify(configurationRequests[1].adapter(responseTwo))
  expect(true).toBe(true)
})

test('getConfiguration should map responses to their property names', async () => {
  const configurationRepository = new ConfigurationRepository(ctx)
  const fakeGetParameter = td.func('fakeGetParameter')
  const responseOne = 'yay'
  const responseTwo = 'boo'
  td.when(fakeGetParameter(td.matchers.anything())).thenReturn(responseOne)
  td.replace(ctx.ssmRepository, 'getParameter', fakeGetParameter)
  const fakeGetSecret = td.func('fakeGetSecret')
  td.when(fakeGetSecret(td.matchers.anything())).thenReturn(responseTwo)
  td.replace(ctx.secretsRepository, 'getSecret', fakeGetSecret)

  const configurationRequests = [
    {
      adapter: (x) => x,
      key: 'woot/woot/woot',
      propertyName: 'the number one property',
      type: 'ssm'
    },
    {
      adapter: (x) => x,
      key: 'yes/yes/yes',
      propertyName: 'I will not be called number 2',
      type: 'secret'
    }
  ]

  const result = await configurationRepository.getConfiguration(
    configurationRequests
  )

  expect(result[configurationRequests[0].propertyName]).toBe(responseOne)
  expect(result[configurationRequests[1].propertyName]).toBe(responseTwo)
})

test('should return responses in a consistent format', async () => {
  const configurationRepository = new ConfigurationRepository(ctx)
  const fakeGetParameter = td.func('fakeGetParameter')
  const responseOne = 'somePropertyValue'
  const responseTwo = 'someOtherPropertyValue'
  td.when(fakeGetParameter(td.matchers.anything())).thenReturn(responseOne)
  td.replace(ctx.ssmRepository, 'getParameter', fakeGetParameter)
  const fakeGetSecret = td.func('fakeGetSecret')
  td.when(fakeGetSecret(td.matchers.anything())).thenReturn(responseTwo)
  td.replace(ctx.secretsRepository, 'getSecret', fakeGetSecret)

  const configurationRequests = [
    new ConfigurationRequest({
      adapter: (x) => x,
      key: 'woot/woot/woot',
      propertyName: 'someProperty',
      type: 'ssm'
    }),
    new ConfigurationRequest({
      adapter: (x) => x,
      key: 'yes/yes/yes',
      propertyName: 'somOtherProperty',
      type: 'secret'
    })
  ]

  const result = await configurationRepository.getConfiguration(
    configurationRequests
  )

  expect(result).toMatchSnapshot()
})
