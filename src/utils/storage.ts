import { Task } from '../types'

const STORAGE_KEY = 'time-block-app-tasks'

/**
 * Save tasks to localStorage
 * Handles Date serialization by converting to ISO strings
 */
export const saveTasksToStorage = (tasks: Task[]): void => {
  try {
    const serialized = JSON.stringify(tasks, (key, value) => {
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
 */
export const loadTasksFromStorage = (): Task[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return []
    }

    const parsed = JSON.parse(stored, (key, value) => {
      // Convert ISO strings back to Date objects
      if (key === 'startTime' || key === 'createdAt') {
        return new Date(value)
      }
      return value
    })

    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error('Failed to load tasks from localStorage:', error)
    return []
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
