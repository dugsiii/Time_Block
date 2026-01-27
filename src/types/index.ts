/**
 * Core task interface for time blocking
 */
export interface Task {
  id: string // Unique identifier (crypto.randomUUID())
  title: string // User-entered task name (required)
  durationMinutes: number // Task duration (5, 15, 30, 60, 90, etc.)
  startTime: Date // Calculated start time (NOT optional)
  isLocked: boolean // Lock state (prevents movement)
  order: number // Position in task list (for sorting)
  isOverlapping: boolean // Flagged when overlapping with locked tasks
  createdAt: Date // Metadata for sorting
  color: string // Background color (assigned on creation, persists through reordering)
  isNew?: boolean // Temporary flag for highlighting newly created tasks
}

/**
 * Configuration for drag-and-drop behavior
 */
export interface DragConfig {
  swapThreshold: number // 0.0 to 1.0 (e.g., 0.5 = 50% into target task)
}

/**
 * Application state interface
 */
export interface AppState {
  selectedDateKey: string
  tasksByDate: Record<string, Task[]>
  dragConfig: DragConfig
}

/**
 * Drag preview state for real-time visual feedback
 */
export interface DragPreview {
  action: 'SWAP' | 'PUSH' | 'NONE'
  affectedTasks: Array<{
    taskId: string
    previewPosition: Date
  }>
  focusedTime: Date
}

/**
 * Zustand store interface
 */
export interface TaskStore extends AppState {
  // Date navigation
  setSelectedDateKey: (dateKey: string) => void

  // CRUD operations
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'color'>) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void

  // Task operations
  insertTask: (
    afterTaskId: string | null,
    task: Omit<Task, 'id' | 'createdAt' | 'order' | 'color'>
  ) => void
  swapTasks: (taskId1: string, taskId2: string) => void
  pushTask: (draggedTaskId: string, targetTaskId: string) => void
  moveToEnd: (taskId: string) => void

  // State management
  toggleLock: (taskId: string) => void
  setSwapThreshold: (threshold: number) => void
}
