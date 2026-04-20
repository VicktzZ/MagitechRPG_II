import { Box } from '@mui/material'

interface OrnamentProps {
    color: string
}

export function Ornament({ color }: OrnamentProps) {
    return (
        <Box
            sx={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                '&:before, &:after': {
                    content: '""',
                    position: 'absolute',
                    width: 24,
                    height: 24,
                    borderColor: color,
                    borderStyle: 'solid',
                    opacity: 0.8
                },
                '&:before': {
                    top: 10,
                    left: 10,
                    borderWidth: '2px 0 0 2px',
                    borderRadius: '6px 0 0 0'
                },
                '&:after': {
                    bottom: 10,
                    right: 10,
                    borderWidth: '0 2px 2px 0',
                    borderRadius: '0 0 6px 0'
                },
                '& .orn2, & .orn3': {
                    position: 'absolute',
                    width: 24,
                    height: 24,
                    borderColor: color,
                    borderStyle: 'solid',
                    opacity: 0.8
                },
                '& .orn2': {
                    top: 10,
                    right: 10,
                    borderWidth: '2px 2px 0 0',
                    borderRadius: '0 6px 0 0'
                },
                '& .orn3': {
                    bottom: 10,
                    left: 10,
                    borderWidth: '0 0 2px 2px',
                    borderRadius: '0 0 0 6px'
                }
            }}
        >
            <Box className="orn2" />
            <Box className="orn3" />
        </Box>
    )
}
