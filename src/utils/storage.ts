import { Task } from '../types'
import { taskColors } from '../theme/theme'
import { getLocalDateKey } from './date'

const STORAGE_KEY = 'time-block-app-tasks'

interface StoredStateV2 {
  version: 2
  selectedDateKey: string
  tasksByDate: Record<string, Task[]>
}

/**
 * Save tasks to localStorage
 * Handles Date serialization by converting to ISO strings
 * Removes temporary fields like `isNew` before saving
 */
export const saveTasksToStorage = (
  tasksByDate: Record<string, Task[]>,
  selectedDateKey: string
): void => {
  try {
    const cleanedByDate: Record<string, Task[]> = Object.fromEntries(
      Object.entries(tasksByDate).map(([dateKey, tasks]) => [
        dateKey,
        tasks.map(({ isNew: _isNew, ...task }) => task),
      ])
    )

    const payload: StoredStateV2 = {
      version: 2,
      selectedDateKey,
      tasksByDate: cleanedByDate,
    }

    const serialized = JSON.stringify(payload, (_key, value) => {
      // Convert Date objects to ISO strings for storage
      if (value instanceof Date) {
        return value.toISOString()
      }
      return value
    })
    localStorage.setItem(STORAGE_KEY, serialized)
  } catch (error) {
    console.error('Failed to save tasks to localStorage:', error)
  }
}

/**
 * Load tasks from localStorage
 * Handles Date deserialization by converting ISO strings back to Date objects
 * Also migrates old tasks to include color field if missing
 */
export const loadTasksFromStorage = (): {
  selectedDateKey: string
  tasksByDate: Record<string, Task[]>
} => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      const todayKey = getLocalDateKey(new Date())
      return { selectedDateKey: todayKey, tasksByDate: {} }
    }

    const parsed = JSON.parse(stored, (key, value) => {
      // Convert ISO strings back to Date objects
      if (key === 'startTime' || key === 'createdAt') {
        return new Date(value)
      }
      return value
    })

    const todayKey = getLocalDateKey(new Date())

    // V2 format
    if (parsed && typeof parsed === 'object' && parsed.version === 2) {
      const selectedDateKey =
        typeof parsed.selectedDateKey === 'string' ? parsed.selectedDateKey : todayKey
      const tasksByDate = (parsed.tasksByDate ?? {}) as Record<string, Task[]>

      // Migration: ensure every task has color
      const migratedByDate: Record<string, Task[]> = Object.fromEntries(
        Object.entries(tasksByDate).map(([dateKey, tasks]) => [
          dateKey,
          (Array.isArray(tasks) ? tasks : []).map((task, index) => {
            if (!task.color) {
              return {
                ...task,
                color: taskColors[index % taskColors.length],
              }
            }
            return task
          }),
        ])
      )

      return { selectedDateKey, tasksByDate: migratedByDate }
    }

    // Legacy format (v1): array of tasks
    if (Array.isArray(parsed)) {
      const migratedTasks = parsed.map((task, index) => {
        if (!task.color) {
          return {
            ...task,
            color: taskColors[index % taskColors.length],
          }
        }
        return task
      })

      return {
        selectedDateKey: todayKey,
        tasksByDate: { [todayKey]: migratedTasks },
      }
    }

    return { selectedDateKey: todayKey, tasksByDate: {} }
  } catch (error) {
    console.error('Failed to load tasks from localStorage:', error)
    const todayKey = getLocalDateKey(new Date())
    return { selectedDateKey: todayKey, tasksByDate: {} }
  }
}

/**
 * Clear all tasks from localStorage (useful for testing/reset)
 */
export const clearStorage = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Failed to clear localStorage:', error)
  }
}
