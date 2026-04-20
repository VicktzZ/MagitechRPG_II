/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
'use client'

import { useCampaignContext } from '@contexts';
import { useChatContext } from '@contexts/chatContext';
import { useFirestoreRealtime } from '@hooks/useFirestoreRealtime';
import {
    CardGiftcard,
    ExpandMore,
    People,
    SupervisorAccount,
    Pets,
    Person,
    Delete as DeleteIcon,
    Search as SearchIcon,
    Edit as EditIcon,
    Casino,
    TrendingUp,
    Star,
    EmojiEvents
} from '@mui/icons-material';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Avatar,
    Box,
    Chip,
    Button,
    IconButton,
    Paper,
    Skeleton,
    Snackbar,
    Stack,
    Tooltip,
    Typography,
    useTheme
} from '@mui/material';
import { amber, blue, green, grey, orange, purple, red } from '@mui/material/colors';
import { MessageType } from '@enums';
import { type ReactElement, useMemo, useState } from 'react';
import PlayerCard from './PlayerCard';
import CreatureCreator from './CreatureCreator';

interface SectionProps {
    title: string;
    icon: React.ReactElement;
    children: React.ReactNode;
    sx?: any;
}

const getGMExpertiseLevel = (value: number): 'novice' | 'trained' | 'expert' | 'master' | 'legendary' => {
    if (value < 2) return 'novice';
    if (value < 5) return 'trained';
    if (value < 7) return 'expert';
    if (value < 9) return 'master';
    return 'legendary';
};

