import { Box } from '@mui/material'

export function Shine() {
    return (
        <Box
            sx={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                background:
                    'radial-gradient(600px circle at var(--mx) var(--my), rgba(255,255,255,0.15), transparent 40%)',
                transition: 'background 120ms ease-out',
                borderRadius: 3
            }}
        />
    )
}
