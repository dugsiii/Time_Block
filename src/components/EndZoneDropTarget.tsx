import { Box, Typography } from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'

interface EndZoneDropTargetProps {
  onDrop: (draggedTaskId: string) => void
  hasLockedTaskAtEnd: boolean
}

/**
 * EndZoneDropTarget - a drop zone at the bottom of the task list
 * Allows users to move tasks to the end, even past locked tasks
 */
export const EndZoneDropTarget = ({
  onDrop,
  hasLockedTaskAtEnd,
}: EndZoneDropTargetProps) => {
  const dropRef = useRef<HTMLDivElement>(null)
  const [isDropTarget, setIsDropTarget] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    const element = dropRef.current
    if (!element) return

    const cleanup = dropTargetForElements({
      element,
      getData: () => ({ type: 'end-zone' }),
      onDragEnter: () => {
        setIsDropTarget(true)
        setIsDragging(true)
      },
      onDragLeave: () => {
        setIsDropTarget(false)
      },
      onDrop: ({ source }) => {
        setIsDropTarget(false)
        setIsDragging(false)
        const draggedTaskId = source.data.taskId as string
        if (draggedTaskId) {
          onDrop(draggedTaskId)
        }
      },
    })

    // Listen for global drag events to show the zone
    const handleDragStart = () => setIsDragging(true)
    const handleDragEnd = () => {
      setIsDragging(false)
      setIsDropTarget(false)
    }

    document.addEventListener('dragstart', handleDragStart)
    document.addEventListener('dragend', handleDragEnd)

    return () => {
      cleanup()
      document.removeEventListener('dragstart', handleDragStart)
      document.removeEventListener('dragend', handleDragEnd)
    }
  }, [onDrop])

  // Only show when there's a locked task at the end and we're dragging
  if (!hasLockedTaskAtEnd && !isDragging) return null

  return (
    <Box
      ref={dropRef}
      sx={{
        minHeight: isDragging ? '80px' : '40px',
        marginTop: '8px',
        marginLeft: '114px', // Align with task blocks (90px time label + 24px gap)
        width: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '8px',
        border: isDropTarget ? '2px solid #000000' : '2px dashed #BDBDBD',
        backgroundColor: isDropTarget ? 'rgba(0, 0, 0, 0.05)' : 'transparent',
        opacity: isDragging ? 1 : 0.5,
        transition: 'all 200ms ease',
      }}
    >
      <Typography
        variant="body2"
        sx={{
          color: isDropTarget ? '#000000' : '#9E9E9E',
          fontSize: '13px',
          fontWeight: isDropTarget ? 500 : 400,
        }}
      >
        {isDropTarget ? 'Drop here to move to end' : 'Drop zone'}
      </Typography>
    </Box>
  )
}

