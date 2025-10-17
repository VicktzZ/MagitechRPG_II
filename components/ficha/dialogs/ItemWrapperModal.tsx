import { type SxProps, useTheme, Modal, Zoom, Paper, alpha, Box, Avatar, Typography, IconButton } from '@mui/material'
import { Close } from '@mui/icons-material'
import type { ReactElement } from 'react'
import type { ItemAttributes } from '@types'
import { itemAttributes } from '@constants'

export function ItemWrapperModal({
    open,
    onClose,
    children,
    itemType = 'item',
    sx
}: {
    open: boolean,
    onClose: () => void,
    children: ReactElement | ReactElement[],
    itemType?: keyof ItemAttributes,
    sx?: SxProps
}): ReactElement {
    const theme = useTheme()
    const itemAttr = itemAttributes[itemType]

    return (
        <Modal
            open={open}
            onClose={onClose}
            closeAfterTransition
            sx={{
                height: '100vh',
                width: '100vw',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backdropFilter: 'blur(4px)',
                ...sx
            }}
        >
            <Zoom in={open}>
                <Paper
                    elevation={8}
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        height: '90%',
                        width: '90%',
                        maxWidth: '1200px',
                        overflow: 'hidden',
                        borderRadius: 3,
                        border: `1px solid ${alpha(itemAttr.color, 0.4)}`
                    }}
                >
                    <Box
                        display='flex'
                        justifyContent='space-between'
                        alignItems='center'
                        px={3}
                        py={2}
                        bgcolor={alpha(itemAttr.color, 0.15)}
                        borderBottom={`1px solid ${alpha(itemAttr.color, 0.3)}`}
                    >
                        <Box display='flex' alignItems='center' gap={1.5}>
                            <Avatar
                                sx={{
                                    bgcolor: alpha(itemAttr.color, 0.2),
                                    color: itemAttr.color,
                                    border: `1px solid ${alpha(itemAttr.color, 0.5)}`
                                }}
                            >
                                <itemAttr.icon />
                            </Avatar>
                            <Typography
                                variant='h6'
                                fontFamily='Sakana'
                                color={itemAttr.color}
                                sx={{ textShadow: `0 0 10px ${alpha(itemAttr.color, 0.3)}` }}
                            >
                                Detalhes do {itemAttr.label}
                            </Typography>
                        </Box>
                        <IconButton onClick={onClose} color='inherit'>
                            <Close />
                        </IconButton>
                    </Box>

                    {/* Conteúdo com scroll */}
                    <Box
                        display='flex'
                        flexDirection='column'
                        flex={1}
                        p={3}
                        sx={{
                            overflowY: 'auto',
                            '::-webkit-scrollbar': {
                                width: '8px'
                            },
                            '::-webkit-scrollbar-track': {
                                background: alpha(theme.palette.background.paper, 0.1)
                            },
                            '::-webkit-scrollbar-thumb': {
                                background: alpha(itemAttr.color, 0.2),
                                borderRadius: '4px'
                            },
                            '::-webkit-scrollbar-thumb:hover': {
                                background: alpha(itemAttr.color, 0.4)
                            }
                        }}
                    >
                        {children}
                    </Box>
                </Paper>
            </Zoom>
        </Modal>
    )
}