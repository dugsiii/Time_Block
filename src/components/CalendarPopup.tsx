import { Box, ButtonBase, Dialog, Typography, IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { useMemo } from 'react'

interface CalendarPopupProps {
  open: boolean
  onClose: () => void
  onSelectDate: (dateKey: string) => void
}

export const CalendarPopup = ({ open, onClose, onSelectDate }: CalendarPopupProps) => {
  // Get all dates from localStorage
  const datesWithData = useMemo(() => {
    try {
      const stored = localStorage.getItem('time-block-app-tasks')
      if (!stored) return []
      
      const data = JSON.parse(stored)
      if (data.version === 2 && data.tasksByDate) {
        return Object.keys(data.tasksByDate).sort()
      }
      return []
    } catch {
      return []
    }
  }, [])

  const todayKey = useMemo(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }, [])

  const formatDateKey = (dateKey: string) => {
    const date = new Date(dateKey + 'T00:00:00')
    return date.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          backgroundColor: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(0,0,0,0.06)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
        }
      }}
    >
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontSize: 20, fontWeight: 700 }}>
            Calendar
          </Typography>
          <IconButton onClick={onClose} sx={{ p: 0.5 }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {datesWithData.length === 0 ? (
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            No dates with tasks yet
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {datesWithData.map((dateKey) => (
              <ButtonBase
                key={dateKey}
                onClick={() => {
                  onSelectDate(dateKey)
                  onClose()
                }}
                sx={{
                  width: '100%',
                  p: 2,
                  borderRadius: '12px',
                  border: '1px solid rgba(0,0,0,0.06)',
                  backgroundColor: dateKey === todayKey ? 'rgba(168, 220, 200, 0.2)' : 'rgba(255,255,255,0.7)',
                  textAlign: 'left',
                  transition: 'all 150ms ease',
                  '&:hover': {
                    backgroundColor: dateKey === todayKey ? 'rgba(168, 220, 200, 0.3)' : 'rgba(255,255,255,0.9)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }
                }}
              >
                <Typography sx={{ fontSize: 15, fontWeight: 600 }}>
                  {formatDateKey(dateKey)}
                </Typography>
                {dateKey === todayKey && (
                  <Typography sx={{ fontSize: 12, color: 'success.main', mt: 0.5 }}>
                    Today
                  </Typography>
                )}
              </ButtonBase>
            ))}
          </Box>
        )}
      </Box>
    </Dialog>
  )
}
