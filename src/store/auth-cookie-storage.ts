import type { StateStorage } from 'zustand/middleware'

const COOKIE_NAME = 'meridian-auth'
const LEGACY_STORAGE_KEY = 'meridian-auth'
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7

function readCookie(name: string) {
  return (
    document.cookie
      .split('; ')
      .find((row) => row.startsWith(`${name}=`))
      ?.slice(name.length + 1) ?? null
  )
}

function writeCookie(name: string, value: string) {
  document.cookie = [
    `${name}=${encodeURIComponent(value)}`,
    'Path=/',
    `Max-Age=${MAX_AGE_SECONDS}`,
    'SameSite=Lax',
    window.location.protocol === 'https:' ? 'Secure' : '',
  ]
    .filter(Boolean)
    .join('; ')
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`
}

function migrateLegacyAuth() {
  const legacy = localStorage.getItem(LEGACY_STORAGE_KEY)
  if (!legacy) return null

  writeCookie(COOKIE_NAME, legacy)
  localStorage.removeItem(LEGACY_STORAGE_KEY)
  return legacy
}

export const authCookieStorage: StateStorage = {
  getItem: (name) => {
    if (name !== COOKIE_NAME) return null
    const value = readCookie(name)
    if (value) return decodeURIComponent(value)
    return migrateLegacyAuth()
  },
  setItem: (name, value) => {
    if (name === COOKIE_NAME) writeCookie(name, value)
  },
  removeItem: (name) => {
    if (name === COOKIE_NAME) deleteCookie(name)
  },
}
