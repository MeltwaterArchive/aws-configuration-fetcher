import { ConfigurationRequestTypes } from './configuration-request-type.js'

test('isValid should return true for valid configuration type', () => {
  expect(
    ConfigurationRequestTypes.isValid(ConfigurationRequestTypes.secret)
  ).toBe(true)
})

test('isValid should return false for invalid items', () => {
  expect(ConfigurationRequestTypes.isValid({})).toBe(false)
  expect(ConfigurationRequestTypes.isValid(1234)).toBe(false)
  expect(ConfigurationRequestTypes.isValid([])).toBe(false)
  expect(ConfigurationRequestTypes.isValid('hooray')).toBe(false)
  expect(ConfigurationRequestTypes.isValid(Symbol('what?'))).toBe(false)
  expect(ConfigurationRequestTypes.isValid(false)).toBe(false)
})
