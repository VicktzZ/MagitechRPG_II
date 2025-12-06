/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
'use client'

import { useCampaignContext } from '@contexts';
import { useFirestoreRealtime } from '@hooks/useFirestoreRealtime';
import {
    CardGiftcard,
    ExpandMore,
    People,
    SupervisorAccount
} from '@mui/icons-material';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Avatar,
    Box,
    Chip,
    Paper,
    Skeleton,
    Snackbar,
    Stack,
    Tooltip,
    Typography,
    useTheme
} from '@mui/material';
import { amber, blue, green, orange, purple, red } from '@mui/material/colors';
import { type ReactElement, useMemo, useState } from 'react';
import PlayerCard from './PlayerCard';
import { PerkCardsModal } from '@features/roguelite/components';
import { iconForRarity } from '@features/roguelite/utils';

interface SectionProps {
    title: string;
    icon: React.ReactElement;
    children: React.ReactNode;
    sx?: any;
}

function Section({ title, icon, children, sx }: SectionProps) {
    const theme = useTheme();
    
    return (
        <Paper 
            elevation={2}
            sx={{ 
                p: 3, 
                borderRadius: 3,
                background: theme.palette.mode === 'dark'
                    ? 'linear-gradient(145deg, #1e293b 0%, #334155 100%)'
                    : 'linear-gradient(145deg, #f8fafc 0%, #e2e8f0 100%)',
                border: '1px solid',
                borderColor: 'divider',
                transition: 'all 0.3s ease',
                '&:hover': {
                    boxShadow: 4,
                    transform: 'translateY(-2px)'
                },
                ...sx
            }}
        >
            <Stack spacing={3}>
                <Box display="flex" alignItems="center" gap={2}>
                    {icon}
                    <Typography 
                        variant="h5" 
                        sx={{ 
                            fontWeight: 700,
                            color: 'primary.main'
                        }}
                    >
                        {title}
                    </Typography>
                </Box>
                {children}
            </Stack>
        </Paper>
    );
}

