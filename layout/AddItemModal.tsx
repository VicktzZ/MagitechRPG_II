import { Fade, Paper, Stack, Box, Typography, Tooltip, IconButton, Tabs, Tab, Modal } from '@mui/material'
import { Add, Close, TouchApp } from '@mui/icons-material'
import { useState, type ReactElement } from 'react'
import CreateItemModal from '@components/ficha/dialogs/inventoryCreateModals/CreateItemModal'
import { useTheme } from '@mui/material'
import type { Armor, Item, Weapon } from '@types'

type ItemName = 'weapon' | 'item' | 'armor'

export default function AddItemModal({
    modalOpen,
    setModalOpen,
    disableDefaultCreate = false,
    title = 'Adicionar Item ao Inventário',
    subtitle = 'Selecione o tipo de item',
    onConfirm
}: {
    modalOpen: boolean,
    setModalOpen: (open: boolean) => void,
    disableDefaultCreate?: boolean,
    title?: string,
    subtitle?: string,
    onConfirm?: (item: Weapon | Item | Armor) => void
}) {
    const [ modalContent, setModalContent ] = useState<ReactElement>(
        <CreateItemModal
            itemType={'weapon'}
            disableDefaultCreate={disableDefaultCreate}
            onClose={() => { setModalOpen(false) }}
            onConfirm={params => { onConfirm?.(params); setModalOpen(false) }}
        />
    )

    const [ selectedTab, setSelectedTab ] = useState<ItemName>('weapon')

    const handleTabChange = (_: React.SyntheticEvent, newValue: ItemName) => {
        setSelectedTab(newValue)

        setModalContent(
            <CreateItemModal
                itemType={newValue}
                disableDefaultCreate={disableDefaultCreate}
                onClose={() => { setModalOpen(false) }}
                onConfirm={params => { onConfirm?.(params); setModalOpen(false) }}
            />
        )
    }

    const theme = useTheme()

    return (
        <Modal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            closeAfterTransition
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                p: 2
            }}
        >
            <Fade in={modalOpen}>
                <Paper
                    elevation={8}
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        minHeight: {
                            xs: '85%',
                            sm: '80%',
                            md: '70%'
                        },
                        maxHeight: '90%',
                        width: '95%',
                        maxWidth: '1600px',
                        borderRadius: 2,
                        overflow: 'hidden',
                        border: `1px solid ${theme.palette.divider}`,
                        transition: 'all 0.2s ease'
                    }}
                >
                    {/* Header do Modal */}
                    <Paper elevation={0} sx={{ p: { xs: 1.5, sm: 2 }, bgcolor: 'background.paper', borderRadius: 0, borderBottom: `1px solid ${theme.palette.divider}` }}>
                        <Stack direction='row' alignItems='center' justifyContent='space-between'>
                            <Stack direction='row' alignItems='center' spacing={1.5}>
                                <Add sx={{ color: 'text.secondary' }} />
                                <Box>
                                    <Typography variant='h6' fontWeight="bold">
                                        {title}
                                    </Typography>
                                    <Typography variant="caption" color='text.secondary' sx={{ display: { xs: 'none', sm: 'block' } }}>
                                        {subtitle}
                                    </Typography>
                                </Box>
                            </Stack>
                            <Tooltip title="Fechar" arrow>
                                <IconButton onClick={() => setModalOpen(false)}>
                                    <Close />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    </Paper>

                    {/* Tabs */}
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                        <Tabs value={selectedTab} onChange={handleTabChange}>
                            <Tab label="Arma" value="weapon" />
                            <Tab label="Armadura" value="armor" />
                            <Tab label="Item" value="item" />
                        </Tabs>
                    </Box>

                    {/* Conteúdo */}
                    <Box
                        sx={{
                            flex: 1,
                            overflow: 'auto',
                            p: { xs: 1.5, sm: 2, md: 3 }
                        }}
                    >
                        {modalContent ? (
                            <Fade in={!!modalContent} timeout={500}>
                                <Box>{modalContent}</Box>
                            </Fade>
                        ) : (
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: '100%',
                                    opacity: 0.8,
                                    p: 3
                                }}
                            >
                                <TouchApp sx={{ fontSize: 32, color: 'text.disabled', mb: 1 }} />
                                <Typography variant="body1" align="center" fontWeight="medium" color="text.secondary">
                                    Selecione um tipo de item acima para começar
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Paper>
            </Fade>
        </Modal>
    )
}