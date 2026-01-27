import { Box, IconButton, Typography } from '@mui/material'
import { useState, useRef } from 'react'
import { useTaskStore } from '../store/taskStore'
import { TaskBlock } from './TaskBlock'
import { InsertionPoint } from './InsertionPoint'
import { InlineTaskForm } from './InlineTaskForm'
import { TimeLabel } from './TimeLabel'
import { EndZoneDropTarget } from './EndZoneDropTarget'
import { getDragAction } from '../utils/dragLogic'
import AddIcon from '@mui/icons-material/Add'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { addDays, dateKeyToDate, getLocalDateKey } from '../utils/date'

/**
 * Timeline component - main container for the time blocking interface
 * Features:
 * - Displays all tasks with time labels
 * - Insertion points between tasks
 * - Handles task creation via inline forms
 * - Auto-calculates visible time range
 */
export const Timeline = () => {
  const selectedDateKey = useTaskStore((state) => state.selectedDateKey)
  const tasksByDate = useTaskStore((state) => state.tasksByDate)
  const setSelectedDateKey = useTaskStore((state) => state.setSelectedDateKey)
  const tasks = tasksByDate[selectedDateKey] ?? []
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

  // Check if the last task is locked (for showing end zone drop target)
  const lastTask = tasks[tasks.length - 1]
  const hasLockedTaskAtEnd = lastTask?.isLocked ?? false

  const handleInsertTask = (afterTaskId: string | null, title: string, durationMinutes: number) => {
    // If afterTaskId is provided, we want to insert BEFORE that task
    // So we need to find the previous task or null if it's the first task
    const targetIndex = tasks.findIndex(t => t.id === afterTaskId)
    const previousTaskId = targetIndex > 0 ? tasks[targetIndex - 1].id : null
    
    insertTask(previousTaskId, {
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

  const selectedDate = dateKeyToDate(selectedDateKey)
  const todayKey = getLocalDateKey(new Date())
  const isToday = selectedDateKey === todayKey
  const dateLabel = selectedDate.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })

  return (
    <Box
      sx={{
        position: 'relative',
        py: { xs: 3, sm: 5 },
        '--time-col-width': '110px',
        '--timeline-gap': '24px',
        '--task-col-max': '560px',
      }}
    >
      <Box sx={{ mb: { xs: 3, sm: 4 }, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ fontSize: { xs: '22px', sm: '28px' }, fontWeight: 700, mb: 0.75 }}>
          Time Blocking App
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {tasks.length === 0 ? 'No tasks scheduled' : `${tasks.length} task${tasks.length === 1 ? '' : 's'} scheduled`}
        </Typography>
      </Box>

      <IconButton
        aria-label="Add task"
        onClick={() => setActiveInsertionPoint('start')}
        sx={{
          position: 'absolute',
          top: { xs: 16, sm: 22 },
          right: { xs: 0, sm: 8 },
          width: 48,
          height: 48,
          borderRadius: '50%',
          backgroundColor: '#FFFFFF',
          boxShadow: '0 12px 28px rgba(0,0,0,0.12)',
          border: '1px solid rgba(0,0,0,0.06)',
          '&:hover': {
            backgroundColor: '#FFFFFF',
            boxShadow: '0 16px 34px rgba(0,0,0,0.16)',
          },
        }}
      >
        <AddIcon />
      </IconButton>

      <Box
        sx={{
          mb: { xs: 2, sm: 3 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          color: 'text.secondary',
        }}
      >
        <Box
          role="button"
          tabIndex={0}
          onClick={() => setSelectedDateKey(addDays(selectedDateKey, -1))}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setSelectedDateKey(addDays(selectedDateKey, -1))
            }
          }}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            cursor: 'pointer',
            userSelect: 'none',
            px: 1,
            py: 0.5,
            borderRadius: 999,
            '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' },
          }}
        >
          <ChevronLeftIcon sx={{ fontSize: 18, opacity: 0.6 }} />
          <Typography variant="body2" sx={{ fontSize: 14, opacity: 0.75 }}>
            Yesterday
          </Typography>
        </Box>

        <Typography sx={{ fontSize: 16, fontWeight: 700, color: 'text.primary' }}>
          {isToday ? `Today · ${dateLabel}` : dateLabel}
        </Typography>

        <Box
          role="button"
          tabIndex={0}
          onClick={() => setSelectedDateKey(addDays(selectedDateKey, 1))}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setSelectedDateKey(addDays(selectedDateKey, 1))
            }
          }}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            cursor: 'pointer',
            userSelect: 'none',
            px: 1,
            py: 0.5,
            borderRadius: 999,
            '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' },
          }}
        >
          <Typography variant="body2" sx={{ fontSize: 14, opacity: 0.75 }}>
            Tomorrow
          </Typography>
          <ChevronRightIcon sx={{ fontSize: 18, opacity: 0.6 }} />
        </Box>
      </Box>

      {/* Timeline */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          maxWidth: 'calc(var(--time-col-width) + var(--timeline-gap) + var(--task-col-max))',
          mx: 'auto',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            left: 'calc(var(--time-col-width) + (var(--timeline-gap) / 2))',
            top: 0,
            bottom: 0,
            width: '1px',
            backgroundColor: 'rgba(0,0,0,0.06)',
          }}
        />

        {activeInsertionPoint === 'start' && (
          <Box sx={{ display: 'flex', gap: 'var(--timeline-gap)', mb: 1 }}>
            <Box sx={{ minWidth: 'var(--time-col-width)' }} />
            <Box sx={{ width: '100%', maxWidth: 'var(--task-col-max)' }}>
              <InlineTaskForm
                onSubmit={(title, duration) => handleInsertTask(null, title, duration)}
                onCancel={handleCancelInsert}
              />
            </Box>
          </Box>
        )}

        {/* Tasks with time labels */}
        {tasks.length === 0 ? (
          <Box
            sx={{
              mt: 2,
              p: 4,
              textAlign: 'center',
              backgroundColor: 'rgba(255,255,255,0.65)',
              borderRadius: '16px',
              border: '1px solid rgba(0,0,0,0.06)',
              boxShadow: '0 10px 26px rgba(0,0,0,0.06)',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Click the [+] button to add your first task.
            </Typography>
          </Box>
        ) : (
          tasks.map((task) => (
            <Box key={task.id}>
              {/* Insertion point BEFORE this task */}
              <Box sx={{ display: 'flex', gap: 'var(--timeline-gap)' }}>
                {/* Empty space for time label alignment */}
                <Box sx={{ minWidth: 'var(--time-col-width)' }} />
                
                {/* Insertion point / form */}
                <Box sx={{ width: '100%', maxWidth: 'var(--task-col-max)' }}>
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

              {/* Task row with time label on left */}
              <Box 
                sx={{ 
                  display: 'flex', 
                  gap: 'var(--timeline-gap)', 
                  alignItems: 'center',
                  // Smooth transition when tasks shift
                  transition: 'transform 250ms ease-out, margin 250ms ease-out',
                }}
              >
                {/* Time label (left side) */}
                <Box sx={{ minWidth: 'var(--time-col-width)', textAlign: 'right' }}>
                  <TimeLabel time={task.startTime} />
                </Box>

                {/* Task block (centered) */}
                <Box
                  ref={(node) => {
                    const el = node as HTMLDivElement | null
                    if (el) {
                      taskRefs.current.set(task.id, el)
                    } else {
                      taskRefs.current.delete(task.id)
                    }
                  }}
                  sx={{ width: '100%', maxWidth: 'var(--task-col-max)' }}
                >
                  <TaskBlock
                    task={task}
                    onToggleLock={toggleLock}
                    onDelete={deleteTask}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onDrop={handleDrop}
                    isDragging={draggingTaskId === task.id}
                  />
                </Box>
              </Box>
            </Box>
          ))
        )}

        {/* Insertion point after last task */}
        {tasks.length > 0 && (
          <Box sx={{ display: 'flex', gap: 'var(--timeline-gap)', mt: 1 }}>
            {/* Empty space for time label alignment */}
            <Box sx={{ minWidth: 'var(--time-col-width)' }} />
            
            {/* Insertion point / form */}
            <Box sx={{ width: '100%', maxWidth: 'var(--task-col-max)' }}>
              {activeInsertionPoint === 'end' ? (
                <InlineTaskForm
                  onSubmit={(title, duration) => {
                    const lastTask = tasks[tasks.length - 1]
                    handleInsertTask(lastTask.id, title, duration)
                  }}
                  onCancel={handleCancelInsert}
                />
              ) : (
                <InsertionPoint
                  onClick={() => setActiveInsertionPoint('end')}
                  isActive={activeInsertionPoint === 'end'}
                />
              )}
            </Box>
          </Box>
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
            Tip: Create tasks with [+] at top, then drag to reorder.
          </Typography>
        </Box>
      )}
    </Box>
  )
}
