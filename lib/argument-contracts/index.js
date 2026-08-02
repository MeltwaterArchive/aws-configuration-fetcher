const urlPattern = {
  test(value) {
    if (typeof value !== 'string') return false
    try {
      const url = new URL(value)
      return url.protocol === 'http:' || url.protocol === 'https:'
    } catch (_) {
      return false
    }
  }
}

function throwError(argument, argumentName, typeString) {
  let argumentString
  try {
    argumentString = JSON.stringify(argument)
  } catch (_) {
    argumentString = argument
  }
  throw new TypeError(
    `Expected ${
      argumentName || 'argument'
    } to be ${typeString}. Value received: ${argumentString}`
  )
}

const ac = {
  assertNotNil(argument, argumentName) {
    if (argument == null) {
      throwError(argument, argumentName, 'not null or undefined')
    }
  },
  assertString(argument, argumentName) {
    if (typeof argument !== 'string' && !(argument instanceof String)) {
      throwError(argument, argumentName, 'a string')
    }
  },
  assertUrl(argument, argumentName) {
    ac.assertString(argument, argumentName)
    if (!urlPattern.test(argument)) {
      throwError(argument, argumentName, 'a url')
    }
  },
  assertNonWhiteSpaceString(argument, argumentName) {
    ac.assertString(argument, argumentName)
    if (argument.trim() === '') {
      throwError(argument, argumentName, 'a non white space string')
    }
  },
  assertNumber(argument, argumentName) {
    if (typeof argument !== 'number' && !(argument instanceof Number)) {
      throwError(argument, argumentName, 'a number')
    }
  },
  assertBoolean(argument, argumentName) {
    if (typeof argument !== 'boolean' && !(argument instanceof Boolean)) {
      throwError(argument, argumentName, 'a boolean')
    }
  },
  assertFunction(argument, argumentName) {
    if (typeof argument !== 'function') {
      throwError(argument, argumentName, 'a function')
    }
  },
  assertObject(argument, argumentName) {
    if (
      typeof argument !== 'object' ||
      argument === null ||
      Array.isArray(argument)
    ) {
      throwError(argument, argumentName, 'an object')
    }
  },
  assertArray(argument, argumentName) {
    if (!Array.isArray(argument)) {
      throwError(argument, argumentName, 'an array')
    }
  },
  assertArrayOf(argument, type, argumentName) {
    ac.assertArray(argument, argumentName)
    if (!argument.every((item) => isTypeMatch(item, type))) {
      throwError(
        argument,
        argumentName,
        `an array of ${(type && type.name) || type}`
      )
    }
  },
  assertType(argument, type, argumentName) {
    if (!isTypeMatch(argument, type)) {
      throwError(
        argument,
        argumentName,
        `of type ${(type && type.name) || type}`
      )
    }
  }
}

// Mirrors @meltwater/argument-contracts isTypeMatch: primitives by typeof,
// and for a custom class an item matches if it is an instance OR can be
// constructed into the type (the coerce(arg, Type) behaviour the original used).
function isTypeMatch(argument, type) {
  if (type === Array) return Array.isArray(argument)
  if (type === String) { return typeof argument === 'string' || argument instanceof String }
  if (type === Number) { return typeof argument === 'number' || argument instanceof Number }
  if (type === Boolean) { return typeof argument === 'boolean' || argument instanceof Boolean }
  if (type === Function) return typeof argument === 'function'
  if (type === Object) return argument !== null && typeof argument === 'object'
  if (argument instanceof type) return true
  try {
    // eslint-disable-next-line no-new, new-cap
    new type(argument)
    return true
  } catch (_) {
    return false
  }
}

export default ac

export function argName(input) {
  if (typeof input !== 'object') {
    throw new TypeError('The provided input must be of type "object"')
  }
  return Reflect.ownKeys(input).shift()
}
