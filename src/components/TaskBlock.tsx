import { Card, Typography, IconButton, Box } from '@mui/material'
import LockIcon from '@mui/icons-material/Lock'
import LockOpenIcon from '@mui/icons-material/LockOpen'
import WarningIcon from '@mui/icons-material/Warning'
import { Task } from '../types'
import { formatDuration } from '../utils/timeCalculations'
import { getTaskColor, colors } from '../theme/theme'
import { useState, useEffect, useRef } from 'react'
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'

interface TaskBlockProps {
  task: Task
  index: number
  onToggleLock: (taskId: string) => void
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
  index,
  onToggleLock,
  onDragStart,
  onDragEnd,
  onDrop,
  isDragging = false,
  isPreview = false,
}: TaskBlockProps) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isBeingDragged, setIsBeingDragged] = useState(false)
  const [isDropTarget, setIsDropTarget] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  // Calculate height based on duration (1 minute = 1.33px)
  const height = Math.max(50, task.durationMinutes * 1.33)

  // Get background color from theme
  const backgroundColor = getTaskColor(index)

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
        backgroundColor,
        borderRadius: '8px',
        border: isBeingDragged
          ? '2px dashed #000000'
          : task.isOverlapping
          ? `2px solid ${colors.overlapBorder}`
          : isDropTarget
          ? '2px solid #000000'
          : 'none',
        padding: '16px',
        marginBottom: '8px',
        minHeight: `${height}px`,
        cursor: task.isLocked ? 'not-allowed' : isBeingDragged ? 'grabbing' : 'grab',
        opacity: isBeingDragged ? 0.85 : isDragging ? 0.85 : isPreview ? 0.6 : 1,
        transition: 'box-shadow 150ms ease, opacity 150ms ease, border 150ms ease',
        boxShadow: isBeingDragged ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
        '&:hover': {
          boxShadow: task.isLocked || isBeingDragged ? 'none' : '0 2px 8px rgba(0,0,0,0.1)',
        },
        // Overlapping pulse animation
        animation: task.isOverlapping ? 'pulse 1.5s ease-in-out infinite' : 'none',
        '@keyframes pulse': {
          '0%, 100%': { borderColor: colors.overlapBorder, opacity: 1 },
          '50%': { borderColor: colors.overlapBorder, opacity: 0.6 },
        },
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
          mb: 0.5,
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
    </Card>
  )
}
