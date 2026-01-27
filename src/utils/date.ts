export const getLocalDateKey = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const dateKeyToDate = (dateKey: string): Date => {
  const [year, month, day] = dateKey.split('-').map((n) => Number(n))
  return new Date(year, month - 1, day, 12, 0, 0, 0)
}

export const addDays = (dateKey: string, deltaDays: number): string => {
  const base = dateKeyToDate(dateKey)
  const next = new Date(base)
  next.setDate(next.getDate() + deltaDays)
  return getLocalDateKey(next)
}
