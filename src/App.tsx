import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { Box, ButtonBase, Typography } from '@mui/material'
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined'
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import { theme } from './theme/theme'
import { Timeline } from './components/Timeline'
import { useEffect, useState } from 'react'
import { useTaskStore } from './store/taskStore'

function App() {
  // Expose store to window for console testing (optional)
  useEffect(() => {
    (window as unknown as { taskStore: typeof useTaskStore }).taskStore = useTaskStore
    console.log('✅ Task store available at window.taskStore')
  }, [])

  const [activeNav, setActiveNav] = useState<'calendar' | 'tasks' | 'stats' | 'settings'>('calendar')

  const navItems = [
    { key: 'calendar' as const, label: 'Calendar', icon: CalendarMonthOutlinedIcon },
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
            width: 120,
            flex: '0 0 120px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1,
            py: 4,
            px: 1,
            borderRight: '1px solid rgba(0,0,0,0.06)',
            background:
              'linear-gradient(180deg, rgba(183, 226, 205, 0.55) 0%, rgba(183, 226, 205, 0.18) 60%, rgba(255, 255, 255, 0) 100%)',
            backdropFilter: 'blur(10px)',
          }}
        >
          {navItems.map((item) => {
            const isActive = item.key === activeNav
            const Icon = item.icon

            return (
              <ButtonBase
                key={item.key}
                onClick={() => setActiveNav(item.key)}
                sx={{
                  width: '100%',
                  borderRadius: 999,
                  py: 1.25,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.75,
                  color: isActive ? '#000000' : 'rgba(0,0,0,0.55)',
                  transition: 'color 150ms ease',
                }}
              >
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isActive ? 'rgba(255,255,255,0.7)' : 'transparent',
                    boxShadow: isActive ? '0 12px 24px rgba(0,0,0,0.10)' : 'none',
                    transition: 'background-color 150ms ease, box-shadow 150ms ease',
                  }}
                >
                  <Icon sx={{ fontSize: 22 }} />
                </Box>
                <Typography sx={{ fontSize: 12, fontWeight: 500, lineHeight: 1.2 }}>
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
            <Timeline />
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  )
}

export default App
