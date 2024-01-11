import { Box, Modal, useTheme } from '@mui/material';
import { memo } from 'react';

const MagicsModal = memo(({ open, onClose }: { open: boolean, onClose: () => void}) => {
    const theme = useTheme()

    return (
        <Modal
            open={open}
            onClose={onClose}
            disableAutoFocus
            disableEnforceFocus
            disableRestoreFocus
            sx={{
                height: '100vh',
                width: '100vw',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >   
            <Box
                sx={{
                    height: '90%',
                    width: '90%',
                    bgcolor: 'background.paper3',
                    borderRadius: 3
                }}
            >

            </Box>
        </Modal>
    )
})

MagicsModal.displayName = 'MagicsModal'
export default MagicsModal