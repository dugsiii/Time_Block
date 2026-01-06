import { Task } from '../types'
import { recalculateTaskTimes } from './timeCalculations'

/**
 * Determine drag action based on drop position
 */
export const getDragAction = (
  draggedTask: Task,
  targetTask: Task | null,
  dropPosition: { y: number },
  targetBounds: { top: number; height: number },
  swapThreshold: number
): 'SWAP' | 'PUSH' | 'NONE' => {
  if (!targetTask) return 'NONE'
  if (targetTask.isLocked) return 'NONE' // Can't interact with locked tasks
  if (draggedTask.id === targetTask.id) return 'NONE' // Can't drag onto self

  // Calculate how far into target task we are (0.0 to 1.0)
  const relativePosition =
    (dropPosition.y - targetBounds.top) / targetBounds.height

  // If past threshold, it's a SWAP
  if (relativePosition >= swapThreshold) {
    return 'SWAP'
  }

  // Otherwise it's a PUSH
  return 'PUSH'
}

/**
 * Execute SWAP operation - exchange positions of two tasks
 * Returns updated task list or null if operation fails
 */
export const executeSwap = (
  tasks: Task[],
  taskId1: string,
  taskId2: string
): Task[] | null => {
  const task1 = tasks.find((t) => t.id === taskId1)
  const task2 = tasks.find((t) => t.id === taskId2)

  if (!task1 || !task2) return null
  if (task1.isLocked || task2.isLocked) return null // Swap fails with locked tasks

  // Swap order values
  const newTasks = tasks.map((task) => {
    if (task.id === taskId1) {
      return { ...task, order: task2.order }
    }
    if (task.id === taskId2) {
      return { ...task, order: task1.order }
    }
    return task
  })

  // Recalculate times based on new order
  return recalculateTaskTimes(newTasks)
}

/**
 * Execute PUSH operation - dragged task takes target's position, pushing others down
 * Returns updated task list or null if operation fails
 */
export const executePush = (
  tasks: Task[],
  draggedTaskId: string,
  targetTaskId: string
): Task[] | null => {
  const draggedTask = tasks.find((t) => t.id === draggedTaskId)
  const targetTask = tasks.find((t) => t.id === targetTaskId)

  if (!draggedTask || !targetTask) return null
  if (targetTask.isLocked) return null // Can't push into locked task

  // Get the target task's current start time
  const newStartTime = targetTask.startTime

  // Check if push would conflict with locked tasks
  const conflictsWithLocked = checkLockedConflict(
    tasks,
    draggedTask,
    newStartTime,
    targetTaskId
  )
  if (conflictsWithLocked) return null // Snap back

  // Reorder tasks: dragged task takes target's position
  const draggedOrder = draggedTask.order
  const targetOrder = targetTask.order

  const reorderedTasks = tasks.map((task) => {
    if (task.id === draggedTaskId) {
      // Dragged task takes target's order
      return { ...task, order: targetOrder }
    } else if (
      draggedOrder < targetOrder &&
      task.order > draggedOrder &&
      task.order <= targetOrder
    ) {
      // Tasks between dragged and target shift up
      return { ...task, order: task.order - 1 }
    } else if (
      draggedOrder > targetOrder &&
      task.order >= targetOrder &&
      task.order < draggedOrder
    ) {
      // Tasks between target and dragged shift down
      return { ...task, order: task.order + 1 }
    }
    return task
  })

  // Recalculate times based on new order
  return recalculateTaskTimes(reorderedTasks)
}

/**
 * Check if a new position would conflict with locked tasks
 */
export const checkLockedConflict = (
  tasks: Task[],
  draggedTask: Task,
  newStartTime: Date,
  targetTaskId: string
): boolean => {
  const draggedEnd = new Date(
    newStartTime.getTime() + draggedTask.durationMinutes * 60000
  )

  // Check if any locked task (except target) would need to move
  return tasks.some((task) => {
    if (
      !task.isLocked ||
      task.id === draggedTask.id ||
      task.id === targetTaskId
    ) {
      return false
    }

    const taskEnd = new Date(
      task.startTime.getTime() + task.durationMinutes * 60000
    )

    // Check for overlap with the new position
    return newStartTime < taskEnd && draggedEnd > task.startTime
  })
}

/**
 * Detect overlapping tasks
 * Returns tasks with isOverlapping flag updated
 */
export const detectOverlaps = (tasks: Task[]): Task[] => {
  return tasks.map((task) => {
    const taskEnd = new Date(
      task.startTime.getTime() + task.durationMinutes * 60000
    )

    const hasOverlap = tasks.some((other) => {
      if (other.id === task.id) return false

      const otherEnd = new Date(
        other.startTime.getTime() + other.durationMinutes * 60000
      )

      return task.startTime < otherEnd && taskEnd > other.startTime
    })

    return { ...task, isOverlapping: hasOverlap }
  })
}

/**
 * Helper to reorder tasks after insertion
 */
export const reorderTasks = (tasks: Task[]): Task[] => {
  return tasks.map((task, index) => ({ ...task, order: index }))
}

/**
 * Move a task to the end of the task list
 * This allows moving tasks below locked tasks when there's no drop target after them
 */
export const moveTaskToEnd = (
  tasks: Task[],
  draggedTaskId: string
): Task[] | null => {
  const draggedTask = tasks.find((t) => t.id === draggedTaskId)

  if (!draggedTask) return null
  if (draggedTask.isLocked) return null // Can't move locked tasks

  // Get the current max order
  const maxOrder = Math.max(...tasks.map((t) => t.order))

  // If task is already at the end, no change needed
  if (draggedTask.order === maxOrder) return null

  // Move dragged task to end, shift other tasks up
  const draggedOrder = draggedTask.order

  const reorderedTasks = tasks.map((task) => {
    if (task.id === draggedTaskId) {
      // Dragged task goes to the end
      return { ...task, order: maxOrder }
    } else if (task.order > draggedOrder) {
      // Tasks after the dragged task shift up by 1
      return { ...task, order: task.order - 1 }
    }
    return task
  })

  // Recalculate times based on new order
  return recalculateTaskTimes(reorderedTasks)
}