import { Box } from '@mui/material'
import { SimpleTimeline } from './SimpleTimeline'

interface TodayViewProps {
  selectedDateKey?: string
  onDateChange?: (dateKey: string) => void
}

export const TodayView = ({ selectedDateKey, onDateChange }: TodayViewProps) => {
  return (
    <Box sx={{ width: '100%' }}>
      <SimpleTimeline selectedDateKey={selectedDateKey} onDateChange={onDateChange} />
    </Box>
  )
}
