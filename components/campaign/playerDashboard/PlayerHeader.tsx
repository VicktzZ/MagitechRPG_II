'use client'

import {
    Add as AddIcon,
    AutoAwesome,
    Cake,
    Favorite,
    FlashOn,
    LocalFireDepartment,
    Psychology,
    Remove as RemoveIcon,
    Shield,
    Speed,
    Star,
    TrendingUp,
    Wc
} from '@mui/icons-material';
import {
    Avatar,
    Box,
    Chip,
    Divider,
    Grid,
    IconButton,
    LinearProgress,
    Paper,
    Stack,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material';
import { blue, green, grey, purple, red, yellow } from '@mui/material/colors';
import { useState, type ReactElement } from 'react';
import { useCampaignCurrentFichaContext } from '@contexts';

interface PlayerHeaderProps {
    avatar: string
}

interface StatusBarProps {
    label: string
    current: number
    max: number
    color: string
    icon: ReactElement
    onIncrease: () => void
    onDecrease: () => void
}

function StatusBar({ label, current, max, color, icon, onIncrease, onDecrease }: StatusBarProps) {
    const percentage = Math.min((current / max) * 100, 100)
    const theme = useTheme()
    
    return (
        <Box sx={{ minWidth: 200 }}>
            <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                {icon}
                <Typography variant="body2" fontWeight={600} color="text.secondary">
                    {label}
                </Typography>
                <Typography variant="body2" fontWeight={700} sx={{ ml: 'auto' }}>
                    {current}/{max}
                </Typography>
            </Stack>
            
            <Box sx={{ position: 'relative', mb: 1 }}>
                <LinearProgress
                    variant="determinate"
                    value={percentage}
                    sx={{
                        height: 12,
                        borderRadius: 6,
                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                        '& .MuiLinearProgress-bar': {
                            borderRadius: 6,
                            bgcolor: color,
                            background: `linear-gradient(90deg, ${color} 0%, ${color}dd 100%)`
                        }
                    }}
                />
                <Typography
                    variant="caption"
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        color: percentage > 50 ? 'white' : 'text.primary',
                        fontWeight: 700,
                        fontSize: '0.7rem',
                        textShadow: percentage > 50 ? '1px 1px 2px rgba(0,0,0,0.5)' : 'none'
                    }}
                >
                    {Math.round(percentage)}%
                </Typography>
            </Box>
            
            <Stack direction="row" spacing={1} justifyContent="center">
                <Tooltip title={`Diminuir ${label}`}>
                    <IconButton
                        size="small"
                        onClick={onDecrease}
                        disabled={current <= 0}
                        sx={{
                            bgcolor: red[100],
                            color: red[600],
                            '&:hover': { bgcolor: red[200] },
                            '&:disabled': { bgcolor: grey[100], color: grey[400] }
                        }}
                    >
                        <RemoveIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
                
                <Tooltip title={`Aumentar ${label}`}>
                    <IconButton
                        size="small"
                        onClick={onIncrease}
                        disabled={current >= max}
                        sx={{
                            bgcolor: green[100],
                            color: green[600],
                            '&:hover': { bgcolor: green[200] },
                            '&:disabled': { bgcolor: grey[100], color: grey[400] }
                        }}
                    >
                        <AddIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Stack>
        </Box>
    )
}

