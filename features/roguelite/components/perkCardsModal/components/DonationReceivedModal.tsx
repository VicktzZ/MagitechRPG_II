'use client'

import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
    Stack,
    Chip,
    alpha,
    useTheme
} from '@mui/material'
import { CardGiftcard, Celebration } from '@mui/icons-material'
import { type ReactElement } from 'react'

export interface DonationNotification {
    id?: string
    donorName: string
    itemName: string
    itemType: 'weapon' | 'armor' | 'item'
    itemRarity?: string
}

interface DonationReceivedModalProps {
    open: boolean
    donation: DonationNotification | null
    onClose: () => void
}

const typeLabels: Record<string, string> = {
    weapon: 'uma arma',
    armor: 'uma armadura',
    item: 'um item'
}

export function DonationReceivedModal({
    open,
    donation,
    onClose
}: DonationReceivedModalProps): ReactElement | null {
    const theme = useTheme()

    if (!donation) return null

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            sx={{
                zIndex: 10001
            }}
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    background: theme.palette.mode === 'dark'
                        ? 'linear-gradient(145deg, #1e3a5f 0%, #2d4a6f 100%)'
                        : 'linear-gradient(145deg, #e3f2fd 0%, #bbdefb 100%)',
                    border: '2px solid',
                    borderColor: alpha(theme.palette.info.main, 0.5)
                }
            }}
        >
            <DialogTitle sx={{ pb: 1, textAlign: 'center' }}>
                <Stack alignItems="center" spacing={1}>
                    <Box
                        sx={{
                            width: 60,
                            height: 60,
                            borderRadius: '50%',
                            bgcolor: alpha(theme.palette.info.main, 0.2),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <CardGiftcard sx={{ fontSize: 32, color: 'info.main' }} />
                    </Box>
                    <Typography variant="h6" fontWeight={700}>
                        Você recebeu um presente! 🎁
                    </Typography>
                </Stack>
            </DialogTitle>

            <DialogContent>
                <Box sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                        <strong>{donation.donorName}</strong> doou {typeLabels[donation.itemType]} para você:
                    </Typography>
                    
                    <Box
                        sx={{
                            p: 2,
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.success.main, 0.1),
                            border: '1px solid',
                            borderColor: alpha(theme.palette.success.main, 0.3),
                            display: 'inline-block'
                        }}
                    >
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography variant="h6" fontWeight={600}>
                                {donation.itemName}
                            </Typography>
                            {donation.itemRarity && (
                                <Chip 
                                    label={donation.itemRarity} 
                                    size="small"
                                    color="success"
                                    variant="outlined"
                                />
                            )}
                        </Stack>
                    </Box>

                    <Box sx={{ mt: 3 }}>
                        <Celebration sx={{ fontSize: 40, color: 'warning.main' }} />
                    </Box>
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2, pt: 1, justifyContent: 'center', gap: 2 }}>
                <Button
                    onClick={onClose}
                    variant="contained"
                    color="info"
                    sx={{ minWidth: 100 }}
                >
                    OK!
                </Button>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    color="info"
                    sx={{ minWidth: 100 }}
                >
                    Legal!
                </Button>
            </DialogActions>
        </Dialog>
    )
}
