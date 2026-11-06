/** Normalizes an instant to midnight UTC so dates compare by calendar day. */
export function startOfUtcDay(date: Date): Date {
  const copy = new Date(date)
  copy.setUTCHours(0, 0, 0, 0)
  return copy
}

export function endOfUtcDay(date: Date): Date {
  const copy = startOfUtcDay(date)
  copy.setUTCDate(copy.getUTCDate() + 1)
  return copy
}

/** Returns sorted, deduplicated dates at midnight UTC. */
export function normalizeDates(dates: Date[]): Date[] {
  const unique = new Map<string, Date>()

  for (const date of dates) {
    const day = startOfUtcDay(date)
    unique.set(day.toISOString(), day)
  }

  return [...unique.values()].sort((a, b) => a.getTime() - b.getTime())
}
