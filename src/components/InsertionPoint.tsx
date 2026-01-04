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
      sx={{
        height: '0px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: isHovered || isActive ? 1 : 0,
        transition: 'opacity 150ms ease',
        cursor: 'pointer',
        position: 'relative',
        zIndex: 10,
      }}
    >
      <IconButton
        onClick={onClick}
        sx={{
          width: '24px',
          height: '24px',
          backgroundColor: '#FFFFFF',
          border: '1.5px solid #000000',
          transition: 'all 200ms ease',
          padding: 0,
          minWidth: 'unset',
          '&:hover': {
            backgroundColor: '#000000',
            '& .MuiSvgIcon-root': {
              color: '#FFFFFF',
            },
          },
        }}
      >
        <AddIcon
          sx={{
            fontSize: '16px',
            color: '#000000',
            transition: 'color 200ms ease',
          }}
        />
      </IconButton>
    </Box>
  )
}
