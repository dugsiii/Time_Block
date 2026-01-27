import { Box, IconButton, Typography, Button } from '@mui/material'
import { useState, useEffect } from 'react'
import { TaskBlock } from './TaskBlock'
import { InsertionPoint } from './InsertionPoint'
import { InlineTaskForm } from './InlineTaskForm'
import { TimeLabel } from './TimeLabel'
import AddIcon from '@mui/icons-material/Add'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { getLocalDateKey, addDays, dateKeyToDate } from '../utils/date'
import { Task } from '../types'
import { taskColors } from '../theme/theme'

interface SimpleTimelineProps {
  selectedDateKey?: string
  onDateChange?: (dateKey: string) => void
}

export const SimpleTimeline = ({ selectedDateKey, onDateChange }: SimpleTimelineProps) => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [activeInsertionPoint, setActiveInsertionPoint] = useState<string | null>(null)
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null)
  const [internalDateKey, setInternalDateKey] = useState<string>(getLocalDateKey(new Date()))

  // Use external dateKey if provided, otherwise use internal state
  const currentDateKey = selectedDateKey || internalDateKey
  const currentDate = dateKeyToDate(currentDateKey)

  // Helper function to revive Date objects from JSON
  const reviveTaskDates = (task: any): Task => ({
    ...task,
    startTime: new Date(task.startTime),
    createdAt: new Date(task.createdAt),
  })

  // Load tasks from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('time-block-app-tasks')
      if (stored) {
        const data = JSON.parse(stored)
        if (data.version === 2 && data.tasksByDate) {
          const dayTasks = (data.tasksByDate[currentDateKey] || []).map(reviveTaskDates)
          setTasks(dayTasks)
        } else if (data.version === 1 || Array.isArray(data)) {
          // Legacy format - only show if it's today
          if (currentDateKey === getLocalDateKey(new Date())) {
            const tasks = Array.isArray(data) ? data : []
            setTasks(tasks.map(reviveTaskDates))
          }
        }
      }
    } catch (error) {
      console.error('Error loading tasks:', error)
    }
  }, [currentDateKey])

  // Save tasks to localStorage
  const saveTasks = (newTasks: Task[]) => {
    try {
      const stored = localStorage.getItem('time-block-app-tasks')
      let data = { version: 2, selectedDateKey: currentDateKey, tasksByDate: {} as Record<string, Task[]> }

      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed.version === 2) {
          data = parsed
        }
      }

      data.tasksByDate[currentDateKey] = newTasks
      localStorage.setItem('time-block-app-tasks', JSON.stringify(data))
    } catch (error) {
      console.error('Error saving tasks:', error)
    }
  }

  const handleInsertTask = (afterTaskId: string | null, title: string, durationMinutes: number) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      durationMinutes,
      isLocked: false,
      isOverlapping: false,
      startTime: new Date(), // Will be recalculated
      order: tasks.length,
      createdAt: new Date(),
      color: taskColors[tasks.length % taskColors.length], // Use pastel colors from theme
    }

    let updatedTasks: Task[]
    if (afterTaskId === null) {
      updatedTasks = [newTask, ...tasks]
    } else {
      const targetIndex = tasks.findIndex(t => t.id === afterTaskId)
      if (targetIndex >= 0) {
        updatedTasks = [...tasks]
        updatedTasks.splice(targetIndex + 1, 0, newTask)
      } else {
        updatedTasks = [...tasks, newTask]
      }
    }

    // Simple time calculation - start each task after the previous one
    let currentTime = new Date(currentDate)
    currentTime.setHours(8, 0, 0, 0) // Start at 8 AM

    updatedTasks = updatedTasks.map((task, index) => {
      const taskStart = new Date(currentTime)
      currentTime = new Date(currentTime.getTime() + task.durationMinutes * 60000)
      return {
        ...task,
        startTime: taskStart,
        order: index,
      }
    })

    setTasks(updatedTasks)
    saveTasks(updatedTasks)
    setActiveInsertionPoint(null)
  }

  const handleDeleteTask = (taskId: string) => {
    const updatedTasks = tasks.filter(t => t.id !== taskId)
    setTasks(updatedTasks)
    saveTasks(updatedTasks)
  }

  const handleToggleLock = (taskId: string) => {
    const updatedTasks = tasks.map(t =>
      t.id === taskId ? { ...t, isLocked: !t.isLocked } : t
    )
    setTasks(updatedTasks)
    saveTasks(updatedTasks)
  }

  const handleDateChange = (direction: 'prev' | 'next') => {
    const newDateKey = addDays(currentDateKey, direction === 'next' ? 1 : -1)
    if (onDateChange) {
      onDateChange(newDateKey)
    } else {
      setInternalDateKey(newDateKey)
    }
  }

  const dateLabel = currentDate.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })

  // Calculate the maximum content width for proper centering
  // This ensures all elements (header, date picker, tasks, forms) share the same center point
  const CONTENT_MAX_WIDTH = 720 // Maximum width for the content area (tasks, forms, etc.)

  return (
    <Box
      sx={{
        position: 'relative',
        py: { xs: 3, sm: 5 },
        px: { xs: 2, sm: 0 },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
      }}
    >
      {/* Header Section - Centered */}
      <Box
        sx={{
          mb: { xs: 3, sm: 4 },
          textAlign: 'center',
          width: '100%',
          maxWidth: CONTENT_MAX_WIDTH,
        }}
      >
        <Typography variant="h6" sx={{ fontSize: { xs: '24px', sm: '32px' }, fontWeight: 700, mb: 0.5 }}>
          Time Blocking App
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {tasks.length === 0 ? 'No tasks scheduled' : `${tasks.length} task${tasks.length === 1 ? '' : 's'} scheduled`}
        </Typography>

        {/* Today button - only show if not on today's date */}
        {currentDateKey !== getLocalDateKey(new Date()) && (
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              const todayKey = getLocalDateKey(new Date())
              if (onDateChange) {
                onDateChange(todayKey)
              } else {
                setInternalDateKey(todayKey)
              }
            }}
            sx={{
              borderRadius: '20px',
              textTransform: 'none',
              fontSize: '14px',
              px: 2,
              mb: 2,
            }}
          >
            Today
          </Button>
        )}
      </Box>

      {/* Add Task Button - Positioned relative to max content width */}
      <IconButton
        aria-label="Add task"
        onClick={() => setActiveInsertionPoint('start')}
        sx={{
          position: 'absolute',
          top: { xs: 16, sm: 28 },
          right: {
            xs: 16,
            sm: `max(16px, calc(50% - ${CONTENT_MAX_WIDTH / 2}px - 76px))`
          },
          width: 56,
          height: 56,
          backgroundColor: '#FFFFFF',
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.04)',
          '&:hover': {
            backgroundColor: '#F8F8F8',
            boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
          },
        }}
      >
        <AddIcon sx={{ fontSize: 28 }} />
      </IconButton>

      {/* Date Navigation - Centered */}
      <Box
        sx={{
          mb: { xs: 3, sm: 5 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          width: '100%',
          maxWidth: CONTENT_MAX_WIDTH,
        }}
      >
        <Box
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer', opacity: 0.4, '&:hover': { opacity: 0.8 } }}
          onClick={() => handleDateChange('prev')}
        >
          <ChevronLeftIcon sx={{ fontSize: 20 }} />
          <Typography variant="body2" sx={{ fontSize: 15 }}>
            Yesterday
          </Typography>
        </Box>

        <Typography sx={{ fontSize: 20, fontWeight: 700, color: 'text.primary' }}>
          {dateLabel}
        </Typography>

        <Box
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer', opacity: 0.4, '&:hover': { opacity: 0.8 } }}
          onClick={() => handleDateChange('next')}
        >
          <Typography variant="body2" sx={{ fontSize: 15 }}>
            Tomorrow
          </Typography>
          <ChevronRightIcon sx={{ fontSize: 20 }} />
        </Box>
      </Box>

      {/* Main Content Container - Dynamically Centered */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          maxWidth: CONTENT_MAX_WIDTH,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Inline Form at Start */}
        {activeInsertionPoint === 'start' && (
          <Box sx={{ mb: 3, width: '100%' }}>
            <InlineTaskForm
              onSubmit={(title, duration) => handleInsertTask(null, title, duration)}
              onCancel={() => setActiveInsertionPoint(null)}
            />
          </Box>
        )}

        {/* Empty State - Centered within content container */}
        {tasks.length === 0 ? (
          <Box
            sx={{
              mt: 2,
              p: 6,
              textAlign: 'center',
              backgroundColor: 'rgba(255,255,255,0.4)',
              borderRadius: '24px',
              border: '1px dashed rgba(0,0,0,0.1)',
              width: '100%',
            }}
          >
            <Typography color="text.secondary">
              No tasks scheduled for this day. Click the + button to add your first task.
            </Typography>
          </Box>
        ) : (
          /* Tasks List */
          tasks.map((task) => (
            <Box key={task.id} sx={{ width: '100%' }}>
              {/* Insertion Point Before Task */}
              <Box sx={{ width: '100%' }}>
                {activeInsertionPoint === task.id ? (
                  <InlineTaskForm
                    onSubmit={(title, duration) => handleInsertTask(task.id, title, duration)}
                    onCancel={() => setActiveInsertionPoint(null)}
                  />
                ) : (
                  <InsertionPoint
                    onClick={() => setActiveInsertionPoint(task.id)}
                    isActive={activeInsertionPoint === task.id}
                  />
                )}
              </Box>

              {/* Task Block with Time Label */}
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1, width: '100%' }}>
                <Box sx={{ minWidth: 80, textAlign: 'right', pt: 1, pr: 2 }}>
                  <TimeLabel time={task.startTime} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <TaskBlock
                    task={task}
                    onDelete={() => handleDeleteTask(task.id)}
                    onToggleLock={() => handleToggleLock(task.id)}
                    onDragStart={() => setDraggingTaskId(task.id)}
                    onDragEnd={() => setDraggingTaskId(null)}
                    isDragging={draggingTaskId === task.id}
                  />
                </Box>
              </Box>

              {/* Insertion Point After Task */}
              <Box sx={{ width: '100%' }}>
                {activeInsertionPoint === `${task.id}-after` ? (
                  <InlineTaskForm
                    onSubmit={(title, duration) => handleInsertTask(task.id, title, duration)}
                    onCancel={() => setActiveInsertionPoint(null)}
                  />
                ) : (
                  <InsertionPoint
                    onClick={() => setActiveInsertionPoint(`${task.id}-after`)}
                    isActive={activeInsertionPoint === `${task.id}-after`}
                  />
                )}
              </Box>
            </Box>
          ))
        )}

        {/* End Insertion Point */}
        {tasks.length > 0 && (
          <Box sx={{ mt: 1, width: '100%' }}>
            {activeInsertionPoint === 'end' ? (
              <InlineTaskForm
                onSubmit={(title, duration) => {
                  const lastTask = tasks[tasks.length - 1]
                  handleInsertTask(lastTask.id, title, duration)
                }}
                onCancel={() => setActiveInsertionPoint(null)}
              />
            ) : (
              <InsertionPoint
                onClick={() => setActiveInsertionPoint('end')}
                isActive={activeInsertionPoint === 'end'}
              />
            )}
          </Box>
        )}

        {/* Tip - Centered */}
        <Box sx={{ textAlign: 'center', mt: 6, opacity: 0.5 }}>
          <Typography variant="caption" sx={{ fontSize: 14 }}>
            Tip: Create tasks with [+] at top, then drag to reorder.
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
