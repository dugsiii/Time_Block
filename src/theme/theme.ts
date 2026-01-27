import { createTheme } from '@mui/material/styles'

// Task block colors - premium pastels (mint, sage, seafoam)
export const taskColors = [
  '#E3F2FD', // Soft Blue/Cyan
  '#E0F2F1', // Light Mint/Teal (Reference Card 1)
  '#E8F5E9', // Pastel Green
  '#F1F8E9', // Light Lime/Green
  '#F9FBE7', // Soft Yellow/Green
  '#C8E6C9', // Slightly deeper Mint (Reference Card 2)
  '#B2DFDB', // Deeper Teal (Reference Card 3)
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
