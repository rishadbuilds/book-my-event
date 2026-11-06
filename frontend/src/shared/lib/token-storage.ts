const TOKEN_KEY = 'bookmyevent.accessToken'

/** Small adapter so storage can be swapped without touching auth code. */
export const tokenStorage = {
  get(): string | null {
    return typeof window === 'undefined' ? null : window.localStorage.getItem(TOKEN_KEY)
  },
  set(token: string): void {
    if (typeof window !== 'undefined') window.localStorage.setItem(TOKEN_KEY, token)
  },
  clear(): void {
    if (typeof window !== 'undefined') window.localStorage.removeItem(TOKEN_KEY)
  },
}