export default function CampaignGMDashboard(): ReactElement | null {
    const { campaign, users, charsheets } = useCampaignContext()
    
    const theme = useTheme();
    const [ expandedPlayer, setExpandedPlayer ] = useState<string | false>(false);
    
    // const queryClient = useQueryClient()

    const { data: playerCharsheets, loading: isPlayerCharsheetsPending } = useFirestoreRealtime('charsheet', {
        filters: [
            { field: 'id', operator: 'in', value: charsheets.map(f => f.id) }
        ],
        enabled: charsheets.length > 0
    })

    const players = useMemo(() => {
        return users.players?.map(player => {
            const playerCharsheet = playerCharsheets?.find(f => f.userId === player.id)
    
            return {
                id: player.id,
                name: player.name,
                avatar: player.image ?? '/assets/default-avatar.jpg',
                status: [],
                charsheet: playerCharsheet
            }
        })
    }, [ users, playerCharsheets ])

    const campaignStats = useMemo(() => {
        const totalPlayers = players?.length ?? 0;
        const activePlayers = players?.filter(p => p.charsheet).length ?? 0;
        const averageLevel = playerCharsheets?.length 
            ? Math.round(playerCharsheets.reduce((sum, f) => sum + f.level, 0) / playerCharsheets.length)
            : 0;
        const highestLevel = playerCharsheets?.length 
            ? Math.max(...playerCharsheets.map(f => f.level))
            : 0;
        
        return {
            totalPlayers,
            activePlayers,
            averageLevel,
            highestLevel
        };
    }, [ players, playerCharsheets ]);

    // Extrai vantagens adquiridas por cada jogador (apenas para Roguelite)
    const playersWithPerks = useMemo(() => {
        if (campaign.mode !== 'Roguelite' || !playerCharsheets) return [];
        
        return playerCharsheets.map(charsheet => {
            // Busca a sessão da campanha atual
            const session = charsheet.session?.find((s: any) => s.campaignCode === campaign.campaignCode);
            const perks = session?.perks || [];
            
            return {
                charsheetId: charsheet.id,
                charsheetName: charsheet.name,
                level: charsheet.level,
                perks
            };
        }).filter(p => p.perks.length > 0);
    }, [campaign.mode, campaign.campaignCode, playerCharsheets]);

    // Função para obter cor por tipo de perk
    const getPerkTypeColor = (perkType: string) => {
        switch (perkType) {
            case 'WEAPON': return { bg: red[100], color: red[800] };
            case 'ARMOR': return { bg: blue[100], color: blue[800] };
            case 'ITEM': return { bg: amber[100], color: amber[800] };
            case 'SKILL': 
            case 'HABILIDADE': return { bg: purple[100], color: purple[800] };
            case 'SPELL': return { bg: orange[100], color: orange[800] };
            case 'BONUS': return { bg: green[100], color: green[800] };
            default: return { bg: 'grey.200', color: 'grey.800' };
        }
    };

    // Função para traduzir tipo de perk
    const getPerkTypeLabel = (perkType: string) => {
        switch (perkType) {
            case 'WEAPON': return 'Arma';
            case 'ARMOR': return 'Armadura';
            case 'ITEM': return 'Item';
            case 'SKILL':
            case 'HABILIDADE': return 'Habilidade';
            case 'SPELL': return 'Magia';
            case 'BONUS': return 'Bônus';
            case 'EXPERTISE': return 'Perícia';
            default: return perkType;
        }
    };

    return (
        <Box sx={{ width: '100%', pb: 8, position: 'relative' }}>
            <Box sx={{ 
                maxWidth: {
                    xs: '100%',
                    lg: '1400px',
                    xl: '1800px'
                },
                width: '100%',
                mx: 'auto',
                px: { xs: 2, md: 3, lg: 4 },
                '@media (min-width: 2000px)': {
                    maxWidth: '95%'
                }
            }}>
                <Stack spacing={4}>
                    {/* Estatísticas da Campanha */}
                    <Section 
                        title="Estatísticas da Campanha" 
                        icon={
                            <Box 
                                sx={{
                                    p: 1.5,
                                    borderRadius: 2,
                                    bgcolor: blue[100],
                                    border: '2px solid',
                                    borderColor: blue[200]
                                }}
                            >
                                <SupervisorAccount sx={{ color: blue[700], fontSize: '2rem' }} />
                            </Box>
                        }
                    >
                        {isPlayerCharsheetsPending ? (
                            <Box sx={{ p: 2 }}>
                                <Skeleton variant="rounded" height={80} />
                            </Box>
                        ) : (
                            <Box 
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-around',
                                    p: 2,
                                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                                    borderRadius: 2,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    flexWrap: 'wrap',
                                    gap: 2
                                }}
                            >
                                <Stack alignItems="center" spacing={0.5}>
                                    <Typography variant="h4" sx={{ color: blue[600], fontWeight: 700 }}>
                                        {campaignStats.totalPlayers}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Jogadores Total
                                    </Typography>
                                </Stack>
                                <Stack alignItems="center" spacing={0.5}>
                                    <Typography variant="h4" sx={{ color: green[600], fontWeight: 700 }}>
                                        {campaignStats.activePlayers}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Fichas Ativas
                                    </Typography>
                                </Stack>
                                <Stack alignItems="center" spacing={0.5}>
                                    <Typography variant="h4" sx={{ color: orange[600], fontWeight: 700 }}>
                                        {campaignStats.averageLevel}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Nível Médio
                                    </Typography>
                                </Stack>
                                <Stack alignItems="center" spacing={0.5}>
                                    <Typography variant="h4" sx={{ color: purple[600], fontWeight: 700 }}>
                                        {campaignStats.highestLevel}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Maior Nível
                                    </Typography>
                                </Stack>
                            </Box>
                        )}
                    </Section>

                    {/* Lista de Jogadores */}
                    <Section 
                        title="Jogadores da Campanha" 
                        icon={
                            <Box 
                                sx={{
                                    p: 1.5,
                                    borderRadius: 2,
                                    bgcolor: green[100],
                                    border: '2px solid',
                                    borderColor: green[200]
                                }}
                            >
                                <People sx={{ color: green[700], fontSize: '2rem' }} />
                            </Box>
                        }
                    >
                        <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                {playerCharsheets?.length || 0} ficha{(playerCharsheets?.length || 0) !== 1 ? 's' : ''} ativa{(playerCharsheets?.length || 0) !== 1 ? 's' : ''}
                            </Typography>
                            
                            {isPlayerCharsheetsPending ? (
                                <Stack spacing={2}>
                                    <Skeleton variant="rounded" height={140} />
                                    <Skeleton variant="rounded" height={140} />
                                    <Skeleton variant="rounded" height={140} />
                                </Stack>
                            ) : (!playerCharsheets || playerCharsheets.length === 0) ? (
                                <Paper 
                                    sx={{ 
                                        p: 4, 
                                        textAlign: 'center',
                                        border: '2px dashed',
                                        borderColor: 'divider',
                                        bgcolor: 'transparent'
                                    }}
                                >
                                    <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                                        Nenhum jogador encontrado
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Os jogadores da campanha aparecerão aqui quando se juntarem.
                                    </Typography>
                                </Paper>
                            ) : (
                                <Box 
                                    sx={{
                                        display: 'grid',
                                        gridTemplateColumns: {
                                            xs: '1fr',
                                            sm: 'repeat(2, 1fr)',
                                            lg: 'repeat(3, 1fr)'
                                        },
                                        gap: 3
                                    }}
                                >
                                    {playerCharsheets.map(charsheet => (
                                        <PlayerCard
                                            key={charsheet.id}
                                            charsheet={charsheet}
                                        />
                                    ))}
                                </Box>
                            )}
                        </Box>
                    </Section>

                    {/* Seção de Vantagens Adquiridas (apenas Roguelite) */}
                    {campaign.mode === 'Roguelite' && (
                        <Section 
                            title="Vantagens Adquiridas" 
                            icon={
                                <Box 
                                    sx={{
                                        p: 1.5,
                                        borderRadius: 2,
                                        bgcolor: purple[100],
                                        border: '2px solid',
                                        borderColor: purple[200]
                                    }}
                                >
                                    <CardGiftcard sx={{ color: purple[700], fontSize: '2rem' }} />
                                </Box>
                            }
                        >
                            <Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Vantagens obtidas pelos jogadores durante a campanha Roguelite
                                </Typography>
                                
                                {isPlayerCharsheetsPending ? (
                                    <Stack spacing={1}>
                                        <Skeleton variant="rounded" height={60} />
                                        <Skeleton variant="rounded" height={60} />
                                    </Stack>
                                ) : playersWithPerks.length === 0 ? (
                                    <Paper 
                                        sx={{ 
                                            p: 3, 
                                            textAlign: 'center',
                                            border: '2px dashed',
                                            borderColor: 'divider',
                                            bgcolor: 'transparent'
                                        }}
                                    >
                                        <Typography variant="body1" color="text.secondary">
                                            Nenhuma vantagem adquirida ainda
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            As vantagens aparecerão aqui quando os jogadores as selecionarem
                                        </Typography>
                                    </Paper>
                                ) : (
                                    <Stack spacing={1}>
                                        {playersWithPerks.map(player => (
                                            <Accordion 
                                                key={player.charsheetId}
                                                expanded={expandedPlayer === player.charsheetId}
                                                onChange={(_, isExpanded) => setExpandedPlayer(isExpanded ? player.charsheetId : false)}
                                                sx={{
                                                    borderRadius: 2,
                                                    '&:before': { display: 'none' },
                                                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.01)'
                                                }}
                                            >
                                                <AccordionSummary
                                                    expandIcon={<ExpandMore />}
                                                    sx={{ 
                                                        borderRadius: 2,
                                                        '&:hover': { bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }
                                                    }}
                                                >
                                                    <Box display="flex" alignItems="center" gap={2} width="100%">
                                                        <Avatar 
                                                            sx={{ 
                                                                width: 36, 
                                                                height: 36,
                                                                bgcolor: purple[100],
                                                                color: purple[800],
                                                                fontSize: '0.9rem',
                                                                fontWeight: 700
                                                            }}
                                                        >
                                                            {player.charsheetName?.charAt(0)?.toUpperCase() || '?'}
                                                        </Avatar>
                                                        <Box flex={1}>
                                                            <Typography variant="subtitle1" fontWeight={600}>
                                                                {player.charsheetName}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                Nível {player.level}
                                                            </Typography>
                                                        </Box>
                                                        <Chip 
                                                            label={`${player.perks.length} vantagem${player.perks.length !== 1 ? 's' : ''}`}
                                                            size="small"
                                                            sx={{ 
                                                                bgcolor: purple[100], 
                                                                color: purple[800],
                                                                fontWeight: 600
                                                            }}
                                                        />
                                                    </Box>
                                                </AccordionSummary>
                                                <AccordionDetails sx={{ pt: 0 }}>
                                                    <Box 
                                                        sx={{ 
                                                            display: 'flex', 
                                                            flexWrap: 'wrap', 
                                                            gap: 1,
                                                            p: 1,
                                                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.03)',
                                                            borderRadius: 1
                                                        }}
                                                    >
                                                        {player.perks.map((perk: any, index: number) => {
                                                            const typeColor = getPerkTypeColor(perk.perkType);
                                                            return (
                                                                <Tooltip 
                                                                    key={index}
                                                                    title={
                                                                        <Box>
                                                                            <Typography variant="subtitle2">{perk.name}</Typography>
                                                                            {perk.description && (
                                                                                <Typography variant="caption">{perk.description}</Typography>
                                                                            )}
                                                                        </Box>
                                                                    }
                                                                    arrow
                                                                >
                                                                    <Chip
                                                                        icon={
                                                                            <Typography sx={{ fontSize: '0.9rem', ml: 0.5 }}>
                                                                                {iconForRarity(perk.rarity)}
                                                                            </Typography>
                                                                        }
                                                                        label={
                                                                            <Box display="flex" alignItems="center" gap={0.5}>
                                                                                <Typography variant="caption" fontWeight={600}>
                                                                                    {perk.name}
                                                                                </Typography>
                                                                                <Chip 
                                                                                    label={getPerkTypeLabel(perk.perkType)}
                                                                                    size="small"
                                                                                    sx={{ 
                                                                                        height: 18,
                                                                                        fontSize: '0.65rem',
                                                                                        bgcolor: typeColor.bg,
                                                                                        color: typeColor.color
                                                                                    }}
                                                                                />
                                                                            </Box>
                                                                        }
                                                                        size="medium"
                                                                        sx={{
                                                                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.9)',
                                                                            border: '1px solid',
                                                                            borderColor: 'divider',
                                                                            cursor: 'pointer',
                                                                            '&:hover': {
                                                                                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,1)'
                                                                            }
                                                                        }}
                                                                    />
                                                                </Tooltip>
                                                            );
                                                        })}
                                                    </Box>
                                                </AccordionDetails>
                                            </Accordion>
                                        ))}
                                    </Stack>
                                )}
                            </Box>
                        </Section>
                    )}
                </Stack>
            </Box>
            <Snackbar />
        </Box>
    )
}
