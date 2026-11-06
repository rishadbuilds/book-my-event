/** Escapes user input before it is embedded in a MongoDB regex. */
export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
