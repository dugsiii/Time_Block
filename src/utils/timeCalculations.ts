import { Task } from '../types'

/**
 * Round time up to the nearest 15 minutes
 * Examples: 8:00 → 8:00, 8:01 → 8:15, 8:37 → 8:45
 */
export const roundTimeUp = (date: Date): Date => {
  const minutes = date.getMinutes()
  const remainder = minutes % 15

  if (remainder === 0) {
    return new Date(date)
  }

  const roundedMinutes = minutes + (15 - remainder)
  const newDate = new Date(date)
  newDate.setMinutes(roundedMinutes)
  newDate.setSeconds(0)
  newDate.setMilliseconds(0)

  return newDate
}

/**
 * Recalculate all task start times based on their order
 * First task starts at 8:00 AM, subsequent tasks follow sequentially
 */
export const recalculateTaskTimes = (tasks: Task[]): Task[] => {
  // Sort by order
  const sorted = [...tasks].sort((a, b) => a.order - b.order)

  // Start at 8:00 AM
  const startOfDay = new Date()
  startOfDay.setHours(8, 0, 0, 0)

  let currentTime = new Date(startOfDay)

  return sorted.map((task) => {
    const updatedTask = {
      ...task,
      startTime: new Date(currentTime),
    }

    // Move current time forward by task duration
    currentTime = new Date(
      currentTime.getTime() + task.durationMinutes * 60000
    )

    return updatedTask
  })
}

/**
 * Calculate the visible time range for the timeline
 * Includes all tasks plus a ±1 hour buffer
 */
export const getVisibleTimeRange = (
  tasks: Task[],
  draggingTask?: Task,
  dragPosition?: Date
): { start: Date; end: Date } => {
  if (tasks.length === 0) {
    // Default range: 8 AM to 8 PM
    const start = new Date()
    start.setHours(8, 0, 0, 0)
    const end = new Date()
    end.setHours(20, 0, 0, 0)
    return { start, end }
  }

  // Find earliest and latest times
  let earliest = tasks[0].startTime
  let latest = new Date(
    tasks[tasks.length - 1].startTime.getTime() +
      tasks[tasks.length - 1].durationMinutes * 60000
  )

  // If dragging, expand range if needed
  if (draggingTask && dragPosition) {
    if (dragPosition < earliest) {
      earliest = dragPosition
    }
    const dragEnd = new Date(
      dragPosition.getTime() + draggingTask.durationMinutes * 60000
    )
    if (dragEnd > latest) {
      latest = dragEnd
    }
  }

  // Add ±1 hour buffer
  const start = new Date(earliest.getTime() - 60 * 60000)
  const end = new Date(latest.getTime() + 60 * 60000)

  return { start, end }
}

/**
 * Format time as "8:00 AM" or "2:30 PM"
 */
export const formatTime = (date: Date): string => {
  let hours = date.getHours()
  const minutes = date.getMinutes()
  const ampm = hours >= 12 ? 'PM' : 'AM'

  hours = hours % 12
  hours = hours || 12 // Convert 0 to 12

  const minutesStr = minutes.toString().padStart(2, '0')

  return `${hours}:${minutesStr} ${ampm}`
}

/**
 * Format duration as "30m", "1h", "1h 30m"
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}m`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (remainingMinutes === 0) {
    return `${hours}h`
  }

  return `${hours}h ${remainingMinutes}m`
}

/**
 * Generate array of hourly time labels for timeline
 */
export const generateTimeLabels = (start: Date, end: Date): Date[] => {
  const labels: Date[] = []
  const current = new Date(start)

  // Round to nearest hour
  current.setMinutes(0, 0, 0)

  while (current <= end) {
    labels.push(new Date(current))
    current.setHours(current.getHours() + 1)
  }

  return labels
}
