import { Box, TextField, Button } from '@mui/material'
import { useState, useEffect, useRef } from 'react'

interface InlineTaskFormProps {
  onSubmit: (title: string, durationMinutes: number) => void
  onCancel: () => void
}

/**
 * InlineTaskForm component - appears when [+] is clicked
 * Compact inline form for creating tasks
 * Features:
 * - Autofocus on title input
 * - Enter to submit, Escape to cancel
 * - Default duration: 30 minutes
 */
export const InlineTaskForm = ({
  onSubmit,
  onCancel,
}: InlineTaskFormProps) => {
  const [title, setTitle] = useState('')
  const [duration, setDuration] = useState(30)
  const titleInputRef = useRef<HTMLInputElement>(null)

  // Autofocus on mount
  useEffect(() => {
    titleInputRef.current?.focus()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      return // Don't submit empty title
    }

    if (duration < 1) {
      return // Minimum 1 minute
    }

    onSubmit(title.trim(), duration)
    setTitle('')
    setDuration(30)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel()
    }
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
      sx={{
        p: 2,
        mb: 1.5,
        backgroundColor: '#FAFAFA',
        borderRadius: '8px',
        border: '2px solid #000000',
      }}
    >
      <TextField
        inputRef={titleInputRef}
        fullWidth
        size="small"
        placeholder="Task name"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        sx={{ mb: 1.5 }}
      />

      <TextField
        fullWidth
        size="small"
        type="number"
        label="Duration (minutes)"
        value={duration}
        onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
        inputProps={{
          min: 1,
          step: 1,
        }}
        sx={{ mb: 1.5 }}
      />

      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          type="submit"
          variant="contained"
          size="small"
          disabled={!title.trim() || duration < 1}
          sx={{
            flex: 1,
            backgroundColor: '#000000',
            '&:hover': {
              backgroundColor: '#333333',
            },
          }}
        >
          Add Task
        </Button>

        <Button
          type="button"
          variant="outlined"
          size="small"
          onClick={onCancel}
          sx={{
            flex: 1,
            borderColor: '#E0E0E0',
            color: '#666666',
            '&:hover': {
              borderColor: '#000000',
              backgroundColor: 'transparent',
            },
          }}
        >
          Cancel
        </Button>
      </Box>
    </Box>
  )
}
