import { Box, TextField, Button, Typography } from '@mui/material'
import { useState, useEffect, useRef } from 'react'
import { roundDurationUp, formatDuration } from '../utils/timeCalculations'

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
 * - Duration is rounded up to nearest 15 minutes (shown dynamically)
 * - Accepts any duration value, shows conversion before submission
 */
export const InlineTaskForm = ({
  onSubmit,
  onCancel,
}: InlineTaskFormProps) => {
  const [title, setTitle] = useState('')
  const [duration, setDuration] = useState(30)
  const titleInputRef = useRef<HTMLInputElement>(null)

  // Calculate rounded duration for display
  const roundedDuration = roundDurationUp(duration)
  const willBeRounded = duration > 0 && duration !== roundedDuration

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

    // Round up duration to nearest 15 minutes before submitting
    const finalDuration = roundDurationUp(duration)
    onSubmit(title.trim(), finalDuration)
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
        backgroundColor: 'rgba(255,255,255,0.75)',
        borderRadius: '16px',
        border: '1px solid rgba(0,0,0,0.12)',
        boxShadow: '0 10px 26px rgba(0,0,0,0.08)',
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

      <Box sx={{ mb: 1.5 }}>
        <TextField
          fullWidth
          size="small"
          type="number"
          label="Duration (minutes)"
          value={duration}
          onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
          inputProps={{
            min: 1,
            // No step restriction - allow any value
          }}
        />
      </Box>

      {/* Dynamic rounded duration indicator */}
      <Box
        sx={{
          mb: 1.5,
          p: 1,
          backgroundColor: willBeRounded ? '#E3F2FD' : '#E8F5E9',
          borderRadius: '6px',
          border: willBeRounded ? '1px solid #90CAF9' : '1px solid #A5D6A7',
          transition: 'all 200ms ease',
        }}
      >
        <Typography
          variant="body2"
          sx={{
            fontSize: '12px',
            color: willBeRounded ? '#1565C0' : '#2E7D32',
            fontWeight: 500,
            textAlign: 'center',
          }}
        >
          {duration < 1 ? (
            'Enter a duration (minimum 1 minute)'
          ) : willBeRounded ? (
            <>
              {duration} min → <strong>{formatDuration(roundedDuration)}</strong> (rounded to 15-min interval)
            </>
          ) : (
            <>
              Duration: <strong>{formatDuration(roundedDuration)}</strong> ✓
            </>
          )}
        </Typography>
      </Box>

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
