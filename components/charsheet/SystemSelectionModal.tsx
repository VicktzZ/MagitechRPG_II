'use client'

import { useState, useEffect, type KeyboardEvent } from 'react'
import {
    Modal,
    Box,
    Typography,
    Button,
    Grid,
    Paper,
    CircularProgress,
    Chip,
    Divider,
    Alert,
    Fade,
    Tooltip
} from '@mui/material'
import {
    Public as PublicIcon,
    Lock as LockIcon,
    AutoStories as MagicIcon,
    Category as SystemIcon,
    CheckCircle as CheckIcon
} from '@mui/icons-material'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import type { RPGSystem } from '@models/entities'
import { color, shadow } from '@themes/tokens'

interface SystemSelectionModalProps {
    open: boolean
    onSelect: (system: RPGSystem | null) => void
}

export default function SystemSelectionModal({ open, onSelect }: SystemSelectionModalProps) {
    const { data: session } = useSession()
    const router = useRouter()
    const [ systems, setSystems ] = useState<RPGSystem[]>([])
    const [ loading, setLoading ] = useState(true)
    const [ selectedId, setSelectedId ] = useState<string | null>(null)
    const [ loadFailed, setLoadFailed ] = useState(false)

    useEffect(() => {
        if (open && session?.user?.id) {
            setLoading(true)
            setLoadFailed(false)
            fetch(`/api/rpg-system?userId=${session.user.id}`)
                .then(async res => {
                    // Resposta de erro não é lista de sistemas
                    if (!res.ok) throw new Error(`HTTP ${res.status}`)
                    return await res.json()
                })
                .then(data => {
                    setSystems(Array.isArray(data) ? data : [])
                })
                .catch(() => {
                    setSystems([])
                    setLoadFailed(true)
                })
                .finally(() => setLoading(false))
        }
    }, [ open, session?.user?.id ])

    const handleSelect = () => {
        if (selectedId === null) {
            // Sistema padrão Magitech
            onSelect(null)
        } else {
            const system = systems.find(s => s.id === selectedId)
            onSelect(system || null)
        }
    }

    const handleCancel = () => {
        router.push('/app')
    }

    const selectOnKey = (event: KeyboardEvent, id: string | null) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            setSelectedId(id)
        }
    }

    return (
        <Modal
            open={open}
            aria-labelledby='system-selection-title'
            onClose={() => {}}
            disableEscapeKeyDown
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <Fade in={open}>
                <Box
                    sx={{
                        width: '90%',
                        maxWidth: 800,
                        maxHeight: '90vh',
                        bgcolor: 'background.paper',
                        borderRadius: 3,
                        boxShadow: shadow.overlay,
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    {/* Header */}
                    <Box 
                        sx={{ 
                            p: 3, 
                            bgcolor: 'background.raised',
                            borderBottom: '1px solid',
                            borderColor: 'divider'
                        }}
                    >
                        <Box display="flex" alignItems="center" gap={2}>
                            <SystemIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                            <Box>
                                <Typography variant="h5" component="h2" id='system-selection-title' fontWeight={700}>
                                    Selecione um Sistema de RPG
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Escolha o sistema que será usado para criar sua ficha de personagem
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    {/* Content */}
                    <Box sx={{ p: 3, overflow: 'auto', flex: 1 }}>
                        {loading ? (
                            <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <Grid container spacing={2} role='radiogroup' aria-labelledby='system-selection-title'>
                                {/* Sistema Padrão Magitech */}
                                <Grid item xs={12} sm={6} md={4}>
                                    <Paper
                                        role='radio'
                                        tabIndex={0}
                                        aria-checked={selectedId === null}
                                        onClick={() => setSelectedId(null)}
                                        onKeyDown={event => selectOnKey(event, null)}
                                        sx={{
                                            p: 2,
                                            cursor: 'pointer',
                                            border: '2px solid',
                                            borderColor: selectedId === null ? color.amberLine : 'transparent',
                                            bgcolor: selectedId === null ? color.amberSubtle : 'background.raised',
                                            transition: 'border-color 120ms, background-color 120ms',
                                            height: '100%',
                                            minHeight: 180,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            position: 'relative',
                                            '&:hover': {
                                                borderColor: selectedId === null ? color.amberLine : color.borderStrong
                                            }
                                        }}
                                    >
                                        {selectedId === null && (
                                            <CheckIcon 
                                                sx={{ 
                                                    position: 'absolute', 
                                                    top: 8, 
                                                    right: 8,
                                                    color: 'primary.main'
                                                }} 
                                            />
                                        )}
                                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                                            <MagicIcon sx={{ color: 'primary.main' }} />
                                            <Typography variant="h6" component="h3" fontWeight={600}>
                                                Magitech RPG
                                            </Typography>
                                        </Box>
                                        <Chip 
                                            label="Sistema Padrão" 
                                            size="small" 
                                            color="primary"
                                            sx={{ alignSelf: 'flex-start', mb: 1 }}
                                        />
                                        <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                                            O sistema original Magitech RPG com todas as classes, raças, linhagens e magias do jogo base.
                                        </Typography>
                                        <Box display="flex" gap={0.5} mt={1} flexWrap="wrap">
                                            <Chip label="8 Classes" size="small" variant="outlined" />
                                            <Chip label="6 Atributos" size="small" variant="outlined" />
                                            <Chip label="Magias" size="small" variant="outlined" />
                                        </Box>
                                    </Paper>
                                </Grid>

                                {/* Sistemas customizados */}
                                {systems.map((system) => (
                                    <Grid item xs={12} sm={6} md={4} key={system.id}>
                                        <Paper
                                            role='radio'
                                            tabIndex={0}
                                            aria-checked={selectedId === system.id}
                                            onClick={() => setSelectedId(system.id)}
                                            onKeyDown={event => selectOnKey(event, system.id)}
                                            sx={{
                                                p: 2,
                                                cursor: 'pointer',
                                                border: '2px solid',
                                                borderColor: selectedId === system.id ? color.amberLine : 'transparent',
                                                bgcolor: selectedId === system.id ? color.amberSubtle : 'background.raised',
                                                transition: 'border-color 120ms, background-color 120ms',
                                                height: '100%',
                                                minHeight: 180,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                position: 'relative',
                                                '&:hover': {
                                                    borderColor: selectedId === system.id ? color.amberLine : color.borderStrong
                                                }
                                            }}
                                        >
                                            {selectedId === system.id && (
                                                <CheckIcon 
                                                    sx={{ 
                                                        position: 'absolute', 
                                                        top: 8, 
                                                        right: 8,
                                                        color: 'secondary.main'
                                                    }} 
                                                />
                                            )}
                                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                                                <SystemIcon sx={{ color: 'secondary.main' }} />
                                                <Typography variant="h6" component="h3" fontWeight={600} noWrap>
                                                    {system.name}
                                                </Typography>
                                            </Box>
                                            <Box display="flex" gap={0.5} mb={1}>
                                                <Tooltip title={system.isPublic ? 'Sistema público' : 'Sistema privado'}>
                                                    <Chip 
                                                        icon={system.isPublic ? <PublicIcon /> : <LockIcon />}
                                                        label={system.isPublic ? 'Público' : 'Privado'} 
                                                        size="small"
                                                        color={system.isPublic ? 'info' : 'default'}
                                                    />
                                                </Tooltip>
                                            </Box>
                                            <Typography 
                                                variant="body2" 
                                                color="text.secondary" 
                                                sx={{ 
                                                    flex: 1,
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden'
                                                }}
                                            >
                                                {system.description || 'Sem descrição'}
                                            </Typography>
                                            <Box display="flex" gap={0.5} mt={1} flexWrap="wrap">
                                                {(system.classes?.length || 0) > 0 && (
                                                    <Chip 
                                                        label={`${system.classes?.length} ${system.conceptNames?.class || 'Classes'}`} 
                                                        size="small" 
                                                        variant="outlined" 
                                                    />
                                                )}
                                                {(system.attributes?.length || 0) > 0 && (
                                                    <Chip 
                                                        label={`${system.attributes?.length} Atributos`} 
                                                        size="small" 
                                                        variant="outlined" 
                                                    />
                                                )}
                                                {system.enabledFields?.spells && (
                                                    <Chip 
                                                        label={system.conceptNames?.spell || 'Magias'} 
                                                        size="small" 
                                                        variant="outlined" 
                                                    />
                                                )}
                                            </Box>
                                        </Paper>
                                    </Grid>
                                ))}

                                {loadFailed && (
                                    <Grid item xs={12}>
                                        <Alert severity="error" sx={{ mt: 2 }}>
                                            Não foi possível carregar seus sistemas. Você pode continuar com o sistema padrão ou recarregar a página.
                                        </Alert>
                                    </Grid>
                                )}

                                {systems.length === 0 && !loadFailed && (
                                    <Grid item xs={12}>
                                        <Alert severity="info" sx={{ mt: 2 }}>
                                            Você ainda não tem sistemas customizados. Use o sistema padrão Magitech RPG ou crie um novo sistema em <strong>Admin → Sistemas</strong>.
                                        </Alert>
                                    </Grid>
                                )}
                            </Grid>
                        )}
                    </Box>

                    {/* Footer */}
                    <Divider />
                    <Box 
                        sx={{ 
                            p: 2, 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            bgcolor: 'background.default'
                        }}
                    >
                        <Button 
                            variant="outlined" 
                            onClick={handleCancel}
                        >
                            Cancelar
                        </Button>
                        <Button 
                            variant="contained" 
                            onClick={handleSelect}
                            disabled={loading}
                            startIcon={<CheckIcon />}
                        >
                            Continuar com {selectedId === null ? 'Magitech RPG' : systems.find(s => s.id === selectedId)?.name}
                        </Button>
                    </Box>
                </Box>
            </Fade>
        </Modal>
    )
}
