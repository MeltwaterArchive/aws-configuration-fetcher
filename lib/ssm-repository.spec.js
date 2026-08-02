import * as td from 'testdouble'

import { NoopLogger } from './noop-logger.js'
import { SsmRepository } from './ssm-repository.js'
import { SSMClient } from '@aws-sdk/client-ssm'

let options
beforeEach(() => {
  const ssmClient = new SSMClient({})
  options = {
    log: new NoopLogger(),
    ssmClient
  }
})

test('should throw if ssm client is not an AWS SSM client', () => {
  expect(
    () => new SsmRepository({ log: new NoopLogger(), ssmClient: null })
  ).toThrow(/instance of SSMClient/i)
})

test('getParameter should throw if parameterPath is not a string', async () => {
  const ssmRepository = new SsmRepository(options)

  await expect(ssmRepository.getParameter(1234)).rejects.toThrow(
    /parameterPath.*string/i
  )
})

test('getParameter should throw if ssmClient throws', async () => {
  td.replace(options.ssmClient, 'send', () => Promise.reject(new Error('boom')))

  const ssmRepository = new SsmRepository(options)

  await expect(ssmRepository.getParameter('something valid')).rejects.toThrow(
    /boom/i
  )
})

test('getParameter should map parameterPath to GetParameterCommand input', async () => {
  td.replace(options.ssmClient, 'send', (command) => {
    expect(command.input).toMatchSnapshot()
    return Promise.resolve({ Parameter: {} })
  })

  const ssmRepository = new SsmRepository(options)

  await ssmRepository.getParameter('something valid')
})

test('getParameter should map response to type and value', async () => {
  const ssmResponse = {
    Parameter: {
      Value: '🙅‍♂️'
    }
  }
  td.replace(options.ssmClient, 'send', () => Promise.resolve(ssmResponse))

  const ssmRepository = new SsmRepository(options)

  const result = await ssmRepository.getParameter('something valid')

  expect(result).toBe(ssmResponse.Parameter.Value)
})
