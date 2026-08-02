import ac from './argument-contracts/index.js'

import { ConfigurationRequest } from './configuration-request.js'
import { ConfigurationRequestTypes } from './configuration-request-type.js'

export const createLocalStringConfigurationRequest = (propertyName, key) =>
  new ConfigurationRequest({
    adapter: (value) => {
      ac.assertNonWhiteSpaceString(value, propertyName)
      return value
    },
    key,
    propertyName,
    type: ConfigurationRequestTypes.local
  })

export const createSecretStringConfigurationRequest = (propertyName, key) =>
  new ConfigurationRequest({
    adapter: (value) => {
      ac.assertNonWhiteSpaceString(value, propertyName)
      return value
    },
    key,
    propertyName,
    type: ConfigurationRequestTypes.secret
  })

export const createSsmStringConfigurationRequest = (propertyName, key) =>
  new ConfigurationRequest({
    adapter: (value) => {
      ac.assertNonWhiteSpaceString(value, propertyName)
      return value
    },
    key,
    propertyName,
    type: ConfigurationRequestTypes.ssm
  })
