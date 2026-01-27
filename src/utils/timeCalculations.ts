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
 * Round duration up to the nearest 15 minutes
 * Examples: 1 → 15, 15 → 15, 16 → 30, 45 → 45, 50 → 60
 */
export const roundDurationUp = (minutes: number): number => {
  if (minutes <= 0) return 15 // Minimum 15 minutes
  const remainder = minutes % 15
  if (remainder === 0) return minutes
  return minutes + (15 - remainder)
}

/**
 * Recalculate all task start times based on their order
 * RESPECTS LOCKED TASKS - they keep their start times
 * Unlocked tasks are scheduled around locked tasks
 */
export const recalculateTaskTimes = (tasks: Task[], baseDate: Date = new Date()): Task[] => {
  // Sort by order
  const sorted = [...tasks].sort((a, b) => a.order - b.order)

  // Get all locked tasks with their fixed times
  const lockedTasks = sorted.filter((t) => t.isLocked)

  // If no tasks, return empty
  if (sorted.length === 0) return []

  // Start at 8:00 AM
  const startOfDay = new Date(baseDate)
  startOfDay.setHours(8, 0, 0, 0)

  let currentTime = new Date(startOfDay)

  return sorted.map((task) => {
    // If task is locked, keep its original time
    if (task.isLocked) {
      // Update currentTime to after this locked task
      const taskEnd = new Date(
        task.startTime.getTime() + task.durationMinutes * 60000
      )
      if (taskEnd > currentTime) {
        currentTime = new Date(taskEnd)
      }
      return task
    }

    // For unlocked tasks, find the next available slot
    // Check if current slot overlaps with any locked task
    let proposedStart = new Date(currentTime)
    let foundSlot = false

    while (!foundSlot) {
      const proposedEnd = new Date(
        proposedStart.getTime() + task.durationMinutes * 60000
      )

      // Check for conflicts with locked tasks
      const hasConflict = lockedTasks.some((locked) => {
        const lockedEnd = new Date(
          locked.startTime.getTime() + locked.durationMinutes * 60000
        )
        // Check overlap: (start1 < end2) && (end1 > start2)
        return proposedStart < lockedEnd && proposedEnd > locked.startTime
      })

      if (hasConflict) {
        // Find the end of the conflicting locked task and try after it
        const conflictingLocked = lockedTasks.find((locked) => {
          const lockedEnd = new Date(
            locked.startTime.getTime() + locked.durationMinutes * 60000
          )
          return proposedStart < lockedEnd && proposedEnd > locked.startTime
        })
        if (conflictingLocked) {
          proposedStart = new Date(
            conflictingLocked.startTime.getTime() +
              conflictingLocked.durationMinutes * 60000
          )
        }
      } else {
        foundSlot = true
      }
    }

    const updatedTask = {
      ...task,
      startTime: new Date(proposedStart),
    }

    // Move current time forward
    currentTime = new Date(
      proposedStart.getTime() + task.durationMinutes * 60000
    )

    return updatedTask
  })
}

/**
 * Find the next available time slot for a new task
 * Respects locked tasks by not overlapping with them
 */
export const findNextAvailableSlot = (
  tasks: Task[],
  durationMinutes: number,
  baseDate: Date = new Date(),
  afterTaskId: string | null = null
): { slotStart: Date; insertAfterTaskId: string | null } => {
  // Start at 8:00 AM
  const startOfDay = new Date(baseDate)
  startOfDay.setHours(8, 0, 0, 0)

  if (tasks.length === 0) {
    return { slotStart: startOfDay, insertAfterTaskId: null }
  }

  // Sort tasks by start time
  const sortedByTime = [...tasks].sort(
    (a, b) => a.startTime.getTime() - b.startTime.getTime()
  )

  // Get locked tasks for conflict checking
  const lockedTasks = tasks.filter((t) => t.isLocked)

  // Try to find a slot starting from the hinted insertion point
  // If afterTaskId is provided, start right after that task's end time.
  let proposedStart = new Date(startOfDay)
  if (afterTaskId) {
    const hintTask = tasks.find((t) => t.id === afterTaskId)
    if (hintTask) {
      proposedStart = new Date(
        hintTask.startTime.getTime() + hintTask.durationMinutes * 60000
      )
    }
  }
  const endOfDay = new Date(baseDate)
  endOfDay.setHours(23, 59, 0, 0)

  while (proposedStart < endOfDay) {
    const proposedEnd = new Date(
      proposedStart.getTime() + durationMinutes * 60000
    )

    // Check for conflicts with locked tasks only
    const hasLockedConflict = lockedTasks.some((locked) => {
      const lockedEnd = new Date(
        locked.startTime.getTime() + locked.durationMinutes * 60000
      )
      return proposedStart < lockedEnd && proposedEnd > locked.startTime
    })

    if (!hasLockedConflict) {
      // Found a valid slot! Now find which task to insert after
      // Find the task that ends right before or at this slot
      let insertAfterTaskId: string | null = null

      for (let i = sortedByTime.length - 1; i >= 0; i--) {
        const task = sortedByTime[i]
        const taskEnd = new Date(
          task.startTime.getTime() + task.durationMinutes * 60000
        )
        if (taskEnd <= proposedStart) {
          insertAfterTaskId = task.id
          break
        }
      }

      // If caller provided a hint and we started after it, preserve it when possible.
      if (afterTaskId && insertAfterTaskId === null) {
        insertAfterTaskId = afterTaskId
      }

      // If slot is before all tasks, insert at beginning
      if (!insertAfterTaskId && proposedStart < sortedByTime[0].startTime) {
        insertAfterTaskId = null
      }

      return { slotStart: proposedStart, insertAfterTaskId }
    }

    // Move to after the conflicting locked task
    const conflictingLocked = lockedTasks.find((locked) => {
      const lockedEnd = new Date(
        locked.startTime.getTime() + locked.durationMinutes * 60000
      )
      return proposedStart < lockedEnd && proposedEnd > locked.startTime
    })

    if (conflictingLocked) {
      proposedStart = new Date(
        conflictingLocked.startTime.getTime() +
          conflictingLocked.durationMinutes * 60000
      )
    } else {
      // Move forward by 15 minutes if no specific conflict found
      proposedStart = new Date(proposedStart.getTime() + 15 * 60000)
    }
  }

  // If no slot found during the day, add after the last task
  const lastTask = sortedByTime[sortedByTime.length - 1]
  const lastTaskEnd = new Date(
    lastTask.startTime.getTime() + lastTask.durationMinutes * 60000
  )

  return { slotStart: lastTaskEnd, insertAfterTaskId: lastTask.id }
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
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    console.error('formatTime: Invalid date provided', date)
    return 'Invalid Time'
  }
  
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
