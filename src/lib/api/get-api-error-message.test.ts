import { describe, expect, it } from 'vitest'
import { extractFieldErrors, getApiErrorMessage, isApiError } from './get-api-error-message'

const FALLBACK = 'Something went wrong. Please try again.'

describe('getApiErrorMessage', () => {
  it('returns the first sentence from a flat message[] array', () => {
    const error = {
      response: {
        data: {
          statusCode: 400,
          message: ['email must be an email', 'password must be longer than or equal to 8 characters'],
          error: 'Bad Request',
        },
      },
    }
    expect(getApiErrorMessage(error)).toBe('email must be an email')
  })

  it('returns a top-level string message', () => {
    const error = { response: { data: { statusCode: 401, message: 'Invalid credentials' } } }
    expect(getApiErrorMessage(error)).toBe('Invalid credentials')
  })

  it('falls back to the backend error label when message is absent', () => {
    const error = { response: { data: { statusCode: 500, error: 'Internal Server Error' } } }
    expect(getApiErrorMessage(error)).toBe('Internal Server Error')
  })

  it('falls back to a JS Error message for a network error', () => {
    expect(getApiErrorMessage(new Error('Network Error'))).toBe('Network Error')
  })

  it('uses the hardcoded fallback for a malformed/empty response', () => {
    expect(getApiErrorMessage({ response: { data: {} } })).toBe(FALLBACK)
    expect(getApiErrorMessage(null)).toBe(FALLBACK)
    expect(getApiErrorMessage('weird')).toBe(FALLBACK)
    expect(getApiErrorMessage({ response: { data: { message: [] } } })).toBe(FALLBACK)
  })
})

describe('extractFieldErrors', () => {
  it('maps each sentence to the field it is prefixed with', () => {
    const error = {
      response: {
        data: {
          message: ['email must be an email', 'password must be longer than or equal to 8 characters'],
        },
      },
    }
    expect(extractFieldErrors(error)).toEqual({
      email: 'email must be an email',
      password: 'password must be longer than or equal to 8 characters',
    })
  })

  it('keeps the first message per field', () => {
    const error = {
      response: { data: { message: ['password is too weak', 'password must be longer'] } },
    }
    expect(extractFieldErrors(error)).toEqual({ password: 'password is too weak' })
  })

  it('returns an empty map for a string message or non-api error', () => {
    expect(extractFieldErrors({ response: { data: { message: 'nope' } } })).toEqual({})
    expect(extractFieldErrors(new Error('x'))).toEqual({})
  })
})

describe('isApiError', () => {
  it('recognizes response-bearing and axios errors, rejects plain values', () => {
    expect(isApiError({ response: { data: {} } })).toBe(true)
    expect(isApiError({ isAxiosError: true })).toBe(true)
    expect(isApiError(new Error('x'))).toBe(false)
    expect(isApiError(null)).toBe(false)
  })
})
