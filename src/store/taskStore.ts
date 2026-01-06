import { create } from 'zustand'
import { Task, TaskStore } from '../types'
import {
  saveTasksToStorage,
  loadTasksFromStorage,
} from '../utils/storage'
import { recalculateTaskTimes } from '../utils/timeCalculations'
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
  tasks: loadTasksFromStorage(),
  dragConfig: {
    swapThreshold: 0.5, // 50% into target task triggers SWAP
  },

  // CRUD Operations

  /**
   * Add a new task
   */
  addTask: (taskData) => {
    const currentTaskCount = get().tasks.length
    const newTask: Task = {
      ...taskData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      order: currentTaskCount, // Add at end
      color: taskColors[currentTaskCount % taskColors.length], // Assign color based on current count
    }

    const updatedTasks = recalculateTaskTimes([...get().tasks, newTask])
    const tasksWithOverlaps = detectOverlaps(updatedTasks)

    set({ tasks: tasksWithOverlaps })
    saveTasksToStorage(tasksWithOverlaps)
  },

  /**
   * Update an existing task
   */
  updateTask: (id, updates) => {
    const updatedTasks = get().tasks.map((task) =>
      task.id === id ? { ...task, ...updates } : task
    )

    const recalculated = recalculateTaskTimes(updatedTasks)
    const tasksWithOverlaps = detectOverlaps(recalculated)

    set({ tasks: tasksWithOverlaps })
    saveTasksToStorage(tasksWithOverlaps)
  },

  /**
   * Delete a task
   */
  deleteTask: (id) => {
    const filtered = get().tasks.filter((task) => task.id !== id)
    const reordered = reorderTasks(filtered)
    const recalculated = recalculateTaskTimes(reordered)
    const tasksWithOverlaps = detectOverlaps(recalculated)

    set({ tasks: tasksWithOverlaps })
    saveTasksToStorage(tasksWithOverlaps)
  },

  // Task Operations

  /**
   * Insert a new task after a specific task (or at beginning if null)
   */
  insertTask: (afterTaskId, taskData) => {
    const currentTaskCount = get().tasks.length
    const newTask: Task = {
      ...taskData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      order: 0, // Will be recalculated
      startTime: new Date(), // Will be recalculated
      color: taskColors[currentTaskCount % taskColors.length], // Assign color based on current count
    }

    let updatedTasks: Task[]

    if (afterTaskId === null) {
      // Insert at beginning
      updatedTasks = [newTask, ...get().tasks]
    } else {
      // Insert after specific task
      const afterIndex = get().tasks.findIndex((t) => t.id === afterTaskId)
      updatedTasks = [...get().tasks]
      updatedTasks.splice(afterIndex + 1, 0, newTask)
    }

    const reordered = reorderTasks(updatedTasks)
    const recalculated = recalculateTaskTimes(reordered)
    const tasksWithOverlaps = detectOverlaps(recalculated)

    set({ tasks: tasksWithOverlaps })
    saveTasksToStorage(tasksWithOverlaps)
  },

  /**
   * Swap two tasks (exchange positions)
   */
  swapTasks: (taskId1, taskId2) => {
    const result = executeSwap(get().tasks, taskId1, taskId2)

    if (result) {
      const tasksWithOverlaps = detectOverlaps(result)
      set({ tasks: tasksWithOverlaps })
      saveTasksToStorage(tasksWithOverlaps)
    }
    // If result is null, operation failed (e.g., locked task) - do nothing
  },

  /**
   * Push task to target position (dragged task takes target's spot)
   */
  pushTask: (draggedTaskId, targetTaskId) => {
    const result = executePush(get().tasks, draggedTaskId, targetTaskId)

    if (result) {
      const tasksWithOverlaps = detectOverlaps(result)
      set({ tasks: tasksWithOverlaps })
      saveTasksToStorage(tasksWithOverlaps)
    }
    // If result is null, operation failed (e.g., locked conflict) - do nothing
  },

  /**
   * Move task to the end of the list (useful for moving past locked tasks)
   */
  moveToEnd: (taskId) => {
    const result = moveTaskToEnd(get().tasks, taskId)

    if (result) {
      const tasksWithOverlaps = detectOverlaps(result)
      set({ tasks: tasksWithOverlaps })
      saveTasksToStorage(tasksWithOverlaps)
    }
  },

  // State Management

  /**
   * Toggle lock state of a task
   */
  toggleLock: (taskId) => {
    const updatedTasks = get().tasks.map((task) =>
      task.id === taskId ? { ...task, isLocked: !task.isLocked } : task
    )

    set({ tasks: updatedTasks })
    saveTasksToStorage(updatedTasks)
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
