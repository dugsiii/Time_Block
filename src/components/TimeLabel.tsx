import { Typography } from '@mui/material'
import { formatTime } from '../utils/timeCalculations'

interface TimeLabelProps {
  time: Date
  isFocused?: boolean
}

/**
 * TimeLabel component - displays hour labels on the timeline
 * Focused state (solid black) indicates drop target during drag
 * Unfocused state (light gray) for other times
 */
export const TimeLabel = ({ time, isFocused = false }: TimeLabelProps) => {
  return (
    <Typography
      variant="body2"
      sx={{
        fontSize: '14px',
        fontWeight: isFocused ? 600 : 400,
        color: isFocused ? '#000000' : '#BDBDBD',
        transition: 'all 150ms ease',
        userSelect: 'none',
        mb: 0.5,
      }}
    >
      {formatTime(time)}
    </Typography>
  )
}
