import AWSXRay from 'aws-xray-sdk-core'

/**
 * Wrap an AWS SDK v3 client with X-Ray tracing when running inside a traced
 * environment (Lambda sets `_X_AMZN_TRACE_ID`). Otherwise return the client
 * unchanged. `captureAWSv3Client` patches and returns the same client instance,
 * so `instanceof` checks on the wrapped client still hold.
 *
 * @param {object} client - An AWS SDK v3 client instance
 * @returns {object} The (optionally traced) client
 */
export const captureIfTracing = (client) => {
  if (process.env._X_AMZN_TRACE_ID) {
    return AWSXRay.captureAWSv3Client(client)
  }
  // eslint-disable-next-line no-console
  console.log('Running without x-ray tracing...')
  return client
}
