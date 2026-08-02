import cacheManager from 'cache-manager'
import { SSMClient } from '@aws-sdk/client-ssm'
import { SecretsManagerClient } from '@aws-sdk/client-secrets-manager'
import { captureIfTracing } from './get-instrumented-aws.js'
import { CachedConfigurationRepository } from './cached-configuration-repository.js'
import { ConfigurationRepository } from './configuration-repository.js'
import { NoopLogger } from './noop-logger.js'
import { SsmRepository } from './ssm-repository.js'
import { SecretsRepository } from './secrets-repository.js'

const maxParameterCount = 10
const memoryCacheTtlInSeconds = 60

/**
 * Create a new instance of a ConfigurationRepository
 *
 * @param {object} [options] - See below
 * @param {cacheManager} [options.cache] - An instance of a cache from the npm package 'cache-manager'. Defaults to in memory cache
 * @param {string} [options.cacheKey] - A key used to isolate the configuration cache from other cache namespaces. Defaults to 'configuration'
 * @param {object} [options.log] - A pino compatible logger. Defaults to a noop logger
 * @param {object} [options.smClient] - An AWS SDK SecretsManager client. Defaults to a new SecretsManager().
 * @param {object} [options.ssmClient] - An AWS SDK SSM client. Defaults to a new SSM().
 *
 * @returns {ConfigurationRepository} The configuration repository
 */
export function createConfigurationRepository(options) {
  const {
    log = new NoopLogger(),
    cache = cacheManager.caching({
      store: 'memory',
      max: maxParameterCount,
      ttl: memoryCacheTtlInSeconds
    }),
    cacheKey = 'configuration',
    smClient = captureIfTracing(new SecretsManagerClient({})),
    ssmClient = captureIfTracing(new SSMClient({}))
  } = options

  const ssmRepository = new SsmRepository({ log, ssmClient })
  const secretsRepository = new SecretsRepository({
    log,
    smClient
  })
  const configurationRepository = new ConfigurationRepository({
    log,
    secretsRepository,
    ssmRepository
  })
  return new CachedConfigurationRepository({
    log,
    cache,
    cacheKey,
    configurationRepository
  })
}
