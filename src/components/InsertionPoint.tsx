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
        height: '32px', // Height for the hover area above task
        marginBottom: '-8px', // Pull it closer to the task below
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
        {/* Minimalistic Button */}
        <IconButton
          disableRipple
          sx={{
            width: '24px',
            height: '24px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E0E0E0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            padding: 0,
            zIndex: 1,
            minWidth: 'unset',
            transition: 'all 200ms ease',
            '&:hover': {
              backgroundColor: '#000000',
              borderColor: '#000000',
              transform: 'scale(1.15)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              '& .MuiSvgIcon-root': {
                color: '#FFFFFF',
              },
            },
          }}
        >
          <AddIcon
            sx={{
              fontSize: '16px',
              color: '#666666',
              transition: 'color 200ms ease',
            }}
          />
        </IconButton>
      </Box>
    </Box>
  )
}