const getGMExpertiseConfig = (value: number) => {
    const level = getGMExpertiseLevel(value);

    switch (level) {
    case 'novice':
        return {
            color: grey[600],
            bg: grey[100],
            label: 'Destreinado',
            icon: Person
        };
    case 'trained':
        return {
            color: green[600],
            bg: green[100],
            label: 'Treinado',
            icon: TrendingUp
        };
    case 'expert':
        return {
            color: blue[600],
            bg: blue[100],
            label: 'Especialista',
            icon: Star
        };
    case 'master':
        return {
            color: purple[600],
            bg: purple[100],
            label: 'Mestre',
            icon: EmojiEvents
        };
    case 'legendary':
    default:
        return {
            color: orange[600],
            bg: orange[100],
            label: 'Lendário',
            icon: Casino
        };
    }
};

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
    const { campaign, users, charsheets, updateCampaign } = useCampaignContext()
    const { handleSendMessage, setIsChatOpen, isChatOpen } = useChatContext()
    
    const theme = useTheme();
    const [ expandedPlayer, setExpandedPlayer ] = useState<string | false>(false);
    const [ creatureModalOpen, setCreatureModalOpen ] = useState(false);
    const [ selectedCreature, setSelectedCreature ] = useState<any | null>(null);
    const [ selectedCreatureReadOnly, setSelectedCreatureReadOnly ] = useState(false);
    
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

    // Obter criatura atualmente em turno (apenas para destaque)
    const currentCreatureInTurn = useMemo(() => {
        const combat: any = (campaign as any).session?.combat;
        const creatures = campaign.custom?.creatures || [];

        if (!combat?.isActive || !Array.isArray(combat.combatants) || combat.combatants.length === 0) {
            return null;
        }

        const current = combat.combatants[combat.currentTurnIndex];
        
        if (!current || current.type !== 'creature') return null;

        const rawId: string = current.id;
        let baseId: string = rawId;

        const lastDashIndex = rawId?.lastIndexOf('-') ?? -1;
        if (lastDashIndex > 0) {
            const possibleBaseId = rawId.slice(0, lastDashIndex);
            if (creatures.some((c: any) => c.id === possibleBaseId)) {
                baseId = possibleBaseId;
            }
        }

        const baseCreature = creatures.find((c: any) => c.id === baseId);
        if (!baseCreature) return null;

        return {
            combatant: current,
            creature: baseCreature
        };
    }, [ campaign.custom?.creatures, campaign.session?.combat ]);

    // Obter TODAS as criaturas ativas no combate
    const allCreaturesInCombat = useMemo(() => {
        const combat: any = (campaign as any).session?.combat;
        const creatures = campaign.custom?.creatures || [];

        if (!combat?.isActive || !Array.isArray(combat.combatants) || combat.combatants.length === 0) {
            return [];
        }

        return combat.combatants
            .filter((combatant: any) => combatant.type === 'creature')
            .map((combatant: any) => {
                const rawId: string = combatant.id;
                let baseId: string = rawId;

                const lastDashIndex = rawId?.lastIndexOf('-') ?? -1;
                if (lastDashIndex > 0) {
                    const possibleBaseId = rawId.slice(0, lastDashIndex);
                    if (creatures.some((c: any) => c.id === possibleBaseId)) {
                        baseId = possibleBaseId;
                    }
                }

                const baseCreature = creatures.find((c: any) => c.id === baseId);
                if (!baseCreature) return null;

                return {
                    combatant,
                    creature: baseCreature,
                    isCurrentTurn: combat.combatants[combat.currentTurnIndex]?.id === combatant.id
                };
            })
            .filter(Boolean);
    }, [ campaign.custom?.creatures, campaign.session?.combat ]);

    const handleCreatureExpertiseRoll = async (expertiseName: string, expertise: any, specificCreature?: any, specificCombatant?: any) => {
        // Use criatura específica se fornecida, senão usa a atual em turno
        let creature, combatant;
        if (specificCreature && specificCombatant) {
            creature = specificCreature;
            combatant = specificCombatant;
        } else if (currentCreatureInTurn) {
            const data = currentCreatureInTurn as any;
            creature = data.creature;
            combatant = data.combatant;
        } else {
            return;
        }
        const expertiseValue = Number(expertise?.value ?? 0) || 0;

        const defaultAttrKey = expertise?.defaultAttribute as keyof typeof creature.attributes | null;
        let numDice = 1;

        if (defaultAttrKey) {
            const attrValue = Number(creature.attributes?.[defaultAttrKey] ?? 0) || 0;
            // Nova fórmula: 0=-1, 5=1, 10=2, 15=3, 20=4, 30+=5
            let attrMod = attrValue === 0 ? -1 : Math.min(5, Math.floor(attrValue / 5));
            if (!Number.isFinite(attrMod)) attrMod = 1;
            numDice = attrMod;
        }

        if (!Number.isFinite(numDice) || numDice < 1) numDice = 1;

        const rolls: number[] = [];
        for (let i = 0; i < numDice; i++) {
            rolls.push(Math.floor(Math.random() * 20) + 1);
        }

        const bestRoll = rolls.length > 1 ? Math.max(...rolls) : rolls[0];
        const total = bestRoll + expertiseValue;
        const rollPart = rolls.length > 1
            ? `${rolls.join(', ')}: ${bestRoll}`
            : `${bestRoll}`;

        const creatureName = combatant?.name || creature.name || 'Criatura';

        const text = `🎲 [${creatureName}] ${expertiseName.toUpperCase()} - ${numDice}d20${expertiseValue >= 0 ? '+' : ''}${expertiseValue}: [${rollPart}] = ${total}`;

        await handleSendMessage(text, MessageType.EXPERTISE);

        if (!isChatOpen) {
            setIsChatOpen(true);
        }
    };

    // Extrai vantagens adquiridas por cada jogador (apenas para Roguelite)
    const playersWithPerks = useMemo(() => {
        if (campaign.mode !== 'Roguelite' || !playerCharsheets) return [];
        
        return playerCharsheets.map(charsheet => {
            // Busca a sessão da campanha atual
            const session = charsheet.session?.find((s: any) => s.campaignCode === campaign.campaignCode);
            const perks = session?.perks || [];
            
            // Busca dados do usuário para pegar a foto
            const user = users.players?.find(p => p.id === charsheet.userId);
            
            return {
                charsheetId: charsheet.id,
                charsheetName: charsheet.name,
                level: charsheet.level,
                perks,
                userImage: user?.image || null,
                userName: user?.name || charsheet.name
            };
        }).filter(p => p.perks.length > 0);
    }, [ campaign.mode, campaign.campaignCode, playerCharsheets, users.players ]);

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

    // Função para deletar criatura customizada
    const handleDeleteCreature = async (creatureId: string, creatureName: string) => {
        if (!confirm(`Tem certeza que deseja excluir a criatura "${creatureName}"?`)) return;
        
        try {
            const response = await fetch(`/api/campaign/${campaign.id}/custom/creatures`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ creatureId })
            });
            
            if (!response.ok) {
                throw new Error('Erro ao excluir criatura');
            }
            
            // Atualiza o contexto da campanha
            updateCampaign({
                ...campaign,
                custom: {
                    ...campaign.custom,
                    creatures: (campaign.custom?.creatures || []).filter((c: any) => c.id !== creatureId)
                }
            });
        } catch (error) {
            console.error('Erro ao deletar criatura:', error);
            alert('Erro ao excluir criatura');
        }
    };

    const handleViewCreature = (creature: any) => {
        setSelectedCreature(creature);
        setSelectedCreatureReadOnly(true);
        setCreatureModalOpen(true);
    };

    const handleEditCreature = (creature: any) => {
        setSelectedCreature(creature);
        setSelectedCreatureReadOnly(false);
        setCreatureModalOpen(true);
    };

    const handleCreatureSaved = async (creature: any) => {
        const existingCreatures = campaign.custom?.creatures || [];
        const index = existingCreatures.findIndex((c: any) => c.id === creature.id);

        const updatedCreatures = index === -1
            ? [ ...existingCreatures, creature ]
            : existingCreatures.map((c: any) => c.id === creature.id ? { ...c, ...creature } : c);

        await updateCampaign({
            ...campaign,
            custom: {
                ...campaign.custom,
                creatures: updatedCreatures
            }
        });
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
                                                            src={player.userImage || undefined}
                                                            sx={{ 
                                                                width: 44, 
                                                                height: 44,
                                                                bgcolor: purple[100],
                                                                color: purple[800],
                                                                fontSize: '1rem',
                                                                fontWeight: 700,
                                                                border: '2px solid',
                                                                borderColor: purple[300]
                                                            }}
                                                        >
                                                            {!player.userImage && (player.charsheetName?.charAt(0)?.toUpperCase() || '?')}
                                                        </Avatar>
                                                        <Box flex={1}>
                                                            <Typography variant="subtitle1" fontWeight={600}>
                                                                {player.charsheetName}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                Nível {player.level} • {player.userName}
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
                                                                                <Chip 
                                                                                    label={getPerkTypeLabel(perk.rarity)}
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

                    {/* Ficha das criaturas em combate (sempre visível durante combate) */}
                    {(() => {
                        return true;
                    })() && allCreaturesInCombat.length > 0 && (
                        <Section 
                            title="Criaturas em Combate" 
                            icon={
                                <Box 
                                    sx={{
                                        p: 1.5,
                                        borderRadius: 2,
                                        bgcolor: orange[100],
                                        border: '2px solid',
                                        borderColor: orange[200]
                                    }}
                                >
                                    <Pets sx={{ color: orange[700], fontSize: '2rem' }} />
                                </Box>
                            }
                        >
                            <Box>
                                {allCreaturesInCombat.map((creatureData: any, index: number) => {
                                    if (!creatureData) return null;
                                    const { combatant, creature, isCurrentTurn } = creatureData;
                                    const expertisesEntries = Object.entries(creature.expertises || {});

                                    return (
                                        <Paper
                                            key={combatant.id}
                                            sx={{
                                                p: 2,
                                                mb: index < allCreaturesInCombat.length - 1 ? 2 : 0,
                                                border: isCurrentTurn ? '3px solid' : '1px solid',
                                                borderColor: isCurrentTurn ? orange[500] : 'divider',
                                                borderRadius: 2,
                                                bgcolor: isCurrentTurn 
                                                    ? theme.palette.mode === 'dark' ? orange[900] + '20' : orange[50]
                                                    : theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.01)',
                                                position: 'relative',
                                                '&::before': isCurrentTurn ? {
                                                    content: '"🎯 Vez desta criatura"',
                                                    position: 'absolute',
                                                    top: -12,
                                                    left: 16,
                                                    bgcolor: orange[500],
                                                    color: 'white',
                                                    px: 1.5,
                                                    py: 0.5,
                                                    borderRadius: 1,
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    zIndex: 1
                                                } : {}
                                            }}
                                        >
                                            <Stack spacing={2}>
                                                <Box display="flex" alignItems="center" gap={2}>
                                                    <Avatar sx={{ 
                                                        bgcolor: isCurrentTurn ? orange[200] : orange[100], 
                                                        color: isCurrentTurn ? orange[900] : orange[800],
                                                        border: isCurrentTurn ? '2px solid' : 'none',
                                                        borderColor: orange[500]
                                                    }}>
                                                        <Pets />
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="subtitle1" fontWeight={700}>
                                                            {combatant?.name || creature.name}
                                                            {isCurrentTurn && (
                                                                <Chip 
                                                                    label="EM TURNO" 
                                                                    size="small" 
                                                                    sx={{ 
                                                                        ml: 1, 
                                                                        bgcolor: orange[500], 
                                                                        color: 'white',
                                                                        fontWeight: 700,
                                                                        fontSize: '0.65rem'
                                                                    }} 
                                                                />
                                                            )}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Nível {creature.level} • LP {combatant.currentLp ?? creature.stats?.lp ?? 0}/{combatant.maxLp ?? creature.stats?.maxLp ?? creature.stats?.lp ?? 0} • MP {combatant.currentMp ?? creature.stats?.mp ?? 0}/{combatant.maxMp ?? creature.stats?.maxMp ?? creature.stats?.mp ?? 0}
                                                        </Typography>
                                                    </Box>
                                                </Box>

                                                {/* Lista de Perícias da Criatura */}
                                                {expertisesEntries.length === 0 ? (
                                                    <Paper 
                                                        sx={{ 
                                                            p: 2, 
                                                            textAlign: 'center',
                                                            border: '2px dashed',
                                                            borderColor: 'divider',
                                                            bgcolor: 'transparent'
                                                        }}
                                                    >
                                                        <Typography variant="body2" color="text.secondary">
                                                            Esta criatura não possui perícias configuradas.
                                                        </Typography>
                                                    </Paper>
                                                ) : (
                                                    <Box 
                                                        sx={{
                                                            display: 'grid',
                                                            gridTemplateColumns: {
                                                                xs: 'repeat(2, 1fr)',
                                                                sm: 'repeat(3, 1fr)',
                                                                md: 'repeat(4, 1fr)'
                                                            },
                                                            gap: 1.5
                                                        }}
                                                    >
                                                        {expertisesEntries.map(([ nome, expertise ]: any) => {
                                                            const config = getGMExpertiseConfig(expertise.value ?? 0);
                                                            const IconComponent = config.icon;

                                                            return (
                                                                <Button
                                                                    key={`${combatant.id}-${nome}`}
                                                                    fullWidth
                                                                    onClick={async () => await handleCreatureExpertiseRoll(nome, expertise, creature, combatant)}
                                                                    disabled={false}
                                                                    sx={{
                                                                        p: 1.5,
                                                                        bgcolor: config.bg + '40',
                                                                        border: '1px solid',
                                                                        borderColor: config.color + '40',
                                                                        borderRadius: 2,
                                                                        justifyContent: 'flex-start',
                                                                        textAlign: 'left',
                                                                        textTransform: 'none',
                                                                        opacity: 1,
                                                                        '&:hover': {
                                                                            bgcolor: config.bg + '60',
                                                                            borderColor: config.color + '80',
                                                                            transform: 'translateY(-2px)',
                                                                            boxShadow: 3
                                                                        }
                                                                    }}
                                                                >
                                                                    <Stack spacing={1} width="100%">
                                                                        <Box display="flex" alignItems="center" gap={1}>
                                                                            <Box 
                                                                                sx={{
                                                                                    p: 0.8,
                                                                                    borderRadius: 1,
                                                                                    bgcolor: config.color + '20',
                                                                                    border: '1px solid',
                                                                                    borderColor: config.color + '40'
                                                                                }}
                                                                            >
                                                                                <IconComponent 
                                                                                    sx={{ 
                                                                                        color: config.color,
                                                                                        fontSize: '1.1rem'
                                                                                    }} 
                                                                                />
                                                                            </Box>
                                                                            <Typography 
                                                                                variant="subtitle2" 
                                                                                sx={{ 
                                                                                    fontWeight: 600,
                                                                                    flex: 1
                                                                                }}
                                                                            >
                                                                                {nome}
                                                                            </Typography>
                                                                        </Box>
                                                                        <Box display="flex" gap={1} flexWrap="wrap" justifyContent="space-between">
                                                                            <Chip 
                                                                                label={`${expertise.value >= 0 ? '+' : ''}${expertise.value}`}
                                                                                size="small"
                                                                                sx={{
                                                                                    bgcolor: config.color,
                                                                                    color: 'white',
                                                                                    fontWeight: 700,
                                                                                    fontSize: '0.75rem'
                                                                                }}
                                                                            />
                                                                            {expertise.defaultAttribute && (
                                                                                <Chip 
                                                                                    label={(expertise.defaultAttribute as string).toUpperCase()}
                                                                                    size="small"
                                                                                    sx={{
                                                                                        bgcolor: 'rgba(0,0,0,0.04)',
                                                                                        fontWeight: 600,
                                                                                        fontSize: '0.7rem'
                                                                                    }}
                                                                                />
                                                                            )}
                                                                            <Chip 
                                                                                label={getGMExpertiseLevel(expertise.value).replace(/^(\w)/, (_, c) => c.toUpperCase())}
                                                                                size="small"
                                                                                variant="outlined"
                                                                                sx={{
                                                                                    borderColor: config.color + '60',
                                                                                    color: config.color,
                                                                                    fontWeight: 600,
                                                                                    fontSize: '0.7rem'
                                                                                }}
                                                                            />
                                                                        </Box>
                                                                    </Stack>
                                                                </Button>
                                                            );
                                                        })}
                                                    </Box>
                                                )}
                                            </Stack>
                                        </Paper>
                                    );
                                })}
                            </Box>
                        </Section>
                    )}

                    {/* Seção de Criaturas Customizadas */}
                    {campaign.custom?.creatures && campaign.custom.creatures.length > 0 && (
                        <Section 
                            title="Criaturas Customizadas" 
                            icon={
                                <Box 
                                    sx={{
                                        p: 1.5,
                                        borderRadius: 2,
                                        bgcolor: orange[100],
                                        border: '2px solid',
                                        borderColor: orange[200]
                                    }}
                                >
                                    <Pets sx={{ color: orange[700], fontSize: '2rem' }} />
                                </Box>
                            }
                        >
                            <Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Criaturas criadas para esta campanha
                                </Typography>
                                
                                <Stack spacing={1}>
                                    {campaign.custom.creatures.map((creature: any) => (
                                        <Paper
                                            key={creature.id}
                                            sx={{
                                                p: 2,
                                                border: '1px solid',
                                                borderColor: 'divider',
                                                borderRadius: 2,
                                                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.01)'
                                            }}
                                        >
                                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                                <Box display="flex" alignItems="center" gap={2}>
                                                    <Avatar sx={{ bgcolor: orange[100], color: orange[800] }}>
                                                        <Pets />
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="subtitle1" fontWeight={600}>
                                                            {creature.name}
                                                        </Typography>
                                                        <Box display="flex" gap={0.5} mt={0.5} flexWrap="wrap">
                                                            <Chip 
                                                                label={`Nível ${creature.level}`} 
                                                                size="small" 
                                                                sx={{ height: 20, fontSize: '0.65rem', bgcolor: green[100], color: green[800] }} 
                                                            />
                                                            <Chip 
                                                                label={`LP: ${creature.stats?.lp || 0}`} 
                                                                size="small" 
                                                                sx={{ height: 20, fontSize: '0.65rem', bgcolor: red[100], color: red[800] }} 
                                                            />
                                                            <Chip 
                                                                label={`MP: ${creature.stats?.mp || 0}`} 
                                                                size="small" 
                                                                sx={{ height: 20, fontSize: '0.65rem', bgcolor: blue[100], color: blue[800] }} 
                                                            />
                                                            {creature.skills?.length > 0 && (
                                                                <Chip 
                                                                    label={`${creature.skills.length} habilidade(s)`} 
                                                                    size="small" 
                                                                    sx={{ height: 20, fontSize: '0.65rem', bgcolor: purple[100], color: purple[800] }} 
                                                                />
                                                            )}
                                                            {creature.spells?.length > 0 && (
                                                                <Chip 
                                                                    label={`${creature.spells.length} magia(s)`} 
                                                                    size="small" 
                                                                    sx={{ height: 20, fontSize: '0.65rem', bgcolor: amber[100], color: amber[800] }} 
                                                                />
                                                            )}
                                                        </Box>
                                                        {creature.description && (
                                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                                                {creature.description}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </Box>
                                                <Box display="flex" alignItems="center" gap={0.5}>
                                                    <Tooltip title="Ver detalhes da criatura">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleViewCreature(creature)}
                                                            sx={{ 
                                                                color: blue[500],
                                                                '&:hover': { 
                                                                    bgcolor: blue[50],
                                                                    color: blue[700]
                                                                }
                                                            }}
                                                        >
                                                            <SearchIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Editar criatura">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleEditCreature(creature)}
                                                            sx={{ 
                                                                color: purple[500],
                                                                '&:hover': { 
                                                                    bgcolor: purple[50],
                                                                    color: purple[700]
                                                                }
                                                            }}
                                                        >
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Excluir criatura">
                                                        <IconButton
                                                            size="small"
                                                            onClick={async () => await handleDeleteCreature(creature.id, creature.name)}
                                                            sx={{ 
                                                                color: red[400],
                                                                '&:hover': { 
                                                                    bgcolor: red[50],
                                                                    color: red[600]
                                                                }
                                                            }}
                                                        >
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </Box>
                                        </Paper>
                                    ))}
                                </Stack>
                            </Box>
                        </Section>
                    )}
                </Stack>
            </Box>
            <Snackbar />

            <CreatureCreator
                open={creatureModalOpen}
                onClose={() => {
                    setCreatureModalOpen(false);
                    setSelectedCreature(null);
                }}
                editingCreature={selectedCreature || undefined}
                readOnly={selectedCreatureReadOnly}
                onSave={handleCreatureSaved}
            />
        </Box>
    )
}
