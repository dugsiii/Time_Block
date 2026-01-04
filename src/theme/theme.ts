import { createTheme } from '@mui/material/styles'

// Task block colors - alternating greens (pastel to forest)
export const taskColors = [
  '#E8F5E9', // Green 1: Pastel green (very light, soft)
  '#C8E6C9', // Green 2: Light mint green
  '#A5D6A7', // Green 3: Medium green
  '#81C784', // Green 4: Medium-dark green
  '#66BB6A', // Green 5: Forest green (richest)
]

// Special state colors
export const colors = {
  lockIcon: '#FFB74D',      // Pastel orange for lock icon
  overlapBorder: '#EF5350', // Red for overlap warning
  insertionButton: '#000000', // Black for [+] button
}

// Minimalistic black & white theme with green task blocks
export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#000000', // Black for buttons and accents
    },
    secondary: {
      main: '#666666', // Medium gray for secondary text
    },
    background: {
      default: '#FFFFFF', // Pure white background
      paper: '#FFFFFF',   // Pure white for surfaces
    },
    text: {
      primary: '#000000',   // Black for main text
      secondary: '#666666', // Medium gray for secondary text
    },
    error: {
      main: '#EF5350', // Red for warnings/errors
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h6: {
      fontSize: '18px',
      fontWeight: 600,
      color: '#000000',
    },
    body1: {
      fontSize: '15px',
      fontWeight: 400,
      color: '#000000',
    },
    body2: {
      fontSize: '13px',
      fontWeight: 400,
      color: '#666666',
    },
    button: {
      fontSize: '15px',
      fontWeight: 500,
      textTransform: 'none', // No uppercase transformation
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '6px',
          textTransform: 'none',
          fontWeight: 500,
        },
        contained: {
          backgroundColor: '#000000',
          color: '#FFFFFF',
          boxShadow: 'none',
          '&:hover': {
            backgroundColor: '#333333',
            boxShadow: 'none',
          },
        },
        outlined: {
          borderColor: '#E0E0E0',
          color: '#666666',
          '&:hover': {
            borderColor: '#000000',
            backgroundColor: 'transparent',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          boxShadow: 'none', // No shadow by default
          border: 'none',     // No border by default (spacing provides separation)
          transition: 'box-shadow 150ms ease',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)', // Subtle shadow on hover
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#E0E0E0',
            },
            '&:hover fieldset': {
              borderColor: '#000000',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#000000',
              borderWidth: '2px',
            },
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: '#000000',
          '&:hover': {
            backgroundColor: 'rgba(0,0,0,0.04)',
          },
        },
      },
    },
  },
})

// Helper function to get task color based on index
export const getTaskColor = (index: number): string => {
  return taskColors[index % taskColors.length]
}
