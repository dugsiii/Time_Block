import { Box, ButtonBase, Typography } from '@mui/material'
import { useMemo } from 'react'
import { useTaskStore } from '../store/taskStore'
import { addDays, dateKeyToDate, getLocalDateKey } from '../utils/date'
import { Timeline } from './Timeline'

export const CalendarView = () => {
  const selectedDateKey = useTaskStore((state) => state.selectedDateKey)
  const setSelectedDateKey = useTaskStore((state) => state.setSelectedDateKey)

  const todayKey = useMemo(() => getLocalDateKey(new Date()), [])

  const weekKeys = useMemo(() => {
    // Build a 7-day strip centered around the selected day
    return Array.from({ length: 7 }, (_v, i) => addDays(selectedDateKey, i - 3))
  }, [selectedDateKey])

  const selectedDate = dateKeyToDate(selectedDateKey)
  const monthLabel = selectedDate.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  })

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ pt: { xs: 3, sm: 4 }, pb: { xs: 1.5, sm: 2.5 } }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            gap: 2,
            px: { xs: 0, sm: 1 },
            mb: 2,
          }}
        >
          <Typography sx={{ fontSize: 18, fontWeight: 700 }}>{monthLabel}</Typography>

          <ButtonBase
            onClick={() => setSelectedDateKey(todayKey)}
            sx={{
              borderRadius: 999,
              px: 1.5,
              py: 0.75,
              border: '1px solid rgba(0,0,0,0.08)',
              backgroundColor: 'rgba(255,255,255,0.7)',
              boxShadow: '0 10px 20px rgba(0,0,0,0.06)',
            }}
          >
            <Typography sx={{ fontSize: 13, fontWeight: 600 }}>Today</Typography>
          </ButtonBase>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 1,
            px: { xs: 0, sm: 1 },
          }}
        >
          {weekKeys.map((key) => {
            const date = dateKeyToDate(key)
            const isSelected = key === selectedDateKey
            const isToday = key === todayKey

            return (
              <ButtonBase
                key={key}
                onClick={() => setSelectedDateKey(key)}
                sx={{
                  borderRadius: 14,
                  py: 1.1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.25,
                  border: isSelected ? '1px solid rgba(0,0,0,0.22)' : '1px solid rgba(0,0,0,0.06)',
                  backgroundColor: isSelected ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.55)',
                  boxShadow: isSelected ? '0 12px 26px rgba(0,0,0,0.10)' : '0 8px 20px rgba(0,0,0,0.05)',
                }}
              >
                <Typography
                  sx={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: isSelected ? 'text.primary' : 'rgba(0,0,0,0.55)',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}
                >
                  {date.toLocaleDateString(undefined, { weekday: 'short' })}
                </Typography>

                <Typography sx={{ fontSize: 16, fontWeight: 800, lineHeight: 1 }}>
                  {date.getDate()}
                </Typography>

                <Typography sx={{ fontSize: 11, color: 'rgba(0,0,0,0.55)' }}>
                  {isToday ? 'Today' : ' '}
                </Typography>
              </ButtonBase>
            )
          })}
        </Box>
      </Box>

      <Timeline />
    </Box>
  )
}
