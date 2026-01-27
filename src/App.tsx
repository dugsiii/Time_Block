import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { Box, ButtonBase, Typography } from '@mui/material'
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined'
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import { theme } from './theme/theme'
import { useState } from 'react'
import { TodayView } from './components/TodayView'
import { ComingSoon } from './components/ComingSoon'

function App() {
  const [activeNav, setActiveNav] = useState<'today' | 'tasks' | 'stats' | 'settings'>('today')
  const [selectedDateKey, setSelectedDateKey] = useState<string | undefined>()

  const navItems = [
    { key: 'today' as const, label: 'Calendar', icon: CalendarMonthOutlinedIcon },
    { key: 'tasks' as const, label: 'Tasks', icon: CheckCircleOutlineOutlinedIcon },
    { key: 'stats' as const, label: 'Stats', icon: BarChartOutlinedIcon },
    { key: 'settings' as const, label: 'Settings', icon: SettingsOutlinedIcon },
  ]

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          background:
            'radial-gradient(circle at 0% 30%, rgba(168, 220, 200, 0.35) 0%, rgba(255,255,255,0) 45%), linear-gradient(180deg, #FFFFFF 0%, #F7FBF8 100%)',
        }}
      >
        <Box
          sx={{
            width: 128,
            flex: '0 0 128px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            py: 6,
            px: 1,
            borderRight: '1px solid rgba(0,0,0,0.04)',
            background:
              'linear-gradient(180deg, rgba(232, 245, 233, 0.8) 0%, rgba(255, 255, 255, 0.4) 100%)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {navItems.map((item) => {
            const isActive = item.key === activeNav
            const Icon = item.icon

            return (
              <ButtonBase
                key={item.key}
                onClick={() => {
                  if (item.key === 'today') {
                    setActiveNav('today')
                    setSelectedDateKey(undefined)
                  } else {
                    setActiveNav(item.key)
                  }
                }}
                sx={{
                  width: '100%',
                  borderRadius: '16px',
                  py: 1.5,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  color: isActive ? '#000000' : 'rgba(0,0,0,0.4)',
                  transition: 'all 200ms ease',
                  '&:hover': {
                    color: '#000000',
                  },
                }}
              >
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isActive ? 'rgba(255,255,255,0.9)' : 'transparent',
                    boxShadow: isActive ? '0 12px 32px rgba(0,0,0,0.08)' : 'none',
                    border: isActive ? '1px solid rgba(0,0,0,0.02)' : 'none',
                    transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  <Icon sx={{ fontSize: 26 }} />
                </Box>
                <Typography sx={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.01em' }}>
                  {item.label}
                </Typography>
              </ButtonBase>
            )
          })}
        </Box>

        <Box
          sx={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            px: { xs: 2, sm: 3, md: 5 },
          }}
        >
          <Box sx={{ width: '100%', maxWidth: 980 }}>
            {activeNav === 'today' && <TodayView selectedDateKey={selectedDateKey} onDateChange={setSelectedDateKey} />}
            {activeNav === 'tasks' && <ComingSoon title="Tasks" />}
            {activeNav === 'stats' && <ComingSoon title="Stats" />}
            {activeNav === 'settings' && <ComingSoon title="Settings" />}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  )
}

export default App
