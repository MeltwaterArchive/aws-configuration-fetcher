import * as td from 'testdouble'

import { NoopLogger } from './noop-logger.js'
import { CachedConfigurationRepository } from './cached-configuration-repository.js'
import { ConfigurationRepository } from './configuration-repository.js'

let ctx = {}

beforeEach(() => {
  const log = new NoopLogger()
  const ssmRepository = {
    getParameter: () => {}
  }
  const secretsRepository = {
    getSecret: () => {}
  }
  const configurationRepository = new ConfigurationRepository({
    log,
    ssmRepository,
    secretsRepository
  })
  const getConfigurationFake = td.func('getConfigurationFake')
  td.replace(configurationRepository, 'getConfiguration', getConfigurationFake)

  const cache = {
    wrap: (_, cb) => cb()
  }

  ctx = {
    getConfigurationFake: getConfigurationFake,
    log,
    cache,
    cacheKey: 'hello!',
    configurationRepository
  }
})

test('should get configuration from downstream service', async () => {
  const configurationRequests = ['yay for configuration']
  const cachedConfigurationRepository = new CachedConfigurationRepository(ctx)

  await cachedConfigurationRepository.getConfiguration(configurationRequests)

  td.verify(ctx.getConfigurationFake(configurationRequests))
  expect(true).toBe(true)
})

test('should use constructor cacheKey parameter as the cache key', async () => {
  const cacheKey = 'yay!'
  const configurationRequests = ['yay for configuration']
  const wrapFake = td.func('wrap')
  const cachedConfigurationRepository = new CachedConfigurationRepository({
    ...ctx,
    cache: {
      wrap: wrapFake
    },
    cacheKey
  })

  await cachedConfigurationRepository.getConfiguration(configurationRequests)

  td.verify(wrapFake(cacheKey, td.matchers.anything()))
  expect(true).toBe(true)
})

test('should return value from wrapped cache', async () => {
  const expectedResult = 'So predictable'
  td.when(ctx.getConfigurationFake(td.matchers.anything())).thenReturn(
    expectedResult
  )
  const configurationRequests = ['yay for configuration']
  const cachedConfigurationRepository = new CachedConfigurationRepository(ctx)

  const result = await cachedConfigurationRepository.getConfiguration(
    configurationRequests
  )

  expect(result).toBe(expectedResult)
})
