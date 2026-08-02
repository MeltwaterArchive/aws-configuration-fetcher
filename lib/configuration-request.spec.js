import { ConfigurationRequest } from './configuration-request.js'
import { ConfigurationRequestTypes } from './configuration-request-type.js'

let ctx = {}

beforeEach(() => {
  ctx = {
    adapter: (yas) => `${yas}yas`,
    key: '/so/much/key',
    propertyName: 'wicked props',
    type: ConfigurationRequestTypes.ssm
  }
})

test('should not throw if adapter is not provided', () => {
  expect(
    () =>
      new ConfigurationRequest({
        ...ctx,
        adapter: undefined
      })
  ).not.toThrow()
})

test('should default adapter to a pass through if one is not provided', () => {
  const valueToAdapt = 'This should not be changed'
  const ssmConfigurationRequest = new ConfigurationRequest({
    ...ctx,
    adapter: undefined
  })

  expect(ssmConfigurationRequest.adapter(valueToAdapt)).toBe(valueToAdapt)
})

test('should throw if adapter is provided but not a function', () => {
  expect(
    () =>
      new ConfigurationRequest({
        ...ctx,
        adapter: 1234
      })
  ).toThrow()
})

test('should throw if key is not a string', () => {
  expect(
    () =>
      new ConfigurationRequest({
        ...ctx,
        key: 1234
      })
  ).toThrow()
})

test('should throw if propertyName is not a string', () => {
  expect(
    () =>
      new ConfigurationRequest({
        ...ctx,
        propertyName: 1234
      })
  ).toThrow()
})

test('should throw if type is not a valid ConfigurationRequestType', () => {
  expect(
    () =>
      new ConfigurationRequest({
        ...ctx,
        propertyName: 1234
      })
  ).toThrow()
})

test('should map properties from params', () => {
  const result = new ConfigurationRequest(ctx)

  expect(result.adapter).toBe(ctx.adapter)
  expect(result.key).toBe(ctx.key)
  expect(result.propertyName).toBe(ctx.propertyName)
})

test('should be immutable', () => {
  const result = new ConfigurationRequest(ctx)

  expect(() => {
    result.adapter = 1234
  }).toThrow()
  expect(() => {
    result.key = 1234
  }).toThrow()
  expect(() => {
    result.propertyName = 1234
  }).toThrow()
})

test('should be createable from itself', () => {
  const resultOne = new ConfigurationRequest(ctx)
  const resultTwo = new ConfigurationRequest(resultOne)

  expect(resultOne.adapter).toBe(resultTwo.adapter)
  expect(resultOne.key).toBe(resultTwo.key)
  expect(resultOne.propertyName).toBe(resultTwo.propertyName)
})
