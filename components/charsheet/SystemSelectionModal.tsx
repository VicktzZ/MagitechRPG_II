'use client'

import { useState, useEffect } from 'react'
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
    AutoAwesome as MagicIcon,
    Category as SystemIcon,
    CheckCircle as CheckIcon
} from '@mui/icons-material'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import type { RPGSystem } from '@models/entities'

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

    useEffect(() => {
        if (open && session?.user?.id) {
            setLoading(true)
            fetch(`/api/rpg-system?userId=${session.user.id}`)
                .then(res => res.json())
                .then(data => {
                    setSystems(Array.isArray(data) ? data : [])
                })
                .catch(err => {
                    console.error('Erro ao carregar sistemas:', err)
                    setSystems([])
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

    return (
        <Modal
            open={open}
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
                        boxShadow: 24,
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    {/* Header */}
                    <Box 
                        sx={{ 
                            p: 3, 
                            background: 'linear-gradient(135deg, rgba(39, 136, 205, 0.2), rgba(156, 39, 176, 0.1))',
                            borderBottom: '1px solid',
                            borderColor: 'divider'
                        }}
                    >
                        <Box display="flex" alignItems="center" gap={2}>
                            <SystemIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                            <Box>
                                <Typography variant="h5" fontWeight={700}>
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
                            <Grid container spacing={2}>
                                {/* Sistema Padrão Magitech */}
                                <Grid item xs={12} sm={6} md={4}>
                                    <Paper
                                        onClick={() => setSelectedId(null)}
                                        sx={{
                                            p: 2,
                                            cursor: 'pointer',
                                            border: '2px solid',
                                            borderColor: selectedId === null ? 'primary.main' : 'transparent',
                                            bgcolor: selectedId === null ? 'primary.dark' : 'background.default',
                                            transition: 'all 0.2s ease',
                                            height: '100%',
                                            minHeight: 180,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            position: 'relative',
                                            '&:hover': {
                                                borderColor: 'primary.main',
                                                transform: 'translateY(-2px)',
                                                boxShadow: 4
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
                                            <Typography variant="h6" fontWeight={600}>
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
                                            onClick={() => setSelectedId(system.id)}
                                            sx={{
                                                p: 2,
                                                cursor: 'pointer',
                                                border: '2px solid',
                                                borderColor: selectedId === system.id ? 'secondary.main' : 'transparent',
                                                bgcolor: selectedId === system.id ? 'secondary.dark' : 'background.default',
                                                transition: 'all 0.2s ease',
                                                height: '100%',
                                                minHeight: 180,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                position: 'relative',
                                                '&:hover': {
                                                    borderColor: 'secondary.main',
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: 4
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
                                                <Typography variant="h6" fontWeight={600} noWrap>
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

                                {systems.length === 0 && (
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
