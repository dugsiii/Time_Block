import { create } from 'zustand'
import { Task, TaskStore } from '../types'
import {
  saveTasksToStorage,
  loadTasksFromStorage,
} from '../utils/storage'
import { dateKeyToDate } from '../utils/date'
import { recalculateTaskTimes, findNextAvailableSlot } from '../utils/timeCalculations'
import {
  executeSwap,
  executePush,
  detectOverlaps,
  reorderTasks,
  moveTaskToEnd,
} from '../utils/dragLogic'
import { taskColors } from '../theme/theme'

/**
 * Zustand store for task management
 * Automatically syncs with localStorage on every update
 */
export const useTaskStore = create<TaskStore>((set, get) => ({
  // Initial state
  ...loadTasksFromStorage(),
  dragConfig: {
    swapThreshold: 0.5, // 50% into target task triggers SWAP
  },

  // Date navigation
  setSelectedDateKey: (dateKey) => {
    set({ selectedDateKey: dateKey })
    saveTasksToStorage(get().tasksByDate, dateKey)
  },

  // CRUD Operations

  /**
   * Add a new task
   */
  addTask: (taskData) => {
    const { selectedDateKey, tasksByDate } = get()
    const currentTasks = tasksByDate[selectedDateKey] ?? []
    const currentTaskCount = currentTasks.length
    const newTask: Task = {
      ...taskData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      order: currentTaskCount, // Add at end
      color: taskColors[currentTaskCount % taskColors.length], // Assign color based on current count
    }

    const baseDate = dateKeyToDate(selectedDateKey)
    const updatedTasks = recalculateTaskTimes([...currentTasks, newTask], baseDate)
    const tasksWithOverlaps = detectOverlaps(updatedTasks)

    const nextTasksByDate = { ...tasksByDate, [selectedDateKey]: tasksWithOverlaps }
    set({ tasksByDate: nextTasksByDate })
    saveTasksToStorage(nextTasksByDate, selectedDateKey)
  },

  /**
   * Update an existing task
   */
  updateTask: (id, updates) => {
    const { selectedDateKey, tasksByDate } = get()
    const currentTasks = tasksByDate[selectedDateKey] ?? []
    const updatedTasks = currentTasks.map((task) =>
      task.id === id ? { ...task, ...updates } : task
    )

    const baseDate = dateKeyToDate(selectedDateKey)
    const recalculated = recalculateTaskTimes(updatedTasks, baseDate)
    const tasksWithOverlaps = detectOverlaps(recalculated)

    const nextTasksByDate = { ...tasksByDate, [selectedDateKey]: tasksWithOverlaps }
    set({ tasksByDate: nextTasksByDate })
    saveTasksToStorage(nextTasksByDate, selectedDateKey)
  },

  /**
   * Delete a task
   */
  deleteTask: (id) => {
    const { selectedDateKey, tasksByDate } = get()
    const currentTasks = tasksByDate[selectedDateKey] ?? []
    const filtered = currentTasks.filter((task) => task.id !== id)
    const reordered = reorderTasks(filtered)
    const baseDate = dateKeyToDate(selectedDateKey)
    const recalculated = recalculateTaskTimes(reordered, baseDate)
    const tasksWithOverlaps = detectOverlaps(recalculated)

    const nextTasksByDate = { ...tasksByDate, [selectedDateKey]: tasksWithOverlaps }
    set({ tasksByDate: nextTasksByDate })
    saveTasksToStorage(nextTasksByDate, selectedDateKey)
  },

  // Task Operations

  /**
   * Insert a new task - finds the next available slot that respects locked tasks
   * The afterTaskId parameter is now used as a hint, but the actual insertion
   * position is calculated based on available slots
   */
  insertTask: (_afterTaskId, taskData) => {
    const { selectedDateKey, tasksByDate } = get()
    const currentTasks = tasksByDate[selectedDateKey] ?? []
    const currentTaskCount = currentTasks.length

    const baseDate = dateKeyToDate(selectedDateKey)

    // Find the next available slot for the new task
    const { slotStart, insertAfterTaskId } = findNextAvailableSlot(
      currentTasks,
      taskData.durationMinutes,
      baseDate,
      _afterTaskId
    )

    const newTask: Task = {
      ...taskData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      order: 0, // Will be recalculated
      startTime: slotStart, // Set to the found slot
      color: taskColors[currentTaskCount % taskColors.length],
      isNew: true, // Flag for highlighting - will be removed after render
    } as Task & { isNew?: boolean }

    let updatedTasks: Task[]

    if (insertAfterTaskId === null) {
      // Insert at beginning
      updatedTasks = [newTask, ...currentTasks]
    } else {
      // Insert after the task that ends before the slot
      const afterIndex = currentTasks.findIndex((t) => t.id === insertAfterTaskId)
      if (afterIndex >= 0) {
        updatedTasks = [...currentTasks]
        updatedTasks.splice(afterIndex + 1, 0, newTask)
      } else {
        // Fallback: add at end
        updatedTasks = [...currentTasks, newTask]
      }
    }

    const reordered = reorderTasks(updatedTasks)
    const recalculated = recalculateTaskTimes(reordered, baseDate)
    const tasksWithOverlaps = detectOverlaps(recalculated)

    const nextTasksByDate = { ...tasksByDate, [selectedDateKey]: tasksWithOverlaps }
    set({ tasksByDate: nextTasksByDate })
    saveTasksToStorage(nextTasksByDate, selectedDateKey)

    // Return the new task ID for highlighting
    return newTask.id
  },

  /**
   * Swap two tasks (exchange positions)
   */
  swapTasks: (taskId1, taskId2) => {
    const { selectedDateKey, tasksByDate } = get()
    const currentTasks = tasksByDate[selectedDateKey] ?? []
    const baseDate = dateKeyToDate(selectedDateKey)
    const result = executeSwap(currentTasks, taskId1, taskId2, baseDate)

    if (result) {
      const tasksWithOverlaps = detectOverlaps(result)
      const nextTasksByDate = { ...tasksByDate, [selectedDateKey]: tasksWithOverlaps }
      set({ tasksByDate: nextTasksByDate })
      saveTasksToStorage(nextTasksByDate, selectedDateKey)
    }
    // If result is null, operation failed (e.g., locked task) - do nothing
  },

  /**
   * Push task to target position (dragged task takes target's spot)
   */
  pushTask: (draggedTaskId, targetTaskId) => {
    const { selectedDateKey, tasksByDate } = get()
    const currentTasks = tasksByDate[selectedDateKey] ?? []
    const baseDate = dateKeyToDate(selectedDateKey)
    const result = executePush(currentTasks, draggedTaskId, targetTaskId, baseDate)

    if (result) {
      const tasksWithOverlaps = detectOverlaps(result)
      const nextTasksByDate = { ...tasksByDate, [selectedDateKey]: tasksWithOverlaps }
      set({ tasksByDate: nextTasksByDate })
      saveTasksToStorage(nextTasksByDate, selectedDateKey)
    }
    // If result is null, operation failed (e.g., locked conflict) - do nothing
  },

  /**
   * Move task to the end of the list (useful for moving past locked tasks)
   */
  moveToEnd: (taskId) => {
    const { selectedDateKey, tasksByDate } = get()
    const currentTasks = tasksByDate[selectedDateKey] ?? []
    const baseDate = dateKeyToDate(selectedDateKey)
    const result = moveTaskToEnd(currentTasks, taskId, baseDate)

    if (result) {
      const tasksWithOverlaps = detectOverlaps(result)
      const nextTasksByDate = { ...tasksByDate, [selectedDateKey]: tasksWithOverlaps }
      set({ tasksByDate: nextTasksByDate })
      saveTasksToStorage(nextTasksByDate, selectedDateKey)
    }
  },

  // State Management

  /**
   * Toggle lock state of a task
   */
  toggleLock: (taskId) => {
    const { selectedDateKey, tasksByDate } = get()
    const currentTasks = tasksByDate[selectedDateKey] ?? []
    const updatedTasks = currentTasks.map((task) =>
      task.id === taskId ? { ...task, isLocked: !task.isLocked } : task
    )

    const nextTasksByDate = { ...tasksByDate, [selectedDateKey]: updatedTasks }
    set({ tasksByDate: nextTasksByDate })
    saveTasksToStorage(nextTasksByDate, selectedDateKey)
  },

  /**
   * Set swap threshold (for SWAP vs PUSH determination)
   */
  setSwapThreshold: (threshold) => {
    set({
      dragConfig: {
        swapThreshold: Math.max(0, Math.min(1, threshold)), // Clamp 0-1
      },
    })
  },
}))
