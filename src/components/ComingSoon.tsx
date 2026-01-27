import { Box, Typography } from '@mui/material'

export const ComingSoon = ({ title }: { title: string }) => {
  return (
    <Box
      sx={{
        width: '100%',
        mt: { xs: 4, sm: 6 },
        p: { xs: 4, sm: 6 },
        textAlign: 'center',
        backgroundColor: 'rgba(255,255,255,0.65)',
        borderRadius: '16px',
        border: '1px solid rgba(0,0,0,0.06)',
        boxShadow: '0 10px 26px rgba(0,0,0,0.06)',
      }}
    >
      <Typography sx={{ fontSize: 22, fontWeight: 800, mb: 1 }}>{title}</Typography>
      <Typography color="text.secondary">Coming Soon</Typography>
    </Box>
  )
}
