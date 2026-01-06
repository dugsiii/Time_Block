import { Box, Typography } from '@mui/material'
import { useState, useRef } from 'react'
import { useTaskStore } from '../store/taskStore'
import { TaskBlock } from './TaskBlock'
import { InsertionPoint } from './InsertionPoint'
import { InlineTaskForm } from './InlineTaskForm'
import { TimeLabel } from './TimeLabel'
import { EndZoneDropTarget } from './EndZoneDropTarget'
import { generateTimeLabels, getVisibleTimeRange } from '../utils/timeCalculations'
import { getDragAction } from '../utils/dragLogic'

/**
 * Timeline component - main container for the time blocking interface
 * Features:
 * - Displays all tasks with time labels
 * - Insertion points between tasks
 * - Handles task creation via inline forms
 * - Auto-calculates visible time range
 */
export const Timeline = () => {
  const tasks = useTaskStore((state) => state.tasks)
  const insertTask = useTaskStore((state) => state.insertTask)
  const deleteTask = useTaskStore((state) => state.deleteTask)
  const toggleLock = useTaskStore((state) => state.toggleLock)
  const swapTasks = useTaskStore((state) => state.swapTasks)
  const pushTask = useTaskStore((state) => state.pushTask)
  const moveToEnd = useTaskStore((state) => state.moveToEnd)
  const dragConfig = useTaskStore((state) => state.dragConfig)

  const [activeInsertionPoint, setActiveInsertionPoint] = useState<string | null>(null)
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null)
  const taskRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  // Calculate visible time range
  const { start, end } = getVisibleTimeRange(tasks)
  const timeLabels = generateTimeLabels(start, end)

  // Check if the last task is locked (for showing end zone drop target)
  const lastTask = tasks[tasks.length - 1]
  const hasLockedTaskAtEnd = lastTask?.isLocked ?? false

  const handleInsertTask = (afterTaskId: string | null, title: string, durationMinutes: number) => {
    insertTask(afterTaskId, {
      title,
      durationMinutes,
      isLocked: false,
      isOverlapping: false,
      startTime: new Date(), // Will be recalculated
    })
    setActiveInsertionPoint(null)
  }

  const handleCancelInsert = () => {
    setActiveInsertionPoint(null)
  }

  const handleDragStart = (taskId: string) => {
    setDraggingTaskId(taskId)
  }

  const handleDragEnd = () => {
    setDraggingTaskId(null)
  }

  const handleMoveToEnd = (taskId: string) => {
    console.log('Move to end:', taskId)
    moveToEnd(taskId)
    setDraggingTaskId(null)
  }

  const handleDrop = (draggedTaskId: string, targetTaskId: string, dropY: number) => {
    const draggedTask = tasks.find((t) => t.id === draggedTaskId)
    const targetTask = tasks.find((t) => t.id === targetTaskId)

    if (!draggedTask || !targetTask) return

    // Get target element bounds for calculating drop position
    const targetElement = taskRefs.current.get(targetTaskId)
    if (!targetElement) return

    const bounds = targetElement.getBoundingClientRect()
    const targetBounds = {
      top: bounds.top,
      height: bounds.height,
    }

    // Determine action (SWAP or PUSH)
    const action = getDragAction(
      draggedTask,
      targetTask,
      { y: dropY },
      targetBounds,
      dragConfig.swapThreshold
    )

    // Execute action
    if (action === 'SWAP') {
      console.log('SWAP:', draggedTask.title, '↔', targetTask.title)
      swapTasks(draggedTaskId, targetTaskId)
    } else if (action === 'PUSH') {
      console.log('PUSH:', draggedTask.title, '→', targetTask.title)
      pushTask(draggedTaskId, targetTaskId)
    }

    setDraggingTaskId(null)
  }

  return (
    <Box
      sx={{
        maxWidth: '650px',
        margin: '0 auto',
        padding: '24px 16px',
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ fontSize: '20px', fontWeight: 600, mb: 1 }}>
          Time Blocking App
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {tasks.length === 0 ? 'Click [+] to add your first task' : `${tasks.length} task${tasks.length === 1 ? '' : 's'} scheduled`}
        </Typography>
      </Box>

      {/* Timeline */}
      <Box>
        {/* Insertion point at the beginning */}
        <Box sx={{ display: 'flex', gap: 3 }}>
          {/* Empty space for time label alignment */}
          <Box sx={{ minWidth: '90px' }} />
          
          {/* Insertion point / form */}
          <Box sx={{ width: '400px' }}>
            {activeInsertionPoint === 'start' ? (
              <InlineTaskForm
                onSubmit={(title, duration) => handleInsertTask(null, title, duration)}
                onCancel={handleCancelInsert}
              />
            ) : (
              <InsertionPoint
                onClick={() => setActiveInsertionPoint('start')}
                isActive={activeInsertionPoint === 'start'}
              />
            )}
          </Box>
        </Box>

        {/* Tasks with time labels */}
        {tasks.length === 0 ? (
          <Box
            sx={{
              p: 4,
              textAlign: 'center',
              backgroundColor: '#FAFAFA',
              borderRadius: '8px',
              border: '1px solid #E0E0E0',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              No tasks yet. Click the [+] button above to get started!
            </Typography>
          </Box>
        ) : (
          tasks.map((task, index) => (
            <Box key={task.id}>
              {/* Task row with time label on left */}
              <Box 
                sx={{ 
                  display: 'flex', 
                  gap: 3, 
                  alignItems: 'flex-start',
                  // Smooth transition when tasks shift
                  transition: 'transform 250ms ease-out, margin 250ms ease-out',
                }}
              >
                {/* Time label (left side) */}
                <Box sx={{ minWidth: '90px', pt: '16px', textAlign: 'right' }}>
                  <TimeLabel time={task.startTime} />
                </Box>

                {/* Task block (centered) */}
                <Box
                  ref={(el) => {
                    if (el) {
                      taskRefs.current.set(task.id, el as any)
                    } else {
                      taskRefs.current.delete(task.id)
                    }
                  }}
                  sx={{ width: '400px' }}
                >
                  <TaskBlock
                    task={task}
                    index={index}
                    onToggleLock={toggleLock}
                    onDelete={deleteTask}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onDrop={handleDrop}
                    isDragging={draggingTaskId === task.id}
                  />
                </Box>
              </Box>

              {/* Insertion point AFTER this task */}
              <Box sx={{ display: 'flex', gap: 3 }}>
                {/* Empty space for time label alignment */}
                <Box sx={{ minWidth: '90px' }} />
                
                {/* Insertion point / form */}
                <Box sx={{ width: '400px' }}>
                  {activeInsertionPoint === task.id ? (
                    <InlineTaskForm
                      onSubmit={(title, duration) => handleInsertTask(task.id, title, duration)}
                      onCancel={handleCancelInsert}
                    />
                  ) : (
                    <InsertionPoint
                      onClick={() => setActiveInsertionPoint(task.id)}
                      isActive={activeInsertionPoint === task.id}
                    />
                  )}
                </Box>
              </Box>
            </Box>
          ))
        )}

        {/* End zone drop target - shown when dragging, especially useful when last task is locked */}
        {tasks.length > 0 && (
          <EndZoneDropTarget
            onDrop={handleMoveToEnd}
            hasLockedTaskAtEnd={hasLockedTaskAtEnd}
          />
        )}
      </Box>

      {/* Info text at bottom */}
      {tasks.length > 0 && (
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '12px' }}>
            Tip: Create tasks with [+] at top, then drag to reorder
          </Typography>
        </Box>
      )}
    </Box>
  )
}
