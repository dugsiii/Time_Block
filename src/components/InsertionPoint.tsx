import { Box, IconButton } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { useState } from 'react'

interface InsertionPointProps {
  onClick: () => void
  isActive?: boolean
}

/**
 * InsertionPoint component - hoverable gap between tasks with [+] button
 * Shows on hover, triggers inline form when clicked
 */
export const InsertionPoint = ({
  onClick,
  isActive = false,
}: InsertionPointProps) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Box
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      sx={{
        height: '24px', // Larger hit area
        margin: '-12px 0', // Negative margin to center in gap without adding layout height
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        position: 'relative',
        zIndex: 10,
      }}
    >
      {/* Visual Container - only visible on hover */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          opacity: isHovered || isActive ? 1 : 0,
          transition: 'opacity 200ms ease',
          position: 'relative',
        }}
      >
        {/* Horizontal Line - gives visual cue of insertion placement */}
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            right: 0,
            height: '1px',
            backgroundColor: '#000000',
            opacity: 0.1, // Very subtle
          }}
        />

        {/* Minimalistic Button */}
        <IconButton
          disableRipple
          sx={{
            width: '20px',
            height: '20px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E0E0E0', // Subtle border initially
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            padding: 0,
            zIndex: 1,
            minWidth: 'unset',
            transition: 'all 200ms ease',
            '&:hover': {
              backgroundColor: '#000000',
              borderColor: '#000000',
              transform: 'scale(1.1)',
              '& .MuiSvgIcon-root': {
                color: '#FFFFFF',
              },
            },
          }}
        >
          <AddIcon
            sx={{
              fontSize: '14px',
              color: '#666666', // Subtle icon color
              transition: 'color 200ms ease',
            }}
          />
        </IconButton>
      </Box>
    </Box>
  )
}
