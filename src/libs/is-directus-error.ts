export function isDirectusError(value: unknown) {
    const isDirectusError
          = typeof value === 'object'
          && value !== null
          && Array.isArray(value) === false
          && 'errors' in value
          && Array.isArray(value.errors)

    return isDirectusError
  }

  export function isError(value: unknown) {
    const isError
          = typeof value === 'object'
          && value !== null
          && Array.isArray(value) === false
          && 'name' in value
          && 'message' in value

    return isError
  }
