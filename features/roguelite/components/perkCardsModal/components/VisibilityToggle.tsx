import { IconButton } from '@mui/material'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'

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
                bgcolor: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
                width: 56,
                height: 56,
                m: 0,
                '&:hover': {
                    bgcolor: 'rgba(0, 0, 0, 0.9)'
                }
            }}
        >
            {isVisible ? <VisibilityOffIcon /> : <VisibilityIcon />}
        </IconButton>
    )
}
