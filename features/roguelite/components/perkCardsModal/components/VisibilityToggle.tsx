import { alpha, IconButton } from '@mui/material'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import { color } from '@themes/tokens'

interface VisibilityToggleProps {
    isVisible: boolean
    onToggle: () => void
}

export function VisibilityToggle({ isVisible, onToggle }: VisibilityToggleProps) {
    return (
        <IconButton
            onClick={onToggle}
            sx={{
                position: 'fixed',
                top: 40,
                right: 20,
                zIndex: 9999,
                bgcolor: alpha(color.canvas, 0.8),
                color: 'text.primary',
                width: 56,
                height: 56,
                m: 0,
                '&:hover': {
                    bgcolor: alpha(color.canvas, 0.9)
                }
            }}
        >
            {isVisible ? <VisibilityOffIcon /> : <VisibilityIcon />}
        </IconButton>
    )
}
