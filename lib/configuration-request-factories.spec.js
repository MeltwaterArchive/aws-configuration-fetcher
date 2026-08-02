import {
  createLocalStringConfigurationRequest,
  createSecretStringConfigurationRequest,
  createSsmStringConfigurationRequest
} from './configuration-request-factories.js'

test('createLocalStringConfigurationRequest', () => {
  expect(
    createLocalStringConfigurationRequest('theName', 'the/path')
  ).toMatchSnapshot()
})

test('createSecretStringConfigurationRequest', () => {
  expect(
    createSecretStringConfigurationRequest('theName', 'the/path')
  ).toMatchSnapshot()
})

test('createSsmStringConfigurationRequest', () => {
  expect(
    createSsmStringConfigurationRequest('theName', 'the/path')
  ).toMatchSnapshot()
})

test('createLocalStringConfigurationRequest.adapter', () => {
  const req = createLocalStringConfigurationRequest('theName', 'the/path')
  expect(req.adapter('foo')).toBe('foo')
  expect(() => req.adapter('')).toThrow()
  expect(() => req.adapter(4)).toThrow()
  expect(() => req.adapter(null)).toThrow()
})

test('createSecretStringConfigurationRequest.adapter', () => {
  const req = createSecretStringConfigurationRequest('theName', 'the/path')
  expect(req.adapter('foo')).toBe('foo')
  expect(() => req.adapter('')).toThrow()
  expect(() => req.adapter(4)).toThrow()
  expect(() => req.adapter(null)).toThrow()
})

test('createSsmStringConfigurationRequest.adapter', () => {
  const req = createSsmStringConfigurationRequest('theName', 'the/path')
  expect(req.adapter('foo')).toBe('foo')
  expect(() => req.adapter('')).toThrow()
  expect(() => req.adapter(4)).toThrow()
  expect(() => req.adapter(null)).toThrow()
})
