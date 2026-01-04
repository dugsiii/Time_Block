import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { theme } from './theme/theme'
import { Timeline } from './components/Timeline'
import { useEffect } from 'react'
import { useTaskStore } from './store/taskStore'

function App() {
  // Expose store to window for console testing (optional)
  useEffect(() => {
    ;(window as any).taskStore = useTaskStore
    console.log('✅ Task store available at window.taskStore')
  }, [])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Timeline />
    </ThemeProvider>
  )
}

export default App
