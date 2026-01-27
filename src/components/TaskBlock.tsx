import { Card, Typography, IconButton, Box } from '@mui/material'
import LockIcon from '@mui/icons-material/Lock'
import LockOpenIcon from '@mui/icons-material/LockOpen'
import WarningIcon from '@mui/icons-material/Warning'
import DeleteIcon from '@mui/icons-material/Delete'
import { Task } from '../types'
import { formatDuration } from '../utils/timeCalculations'
import { colors } from '../theme/theme'
import { useState, useEffect, useRef } from 'react'
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'

interface TaskBlockProps {
  task: Task
  onToggleLock: (taskId: string) => void
  onDelete: (taskId: string) => void
  onDragStart?: (taskId: string) => void
  onDragEnd?: () => void
  onDrop?: (draggedTaskId: string, targetTaskId: string, dropY: number) => void
  isDragging?: boolean
  isPreview?: boolean
}

/**
 * TaskBlock component - displays a single task block
 * Features:
 * - Alternating green backgrounds
 * - Hover shows lock icon (if unlocked)
 * - Lock icon always visible if locked
 * - Overlapping state shows warning
 * - Height proportional to duration
 */
export const TaskBlock = ({
  task,
  onToggleLock,
  onDelete,
  onDragStart,
  onDragEnd,
  onDrop,
  isDragging = false,
  isPreview = false,
}: TaskBlockProps) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isBeingDragged, setIsBeingDragged] = useState(false)
  const [isDropTarget, setIsDropTarget] = useState(false)
  const [showNewHighlight, setShowNewHighlight] = useState(task.isNew ?? false)
  const cardRef = useRef<HTMLDivElement>(null)

  // Clear the highlight after animation
  useEffect(() => {
    if (task.isNew) {
      setShowNewHighlight(true)
      const timer = setTimeout(() => {
        setShowNewHighlight(false)
      }, 3000) // Highlight for 3 seconds
      return () => clearTimeout(timer)
    }
  }, [task.isNew])

  // Calculate height based on duration (1 minute = 1.33px)
  const height = Math.max(50, task.durationMinutes * 1.33)

  // Get background color from task (assigned on creation)
  const backgroundColor = task.color

  // Setup drag and drop
  useEffect(() => {
    const element = cardRef.current
    if (!element) return

    // Don't make locked tasks draggable
    if (task.isLocked) return

    // Make element draggable
    const cleanupDraggable = draggable({
      element,
      getInitialData: () => ({ taskId: task.id, type: 'task' }),
      onDragStart: () => {
        setIsBeingDragged(true)
        onDragStart?.(task.id)
      },
      onDrop: () => {
        setIsBeingDragged(false)
        onDragEnd?.()
      },
    })

    // Make element a drop target
    const cleanupDropTarget = dropTargetForElements({
      element,
      getData: () => ({ taskId: task.id }),
      onDragEnter: () => setIsDropTarget(true),
      onDragLeave: () => setIsDropTarget(false),
      onDrop: ({ source, location }) => {
        setIsDropTarget(false)
        const draggedTaskId = source.data.taskId as string
        const dropY = location.current.input.clientY

        if (draggedTaskId && draggedTaskId !== task.id) {
          onDrop?.(draggedTaskId, task.id, dropY)
        }
      },
    })

    return () => {
      cleanupDraggable()
      cleanupDropTarget()
    }
  }, [task.id, task.isLocked, onDragStart, onDragEnd, onDrop])

  return (
    <Card
      ref={cardRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        position: 'relative',
        background: `linear-gradient(90deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 70%), ${backgroundColor}`,
        borderRadius: '16px',
        border: isBeingDragged
          ? '2px dashed #000000'
          : task.isOverlapping
          ? `2px solid ${colors.overlapBorder}`
          : isDropTarget
          ? '2px solid #000000'
          : 'none',
        padding: '18px',
        marginBottom: '10px',
        minHeight: `${height}px`,
        cursor: task.isLocked ? 'not-allowed' : isBeingDragged ? 'grabbing' : 'grab',
        opacity: isBeingDragged ? 0.85 : isDragging ? 0.85 : isPreview ? 0.6 : 1,
        transition: 'box-shadow 150ms ease, opacity 150ms ease, border 150ms ease',
        boxShadow: isBeingDragged
          ? '0 4px 12px rgba(0,0,0,0.15)'
          : showNewHighlight
          ? '0 0 0 3px #4CAF50, 0 4px 12px rgba(76, 175, 80, 0.3)'
          : '0 10px 26px rgba(0,0,0,0.10)',
        '&:hover': {
          boxShadow: task.isLocked || isBeingDragged ? '0 10px 26px rgba(0,0,0,0.10)' : '0 14px 32px rgba(0,0,0,0.14)',
        },
        // Overlapping pulse animation
        animation: task.isOverlapping
          ? 'pulse 1.5s ease-in-out infinite'
          : showNewHighlight
          ? 'newTaskGlow 0.5s ease-out'
          : 'none',
        '@keyframes pulse': {
          '0%, 100%': { borderColor: colors.overlapBorder, opacity: 1 },
          '50%': { borderColor: colors.overlapBorder, opacity: 0.6 },
        },
        '@keyframes newTaskGlow': {
          '0%': { boxShadow: '0 0 0 6px #4CAF50, 0 8px 24px rgba(76, 175, 80, 0.5)' },
          '100%': { boxShadow: '0 0 0 3px #4CAF50, 0 4px 12px rgba(76, 175, 80, 0.3)' },
        },
        // Overflow hidden for the highlight bar
        overflow: 'hidden',
      }}
    >
      {/* Task Title */}
      <Typography
        variant="h6"
        sx={{
          fontSize: '18px',
          fontWeight: 600,
          color: '#000000',
          lineHeight: 1.3,
          mb: 0.75,
          pr: 4, // Space for lock icon
        }}
      >
        {task.title}
      </Typography>

      {/* Duration */}
      <Typography
        variant="body2"
        sx={{
          fontSize: '13px',
          color: '#666666',
        }}
      >
        Est. {formatDuration(task.durationMinutes)}
      </Typography>

      {/* Lock Icon (top-right) */}
      <Box
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          display: 'flex',
          gap: 0.5,
        }}
      >
        {/* Overlap Warning Icon */}
        {task.isOverlapping && (
          <WarningIcon
            sx={{
              fontSize: '18px',
              color: colors.overlapBorder,
            }}
          />
        )}

        {/* Delete Icon - appears on hover */}
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation()
            onDelete(task.id)
          }}
          sx={{
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 150ms ease',
            padding: '4px',
            '&:hover': {
              backgroundColor: 'rgba(239, 83, 80, 0.1)',
            },
          }}
        >
          <DeleteIcon sx={{ fontSize: '18px', color: '#EF5350' }} />
        </IconButton>

        {/* Lock/Unlock Icon */}
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation()
            onToggleLock(task.id)
          }}
          sx={{
            opacity: task.isLocked || isHovered ? 1 : 0,
            transition: 'opacity 150ms ease',
            padding: '4px',
            '&:hover': {
              backgroundColor: 'rgba(0,0,0,0.04)',
            },
          }}
        >
          {task.isLocked ? (
            <LockIcon sx={{ fontSize: '20px', color: colors.lockIcon }} />
          ) : (
            <LockOpenIcon sx={{ fontSize: '20px', color: '#BDBDBD' }} />
          )}
        </IconButton>
      </Box>

      {/* New task highlight bar on right side */}
      {showNewHighlight && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            width: '4px',
            backgroundColor: '#4CAF50',
            borderRadius: '0 8px 8px 0',
            animation: 'highlightPulse 1s ease-in-out infinite',
            '@keyframes highlightPulse': {
              '0%, 100%': { opacity: 1 },
              '50%': { opacity: 0.5 },
            },
          }}
        />
      )}
    </Card>
  )
}