export default function PlayerHeader({ avatar }: PlayerHeaderProps): ReactElement {
    const { ficha, updateFicha } = useCampaignCurrentFichaContext()
    const theme = useTheme()
    
    const isSmall = useMediaQuery(theme.breakpoints.down('sm'))

    const [ currentAttributes, setCurrentAttributes ] = useState({
        lp: ficha.attributes.lp,
        mp: ficha.attributes.mp,
        ap: ficha.attributes.ap
    })

    const updateAttribute = (attr: 'lp' | 'mp' | 'ap', change: number) => {
        const currentValue = currentAttributes[attr] || 0
        const maxKey = `max${attr.charAt(0).toUpperCase() + attr.slice(1)}` as 'maxLp' | 'maxMp' | 'maxAp'
        const maxValue = ficha.attributes[maxKey] || 0
        const newValue = Math.max(0, Math.min(currentValue + change, maxValue))
        
        setCurrentAttributes(prev => ({
            ...prev,
            [attr]: newValue
        }))

        updateFicha({
            attributes: {
                ...ficha.attributes,
                [attr]: newValue
            }
        })
    }

    const getElementIcon = (element: string) => {
        switch (element?.toLowerCase()) {
        case 'fogo': return <LocalFireDepartment sx={{ color: red[500] }} />
        case 'água': return <Psychology sx={{ color: blue[500] }} />
        case 'terra': return <Shield sx={{ color: green[700] }} />
        case 'ar': return <FlashOn sx={{ color: grey[400] }} />
        default: return <AutoAwesome sx={{ color: purple[500] }} />
        }
    }

    const getGenderIcon = () => {
        return <Wc sx={{ color: theme.palette.text.secondary }} />
    }

    return (
        <Paper 
            elevation={4}
            sx={{
                p: { xs: 2, md: 4 },
                mb: 4,  
                borderRadius: 3,
                background: theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, #1a2332 0%, #2d3748 100%)'
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)'
                }
            }}
        >
            <Box position="relative" zIndex={1}>
                <Grid container spacing={3} alignItems="center">
                    {/* Avatar e Informações Básicas */}
                    <Grid item xs={12} md={4}>
                        <Stack 
                            direction={{ xs: 'column', sm: 'row', md: 'column' }}
                            alignItems="center" 
                            spacing={2}
                        >
                            <Avatar
                                src={avatar}
                                alt={ficha.name}
                                sx={{ 
                                    width: { xs: 80, md: 120 }, 
                                    height: { xs: 80, md: 120 },
                                    border: '4px solid rgba(255,255,255,0.3)',
                                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
                                }}
                            />
                            
                            <Stack spacing={1} alignItems={{ xs: 'center', sm: 'flex-start', md: 'center' }}>
                                <Typography 
                                    variant={isSmall ? 'h5' : 'h4'} 
                                    sx={{ 
                                        fontWeight: 700,
                                        textAlign: 'center',
                                        textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                                    }}
                                >
                                    {ficha.name}
                                </Typography>
                                
                                <Typography 
                                    variant="subtitle1" 
                                    sx={{ 
                                        opacity: 0.9,
                                        textAlign: 'center',
                                        fontWeight: 500
                                    }}
                                >
                                    {ficha.playerName}
                                </Typography>
                            </Stack>
                        </Stack>
                    </Grid>

                    {/* Informações do Personagem */}
                    <Grid item xs={12} md={4}>
                        <Stack spacing={2}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                Informações do Personagem
                            </Typography>
                            
                            <Stack spacing={1.5}>
                                <Stack direction="row" flexWrap="wrap" gap={1}>
                                    <Chip 
                                        icon={<Star />}
                                        label={`Nível ${ficha.level}`} 
                                        sx={{ 
                                            bgcolor: 'rgba(255,255,255,0.2)',
                                            color: 'white',
                                            fontWeight: 600,
                                            '& .MuiChip-icon': { color: 'white' }
                                        }}
                                    />
                                    <Chip 
                                        icon={<Shield />}
                                        label={ficha.class as string} 
                                        sx={{ 
                                            bgcolor: 'rgba(255,255,255,0.2)',
                                            color: 'white',
                                            fontWeight: 600,
                                            '& .MuiChip-icon': { color: 'white' }
                                        }}
                                    />
                                </Stack>

                                <Stack direction="row" flexWrap="wrap" gap={1}>
                                    <Chip 
                                        label={ficha.lineage as string} 
                                        sx={{ 
                                            bgcolor: 'rgba(255,255,255,0.15)',
                                            color: 'white',
                                            fontWeight: 500
                                        }}
                                    />
                                    {ficha.subclass && (
                                        <Chip 
                                            label={ficha.subclass as string} 
                                            sx={{ 
                                                bgcolor: 'rgba(255,255,255,0.15)',
                                                color: 'white',
                                                fontWeight: 500
                                            }}
                                        />
                                    )}
                                </Stack>

                                <Stack direction="row" flexWrap="wrap" gap={1}>
                                    <Chip 
                                        icon={getElementIcon(ficha.elementalMastery as string)}
                                        label={ficha.elementalMastery as string} 
                                        sx={{ 
                                            bgcolor: 'rgba(255,255,255,0.15)',
                                            color: 'white',
                                            fontWeight: 500,
                                            '& .MuiChip-icon': { color: 'white' }
                                        }}
                                    />
                                    <Chip 
                                        icon={getGenderIcon(ficha.gender as string)}
                                        label={ficha.gender as string} 
                                        sx={{ 
                                            bgcolor: 'rgba(255,255,255,0.15)',
                                            color: 'white',
                                            fontWeight: 500,
                                            '& .MuiChip-icon': { color: 'white' }
                                        }}
                                    />
                                    <Chip 
                                        icon={<Cake />}
                                        label={`${ficha.age} anos`} 
                                        sx={{ 
                                            bgcolor: 'rgba(255,255,255,0.15)',
                                            color: 'white',
                                            fontWeight: 500,
                                            '& .MuiChip-icon': { color: 'white' }
                                        }}
                                    />
                                </Stack>
                            </Stack>
                        </Stack>
                    </Grid>

                    {/* Atributos de Status */}
                    <Grid item xs={12} md={4}>
                        <Stack spacing={2}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                Status
                            </Typography>
                            
                            <Stack spacing={2}>
                                <StatusBar
                                    label="Pontos de Vida"
                                    current={currentAttributes.lp}
                                    max={ficha.attributes.maxLp}
                                    color={red[500]}
                                    icon={<Favorite sx={{ color: red[300] }} />}
                                    onIncrease={() => updateAttribute('lp', 1)}
                                    onDecrease={() => updateAttribute('lp', -1)}
                                />
                                
                                <StatusBar
                                    label="Pontos de Mana"
                                    current={currentAttributes.mp}
                                    max={ficha.attributes.maxMp}
                                    color={blue[500]}
                                    icon={<AutoAwesome sx={{ color: blue[300] }} />}
                                    onIncrease={() => updateAttributeLocal('mp', 1)}
                                    onDecrease={() => updateAttributeLocal('mp', -1)}
                                />
                                
                                <StatusBar
                                    label="Pontos de Armadura"
                                    current={currentAttributes.ap}
                                    max={ficha.attributes.maxAp}
                                    color={yellow[600]}
                                    icon={<Shield sx={{ color: yellow[300] }} />}
                                    onIncrease={() => updateAttributeLocal('ap', 1)}
                                    onDecrease={() => updateAttributeLocal('ap', -1)}
                                />
                            </Stack>
                        </Stack>
                    </Grid>
                </Grid>

                {/* Atributos Secundários */}
                <Divider sx={{ my: 3, bgcolor: 'rgba(255,255,255,0.2)' }} />
                
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <Psychology sx={{ color: 'rgba(255,255,255,0.7)' }} />
                            <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                Limite MP Diário:
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                {ficha.mpLimit}
                            </Typography>
                        </Stack>
                    </Grid>
                    
                    <Grid item xs={12} sm={4}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <TrendingUp sx={{ color: 'rgba(255,255,255,0.7)' }} />
                            <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                Overall:
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                {ficha.overall || 0}
                            </Typography>
                        </Stack>
                    </Grid>
                    
                    <Grid item xs={12} sm={4}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <Speed sx={{ color: 'rgba(255,255,255,0.7)' }} />
                            <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                Deslocamento:
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                {ficha.displacement}m
                            </Typography>
                        </Stack>
                    </Grid>
                </Grid>
            </Box>
        </Paper>
    )
}
