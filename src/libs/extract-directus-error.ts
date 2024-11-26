import { isDirectusError, isError } from './is-directus-error'

export type DirectusErrorItem = {
  message: string
  extensions: {
    code: string
  }
}

export type DirectusError = {
  errors: DirectusErrorItem[]
}

export function extractDirectusError(value: unknown): DirectusError | null {
  if (isDirectusError(value)) {
    return value as DirectusError
  }

  return null
}

export function extractError(value: unknown): Error | null {
  if (isError(value)) {
    return value as Error
  }

  return null
}
