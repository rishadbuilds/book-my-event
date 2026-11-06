/**
 * The subset of configuration the application layer is allowed to see.
 * Infrastructure supplies the concrete env object, which structurally
 * satisfies this port.
 */
export interface AppConfig {
  isProduction: boolean
  otp: {
    ttlMinutes: number
    maxAttempts: number
    resendCooldownSeconds: number
  }
}
